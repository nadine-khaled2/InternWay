using Hangfire;
using InternWay.DTOs;
using InternWay.DTOs.AIModels;
using InternWay.DTOs.StudentModels;
using InternWay.IServices;
using InternWay.Models.auth_schema;
using InternWay.Models.company_schema;
using InternWay.Models.mentor_schema;
using InternWay.Models.PaymentSystem;
using InternWay.Models.student_schema;
using InternWay.Services.MentorServices;
using InternWay.Services.PaymentServices;
using InternWay.Services.Share;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.IdentityModel.Tokens;
using SendGrid.Helpers.Mail;
using System.Collections.Frozen;
using System.Collections.Generic;
using System.Globalization;
using System.Numerics;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using static InternWay.Models.company_schema.Internship;
using static InternWay.Models.mentor_schema.Mentorship_Session;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace InternWay.Services.StudentServices
{
    public class servicesOfStudent : IServicesOfStudent
    {
        private readonly UserManager<User> userManager;
        private readonly CloudinaryService cloudinary;
        private readonly ServicesExternalAi servicesExternalAi;
        private readonly InternShipWayDB internShipWay;
        private readonly IServicesOfInternship servicesOfInternship;
        private readonly PaymentSystem paymentSystem;
        private readonly InternWay.IServices.INotificationService _notificationService;

        public servicesOfStudent(IServicesOfMentor servicesOfMentor
            , UserManager<User> userManager
            , CloudinaryService cloudinary
            , ServicesExternalAi servicesExternalAi
            , InternShipWayDB internShipWay
            , IServicesOfInternship servicesOfInternship
            , PaymentSystem paymentSystem
            , InternWay.IServices.INotificationService notificationService
           )
        {
            this.userManager = userManager;
            this.cloudinary = cloudinary;
            this.servicesExternalAi = servicesExternalAi;
            this.internShipWay = internShipWay;
            this.servicesOfInternship = servicesOfInternship;
            this.paymentSystem = paymentSystem;
            _notificationService = notificationService;
        }
        public override async Task<(MentorDetailsDataForStudentDto, int StatusCode, string message)> GetDetailsOfMentorForStudent(int mentorId)
        {
            try
            {
                List<string> Experiences = new List<string>();

                MentorDetailsDataForStudentDto mentorData = new MentorDetailsDataForStudentDto();

                var mentor = await internShipWay.Mentors
                    .Where(e => e.Mentor_Id == mentorId)
                      .Include(e => e.User)
                      .Include(e => e.skills)
                      .Include(e => e.Experiences)
                      .Include(e => e.mentor_Availabilities)
                      .ThenInclude(e => e.mentorship_Session)
                      .FirstOrDefaultAsync();

                if (mentor == null)
                    return (mentorData, 404, "No mentor found.");


                var IsAvailable = mentor.mentor_Availabilities?
                    .Any(e =>
                    {
                        var date = DateTime.SpecifyKind(
                            e.date.ToDateTime(e.start_time), DateTimeKind.Utc
                            );


                        return !e.is_booked && date >= DateTime.UtcNow;
                    }) ?? false;

                mentorData.mentorId = mentor.Mentor_Id;

                mentorData.mentorName = mentor.User.Full_Name;

                mentorData.jobTitle = mentor.Job_Title;

                mentorData.yearsExperience = mentor.Years_Experience;

                mentorData.avgRating = mentor.AvgRating;

                mentorData.countReviewers = mentor.CountReviewers;

                mentorData.description = mentor.description;

                mentorData.IsAvailable = IsAvailable;

                mentorData.skills = mentor.skills.Select(e => e.Skill_Name).ToList();

                mentorData.totalSessions = mentor.mentor_Availabilities?.Count(e => e.is_booked) ?? 0;

                mentorData.numMenteesHired = mentor.mentor_Availabilities?
                    .Where(a => a.mentorship_Session != null)
                    .SelectMany(e => e.mentorship_Session)
                    .Where(e => e.status_session == Status_Session.Completed)
                    .DistinctBy(e => e.student_id).Count() ?? 0;

                if (mentor.Experiences == null || !mentor.Experiences.Any())
                {
                    mentorData.experiences = null;
                    return (mentorData, 200, "Mentor retrieved successfully.");
                }

                foreach (var exper in mentor.Experiences ?? new List<Experience>())
                {
                    var experience = exper.title;

                    Experiences.Add(experience);

                }

                mentorData.experiences = Experiences;



                return (mentorData, 200, "Mentor retrieved successfully.");
            }
            catch (Exception)
            {
                return (new MentorDetailsDataForStudentDto(), 500, "Something went wrong while processing your request. Please try again.");
            }

        }
        public override async Task<(List<SessionDto>?, int StatusCode, string message)> GetAllSortedBookedSessionByStudent(int UserId)
        {
            try
            {
                var student = await internShipWay.Students
                       .Include(s => s.mentorship_Sessions)
                       .ThenInclude(s => s.mentor_availability)
                       .ThenInclude(s => s.Mentor)
                       .ThenInclude(m => m.User)
                       .FirstOrDefaultAsync(e => e.user_id == UserId);

                if (student == null)
                    return (null, 401, "User not authenticated");

                if (student.mentorship_Sessions == null || !student.mentorship_Sessions.Any())
                    return (null, 404, "No sessions found for this user.");


                var sessionsToExpire = student.mentorship_Sessions
                    .Where(s =>
                    {
                        var startUtc = DateTime.SpecifyKind(
                            s.mentor_availability.date.ToDateTime(
                                s.mentor_availability.start_time),
                            DateTimeKind.Utc);

                        var endUtc = startUtc.Add(
                            s.mentor_availability.Duration);

                        return endUtc < DateTime.UtcNow
                            && (s.status_session == Status_Session.Pending
                             || s.status_session == Status_Session.Confirmed
                             || s.status_session == Status_Session.InProgress);
                    })
                    .ToList();

                foreach (var session in sessionsToExpire)
                {
                    session.status_session = Status_Session.Expired;
                }

                if (sessionsToExpire.Any())
                {
                    await internShipWay.SaveChangesAsync();
                }


                var sessions = student.mentorship_Sessions.OrderBy(e => e.created_at)
                    .Select(e =>
                    {
                        var DateTimUTC = DateTime.SpecifyKind(
                                e.mentor_availability.date.ToDateTime(e.mentor_availability.start_time), DateTimeKind.Utc
                                );
                        var EndDateUTC = DateTimUTC.Add(e.mentor_availability.Duration);
                        var IsExpired = EndDateUTC < DateTime.UtcNow;
                        var startDateLocal = DateTimUTC.ToLocalTime();
                        DateOnly date = DateOnly.FromDateTime(startDateLocal);
                        TimeOnly StartTime = TimeOnly.FromDateTime(startDateLocal);

                        var IsPaid = e.mentor_availability.paid_status == Internship.Baid_Status.Paid;

                        return new SessionDto
                        (
                        session_id: e.session_id,

                        mentor_id: e.mentor_availability.mentor_id,

                        mentorName: e.mentor_availability.Mentor?.User?.Full_Name ?? string.Empty,

                        date: date.ToString("MMM d, yyyy", CultureInfo.InvariantCulture),

                        start_time: StartTime.ToString("h:mm tt", CultureInfo.InvariantCulture),

                        end_time: (StartTime
                        .Add(e.mentor_availability.Duration))
                        .ToString("h:mm tt", CultureInfo.InvariantCulture),

                        topic: e.topic.ToDisplay(),

                        status:
   
                        e.status_session == Status_Session.Completed ||
   
                        e.status_session == Status_Session.Cancelled
      
                        ? e.status_session.ToString()
     
                        : IsExpired
         
                        ? Status_Session.Expired.ToString()
          
                        : e.status_session.ToString(),
                     
                        isPaid: IsPaid
                        );
                    }).ToList();

                return (sessions, 200, "Sessions of this student retrieved successfully.");
            }
            catch (Exception)
            {
                return (null, 500, "Something went wrong while processing your request. Please try again.");
            }
        }
        public override async Task<(string? link, int statusCode, string message)> JoinMeeting(int sessionId, int userId)
        {
            try
            {
                var user = await internShipWay.Students
                    .Include(e => e.mentorship_Sessions)
                    .ThenInclude(e => e.mentor_availability)
                    .FirstOrDefaultAsync(e => e.user_id == userId);
                if (user == null)
                    return (null, 401, "User not authenticated");

                if (user.mentorship_Sessions == null || !user.mentorship_Sessions.Any())
                    return (null, 404, "No sessions found for this student.");

                var session = user.mentorship_Sessions.FirstOrDefault(e => e.session_id == sessionId);
                if (session == null)
                    return (null, 404, "Session not found.");

                if (session.student_id != user.Student_Id)
                    return (null, 403, "You are not allowed to access this session.");

                var slot = session.mentor_availability;
                if (slot == null)
                    return (null, 400, "This session has no associated slot.");

                if (string.IsNullOrEmpty(slot.session_link))
                    return (null, 400, "Session link is not available yet. Please try again later.");

                if (session.status_session == Status_Session.Completed)
                    return (null, 400, "This session has already been completed.");

                if (session.status_session != Status_Session.Confirmed
                   && session.status_session != Status_Session.Started
                   && session.status_session != Status_Session.InProgress)
                    return (null, 400, "This session is not available for joining.");

                var sessionStart = DateTime.SpecifyKind(slot.date.ToDateTime(slot.start_time)
                    , DateTimeKind.Utc);

                var EndSession = sessionStart
                   .Add(slot.Duration);

                if (DateTime.UtcNow < sessionStart.AddMinutes(-5))
                    return (null, 400, "You can join the session only 5 minutes before it starts.");

                if (DateTime.UtcNow >= EndSession)
                    return (null, 400, "The session end time has passed. You can no longer join.");
                var alreadyJoined = session.StudentJoinedAt != null;

                if (!alreadyJoined)
                    session.StudentJoinedAt = DateTime.UtcNow;

                if (session.StudentJoinedAt != null && session.MentorJoinedAt != null)
                    session.status_session = Status_Session.Started;
                else
                    session.status_session = Status_Session.InProgress;

                await internShipWay.SaveChangesAsync();

                var EndSessionTime = DateTime.SpecifyKind(EndSession, DateTimeKind.Utc);

                if (!alreadyJoined)
                    BackgroundJob.Schedule<servicesOfStudent>(e => e.CompleteSession(session.session_id), EndSessionTime);

                if (alreadyJoined)
                    return (slot.session_link, 200, "You already joined the session.");

                return (slot.session_link, 200, "Joined successfully. You can start the session now.");

            }
            catch (Exception)
            {
                return (null, 500, "Something went wrong while processing your request. Please try again.");
            }
        }
        public override async Task<(List<AvailableSessionsofMentorDto>?, int StatusCode, string message)> GetAllAvailabilitiesOfMentor(int mentorId)
        {
            try
            {
                var slots = await internShipWay.Mentor_Availabilities
                      .Where(e => e.mentor_id == mentorId && e.is_booked == false)
                      .Select(e => new
                      {
                          slotId = e.Slot_Id,
                          date = e.date.ToDateTime(e.start_time)

                      }
                      ).ToListAsync();

                if (slots == null || !slots.Any())
                    return (null, 404, "No available slots for this mentor");

                var ValidSlots = slots.Where(e =>
                {
                    var Date = DateTime.SpecifyKind(e.date, DateTimeKind.Utc);
                    return Date >= DateTime.UtcNow;
                }).Select(e => {
                    var Date = DateTime.SpecifyKind(e.date, DateTimeKind.Utc);
                    return new AvailableSessionsofMentorDto()
                    {
                        slotId = e.slotId,
                        date = FormatingDate(Date)
                    };
                }).ToList();


                if (ValidSlots == null || !ValidSlots.Any())
                    return (null, 404, "No available slots for this mentor");

                return (ValidSlots, 200, "Available slots found.");
            }
            catch (Exception)
            {
                return (null, 500, "Something went wrong while processing your request. Please try again.");

            }

        }
        public override async Task<(int statusCode, string message, int? sessionId)> addSession(int slotId, int UserId, int TopicId)
        {
            using var transaction = await internShipWay.Database.BeginTransactionAsync();
            try
            {

                var student = await internShipWay.Students
                    .Include(e => e.Session_Limitation)
                    .Include(e => e.User)
                    .FirstOrDefaultAsync(e => e.user_id == UserId);

                if (student == null)
                {
                    await transaction.RollbackAsync();
                    return (401, "User not authenticated", null);
                }

                var slot = await internShipWay.Mentor_Availabilities
                .SingleOrDefaultAsync(e => e.Slot_Id == slotId);

                if (slot == null || slot.is_booked)
                {
                    await transaction.RollbackAsync();
                    return (404, "This slot is unavailable. Please choose another time.", null);
                }

                var DateOfSlot = DateTime.SpecifyKind(slot.date.ToDateTime(slot.start_time), DateTimeKind.Utc);

                if (DateOfSlot <= DateTime.UtcNow)
                {
                    await transaction.RollbackAsync();
                    return (400, "Slot already expired", null);
                }

                if (student.Session_Limitation?.BookingBlockedUntil != null)
                {
                    var BooKingBlockDate = DateTime
                        .SpecifyKind(student.Session_Limitation.BookingBlockedUntil.Value, DateTimeKind.Utc);

                    if (BooKingBlockDate > DateTime.UtcNow)
                    {
                        await transaction.RollbackAsync();
                        return (404, $"You are blocked from booking sessions until {student.Session_Limitation.BookingBlockedUntil.Value:yyyy-MM-dd}", null);
                    }
                }

                if (!Enum.IsDefined(typeof(Topic), TopicId))
                {
                    await transaction.RollbackAsync();
                    return (400, "Invalid topic.", null);
                }


                slot.is_booked = true;
                var session = new Mentorship_Session()
                {
                    slot_id = slotId,
                    student_id = student.Student_Id,
                    topic = (Topic)TopicId,
                };

                if (student.Session_Limitation == null)
                {
                    student.Session_Limitation = new Student_Session_limitation()
                    {
                        StudentId = student.Student_Id,
                    };
                    await internShipWay.Student_Session_Limitations.AddAsync(student.Session_Limitation);
                }

                await internShipWay.mentorship_Sessions.AddAsync(session);

                if (slot.paid_status == Internship.Baid_Status.Paid)
                {
                    var payment = new Payment
                    {
                        Session = session,
                        StudentId = student.Student_Id,
                        Amount = slot.priceSlot,
                        Status = PaymentStatus.Pending,
                        RefundStatus = RefundStatus.None
                    };

                    await internShipWay.Payments.AddAsync(payment);

                }
                await internShipWay.SaveChangesAsync();
                await transaction.CommitAsync();

                if (slot.paid_status == Internship.Baid_Status.Paid)
                {
                    BackgroundJob.Schedule(()
                        => ExpirePendingSession(session.session_id), TimeSpan.FromHours(2));
                }

                return (200, "Booking completed successfully.", session.session_id);
            }
            catch (Exception)
            {
                if (transaction.GetDbTransaction()?.Connection != null)
                    await transaction.RollbackAsync();

                return (500, "Something went wrong while processing your request. Please try again.", null);
            }

        }
        public override async Task<(int statusCode, SessionActionResponseDto)> deleteSession(int sessionId, int UserId)
        {
            using var transaction = await internShipWay.Database.BeginTransactionAsync();
            try
            {

                var student = await internShipWay.Students
                    .Include(e => e.Session_Limitation)
                    .Include(e => e.User)
                    .Include(e => e.mentorship_Sessions)
                       .ThenInclude(e => e.mentor_availability)
                    .FirstOrDefaultAsync(e => e.user_id == UserId);

                if (student == null)
                {
                    await transaction.RollbackAsync();
                    return (401, new SessionActionResponseDto()
                    {
                        Decision = ActionDecision.Block,
                        Message = "User not unauthenticated"
                    });
                }

                if (student.Session_Limitation == null)
                {
                    await transaction.RollbackAsync();
                    return (401, new SessionActionResponseDto()
                    {
                        Decision = ActionDecision.Block,
                        Message = "You are not allowed to cancel this session."
                    });
                }

                var session = student.mentorship_Sessions
                    .Where(e => e.session_id == sessionId)
                    .FirstOrDefault();
                if (session == null)
                {
                    await transaction.RollbackAsync();
                    return (403, new SessionActionResponseDto()
                    {
                        Decision = ActionDecision.Block,
                        Message = "You are not allowed to cancel this session."
                    });
                }

                var slot = session.mentor_availability;
                if (slot == null)
                {
                    await transaction.RollbackAsync();
                    return (400, new SessionActionResponseDto()
                    {
                        Decision = ActionDecision.Block,
                        Message = "This session has no associated slot."
                    });
                }

                if(session.status_session == Status_Session.InProgress 
                    || session.status_session == Status_Session.Started 
                    || session.status_session == Status_Session.Completed 
                    || session.status_session == Status_Session.Expired
                    || session.status_session == Status_Session.Cancelled)
                {
                    await transaction.RollbackAsync();
                    return (400, new SessionActionResponseDto()
                    {
                        Decision = ActionDecision.Block,
                        Message = "This session can no longer be cancelled."
                    });
                }

                var Now = DateTime.UtcNow;
                var DateOfLimitedCancel = student.Session_Limitation.LastResetDate;
                if (DateOfLimitedCancel.Month != Now.Month
                    || DateOfLimitedCancel.Year != Now.Year)
                {
                    student.Session_Limitation.LastResetDate = DateOnly.FromDateTime(Now);
                    student.Session_Limitation.CancelCountTotal = 0;
                    student.Session_Limitation.LastHourCancellationCount = 0;
                    student.Session_Limitation.RescheduleCountTotal = 0;
                    student.Session_Limitation.LastHourRescheduleCount = 0;
                    

                }


                if (student.Session_Limitation.CancelCountTotal >= 3)
                {
                    await transaction.RollbackAsync();
                    return (400, new SessionActionResponseDto()
                    {
                        Decision = ActionDecision.Block,
                        Message = "You reached your monthly cancel limit ."
                    });
                }

                var DateOfSession =DateTime.SpecifyKind( slot.date.ToDateTime(slot.start_time), DateTimeKind.Utc);
                if (Now <= DateOfSession.AddHours(-1))
                {
                    if (slot.paid_status == Internship.Baid_Status.Paid
                        && session.status_session == Status_Session.Confirmed)
                    {
                        var Transaction = await internShipWay.Transactions
                             .FirstOrDefaultAsync(e => e.SessionId == sessionId
                                                                  && e.TransactionId != 0);
                        if (Transaction == null)
                        {
                            await transaction.RollbackAsync();
                            return (400, new SessionActionResponseDto()
                            {
                                Decision = ActionDecision.Block,
                                Message = "This session has no completed payment to refund."
                            });
                        }
                        
                        var authToken = await paymentSystem.GetAuthToken();
                      
                        await paymentSystem.RefundPayment(authToken, Transaction.TransactionId, slot.priceSlot);
                        await paymentSystem.UpdatePaymentForRefund(sessionId, "full");
                    }
                    student.Session_Limitation.CancelCountTotal += 1;
                    session.status_session = Status_Session.Cancelled;
                    slot.is_booked = false;
                
                    await internShipWay.SaveChangesAsync();
                    await transaction.CommitAsync();

                    var mentor = await internShipWay.Mentors.FirstOrDefaultAsync(m => m.Mentor_Id == slot.mentor_id);
                    if (mentor != null)
                    {
                        await _notificationService.CreateAndSendNotificationAsync(mentor.user_id, "Session Cancelled", $"Your {session.topic.ToString().Replace("_", " ")} session with {student.User.Full_Name} has been cancelled.", "MentorSession", sessionId);
                    }

                    return (200, new SessionActionResponseDto()
                    {
                        Decision = ActionDecision.Allow,
                        Message = "Session cancelled successfully.",
                        PenaltyAmount = 0
                    });
                }

                if (slot.paid_status == Internship.Baid_Status.Paid)
                {
                    await transaction.RollbackAsync();

                    return (200, new SessionActionResponseDto()
                    {
                        Decision = ActionDecision.ConfirmPenalty,
                        Message =
                        @"You are trying to cancel a session that is scheduled in less than 1 hour.
Since this session is already paid, you have two options:
- Proceed with cancellation and a 50% fee will be deducted from the session price.
- Keep the session as it is.

Please confirm your choice to continue.",
                        PenaltyAmount =0.5m* slot.priceSlot,
                    });
                   
                }

                if (student.Session_Limitation.HasExceededLateCancellationLimit)
                {
                    await transaction.RollbackAsync();
                    return (400, new SessionActionResponseDto()
                    {
                        Decision = ActionDecision.Block,
                        Message = "You have exceeded the limit of 2 last-minute cancellations (less than 1 hour before the session) for this month."
                    });

                }


                student.Session_Limitation.CancelCountTotal += 1;
                student.Session_Limitation.LastHourCancellationCount += 1;
                EvaluateRestrictions(student);

                session.status_session = Status_Session.Cancelled;
                slot.is_booked = false;

                await internShipWay.SaveChangesAsync();
                await transaction.CommitAsync();

                var mentorOfLateCancel = await internShipWay.Mentors.FirstOrDefaultAsync(m => m.Mentor_Id == slot.mentor_id);
                if (mentorOfLateCancel != null)
                {
                    await _notificationService.CreateAndSendNotificationAsync(mentorOfLateCancel.user_id, "Session Cancelled", $"Your {session.topic.ToString().Replace("_", " ")} session with {student.User.Full_Name} has been cancelled.", "MentorSession", sessionId);
                }

                return (200, new SessionActionResponseDto()
                {
                    Decision = ActionDecision.Allow,
                    Message = "Session cancelled successfully.",
                    PenaltyAmount = 0
                });



            }
            catch (Exception )
            {
                try
                {
                    await transaction.RollbackAsync();

                }
                catch
                {
                    return (500, new SessionActionResponseDto()
                    {
                        Decision = ActionDecision.Block,
                        Message = "Something went wrong while processing your request. Please try again.",
                    });
                }
               
                return (500, new SessionActionResponseDto()
                {
                    Decision = ActionDecision.Block,
                    Message = "Something went wrong while processing your request. Please try again.",
                });
            }


        }
        public override async Task<(int statusCode, SessionActionResponseDto)> rescheduleSession(int sessionId, int slotId, int TopicId, int UserId)
        {
            using var transaction = await internShipWay.Database.BeginTransactionAsync();
            try
            {
                var student = await internShipWay.Students
                    .Include(e => e.Session_Limitation)
                    .Include(e => e.User)
                    .Include(e => e.mentorship_Sessions)
                    .ThenInclude(e => e.mentor_availability)
                    .FirstOrDefaultAsync(e => e.user_id == UserId);
                if (student == null || student.Session_Limitation == null)
                {
                    await transaction.RollbackAsync();
                    return (401, new SessionActionResponseDto()
                    {
                        Decision = ActionDecision.Block,
                        Message = "User unauthenticated"
                    });
                }


                var session = student.mentorship_Sessions
                    .Where(e => e.session_id == sessionId)
                    .FirstOrDefault();
                if (session == null)
                {
                    await transaction.RollbackAsync();
                    return (403, new SessionActionResponseDto()
                    {
                        Decision = ActionDecision.Block,
                        Message = "You are not allowed to reschedules this session."
                    });
                }

                var slot = session.mentor_availability;
                if (slot == null)
                {
                    await transaction.RollbackAsync();
                    return (400, new SessionActionResponseDto()
                    {
                        Decision = ActionDecision.Block,
                        Message = "This session has no associated slot."
                    });
                }

                if (session.status_session == Status_Session.InProgress
                    || session.status_session == Status_Session.Started
                    || session.status_session == Status_Session.Completed
                    || session.status_session == Status_Session.Expired
                    || session.status_session == Status_Session.Cancelled)
                {
                    await transaction.RollbackAsync();
                    return (400, new SessionActionResponseDto()
                    {
                        Decision = ActionDecision.Block,
                        Message = "This session can no longer be rescheduled."
                    });
                }
                var Now = DateTime.UtcNow;
                var DateOfLimitedCancel = student.Session_Limitation.LastResetDate;
                if (DateOfLimitedCancel.Month != Now.Month
                    || DateOfLimitedCancel.Year != Now.Year)
                {
                    student.Session_Limitation.LastResetDate = DateOnly.FromDateTime(Now);
                    student.Session_Limitation.CancelCountTotal = 0;
                    student.Session_Limitation.LastHourCancellationCount = 0;
                    student.Session_Limitation.RescheduleCountTotal = 0;
                    student.Session_Limitation.LastHourRescheduleCount = 0;


                }

                if (student.Session_Limitation.RescheduleCountTotal >= 3)
                {
                    await transaction.RollbackAsync();
                    return (400, new SessionActionResponseDto()
                    {
                        Decision = ActionDecision.Block,
                        Message = "You reached your monthly reschedule limit ."
                    });
                }

                var DateOfSession = DateTime.SpecifyKind(slot.date.ToDateTime(slot.start_time), DateTimeKind.Utc);
                if (Now <= DateOfSession.AddHours(-1))
                {

                    var NewSlot1 = await internShipWay.Mentor_Availabilities
                                .SingleOrDefaultAsync(e => e.Slot_Id == slotId);
                    if (NewSlot1 == null || NewSlot1.is_booked)
                    {
                        await transaction.RollbackAsync();
                        return (404, new SessionActionResponseDto()
                        {
                            Decision = ActionDecision.Block,
                            Message = "This slot is unavailable.Please choose another time."
                        });
                    }

                    var DateOfNewSlot1 = DateTime.SpecifyKind(NewSlot1.date.ToDateTime(NewSlot1.start_time), DateTimeKind.Utc);
                    if (DateOfNewSlot1 < DateTime.UtcNow)
                    {
                        await transaction.RollbackAsync();
                        return (404, new SessionActionResponseDto()
                        {
                            Decision = ActionDecision.Block,
                            Message = "This slot is expired. Please choose another time."
                        });
                    }
                    if (!Enum.IsDefined(typeof(Topic), TopicId))
                    {
                        await transaction.RollbackAsync();
                        return (400, new SessionActionResponseDto()
                        {
                            Decision = ActionDecision.Block,
                            Message = "Invalid topic."
                        });
                    }

                    if (slot.paid_status == Internship.Baid_Status.Paid
                       && session.status_session == Status_Session.Confirmed)
                    {
                        var Transaction = await internShipWay.Transactions
                             .FirstOrDefaultAsync(e => e.SessionId == sessionId
                                                                  && e.TransactionId != 0);
                        if (Transaction == null)
                        {
                            await transaction.RollbackAsync();
                            return (400, new SessionActionResponseDto()
                            {
                                Decision = ActionDecision.Block,
                                Message = "This session has no completed payment to refund."
                            });
                        }

                        var authToken = await paymentSystem.GetAuthToken();

                        await paymentSystem.RefundPayment(authToken, Transaction.TransactionId, slot.priceSlot);

                        await paymentSystem.UpdatePaymentForRefund(sessionId, "full");
                    }

                    student.Session_Limitation.RescheduleCountTotal += 1;

                    slot.is_booked = false;
                    NewSlot1.is_booked = true;
                    session.slot_id = NewSlot1.Slot_Id;
                    session.topic = (Topic)TopicId;
                    session.created_at = DateTime.UtcNow;
                    session.status_session = Status_Session.Pending;

                    if (NewSlot1.paid_status == Internship.Baid_Status.Paid)
                    {
                        var payment = new Payment
                        {
                            Session = session,
                            StudentId = student.Student_Id,
                            Amount = NewSlot1.priceSlot,
                            Status = PaymentStatus.Pending,
                            RefundStatus = RefundStatus.None
                        };

                        await internShipWay.Payments.AddAsync(payment);

                    }

                    await internShipWay.SaveChangesAsync();
                    await transaction.CommitAsync();
                    if (NewSlot1.paid_status == Internship.Baid_Status.Paid)
                    {
                        BackgroundJob.Schedule(()
                            => ExpirePendingSession(session.session_id), TimeSpan.FromHours(2));
                    }
                    var mentorOfReschedule1 = await internShipWay.Mentors.FirstOrDefaultAsync(m => m.Mentor_Id == slot.mentor_id);
                    if (mentorOfReschedule1 != null)
                    {
                        await _notificationService.CreateAndSendNotificationAsync(mentorOfReschedule1.user_id, "Session Rescheduled", $"Your {session.topic.ToString().Replace("_", " ")} session with {student.User.Full_Name} has been rescheduled to a new time.", "MentorSession", sessionId);
                    }
                    return (200, new SessionActionResponseDto()
                    {
                        Decision = ActionDecision.Allow,
                        Message = "Reschedule completed successfully.",

                    });

                }

                if (student.Session_Limitation.HasExceededLateRescheduleLimit)
                {
                    await transaction.RollbackAsync();
                    return (400, new SessionActionResponseDto()
                    {
                        Decision = ActionDecision.Block,
                        Message = "You have exceeded the limit of 2 last-minute reschedules (less than 1 hour before the session) for this month."
                    });

                }


                var NewSlot = await internShipWay.Mentor_Availabilities
                               .SingleOrDefaultAsync(e => e.Slot_Id == slotId);
                if (NewSlot == null || NewSlot.is_booked)
                {
                    await transaction.RollbackAsync();
                    return (404, new SessionActionResponseDto()
                    {
                        Decision = ActionDecision.Block,
                        Message = "This slot is unavailable.Please choose another time."
                    });
                }

                var DateOfNewSlot = DateTime.SpecifyKind(NewSlot.date.ToDateTime(NewSlot.start_time), DateTimeKind.Utc);

                if (DateOfNewSlot < DateTime.UtcNow)
                {
                    await transaction.RollbackAsync();
                    return (404, new SessionActionResponseDto()
                    {
                        Decision = ActionDecision.Block,
                        Message = "This slot is expired. Please choose another time."
                    });
                }
                if (!Enum.IsDefined(typeof(Topic), TopicId))
                {
                    await transaction.RollbackAsync();
                    return (400, new SessionActionResponseDto()
                    {
                        Decision = ActionDecision.Block,
                        Message = "Invalid topic."
                    });
                }

                if (slot.paid_status == Internship.Baid_Status.Paid
                      && session.status_session == Status_Session.Confirmed)
                {
                    var Transaction = await internShipWay.Transactions
                         .FirstOrDefaultAsync(e => e.SessionId == sessionId
                                                              && e.TransactionId != 0);
                    if (Transaction == null)
                    {
                        await transaction.RollbackAsync();
                        return (400, new SessionActionResponseDto()
                        {
                            Decision = ActionDecision.Block,
                            Message = "This session has no completed payment to refund."
                        });
                    }

                    var authToken = await paymentSystem.GetAuthToken();

                    await paymentSystem.RefundPayment(authToken, Transaction.TransactionId, slot.priceSlot);

                    await paymentSystem.UpdatePaymentForRefund(sessionId, "full");
                }

                student.Session_Limitation.RescheduleCountTotal += 1;

                student.Session_Limitation.LastHourRescheduleCount += 1;
                EvaluateRestrictions(student);

                slot.is_booked = false;
                NewSlot.is_booked = true;
                session.slot_id = NewSlot.Slot_Id;
                session.topic = (Topic)TopicId;
                session.created_at = DateTime.UtcNow;
                session.status_session = Status_Session.Pending;

                if (NewSlot.paid_status == Internship.Baid_Status.Paid)
                {
                    var payment = new Payment
                    {
                        Session = session,
                        StudentId = student.Student_Id,
                        Amount = NewSlot.priceSlot,
                        Status = PaymentStatus.Pending,
                        RefundStatus = RefundStatus.None
                    };

                    await internShipWay.Payments.AddAsync(payment);

                }
                await internShipWay.SaveChangesAsync();
                await transaction.CommitAsync();

                if (NewSlot.paid_status == Internship.Baid_Status.Paid)
                {
                    BackgroundJob.Schedule(()
                        => ExpirePendingSession(session.session_id), TimeSpan.FromHours(2));
                }
                var mentorOfReschedule2 = await internShipWay.Mentors.FirstOrDefaultAsync(m => m.Mentor_Id == slot.mentor_id);
                if (mentorOfReschedule2 != null)
                {
                    await _notificationService.CreateAndSendNotificationAsync(mentorOfReschedule2.user_id, "Session Rescheduled", $"Your {session.topic.ToString().Replace("_", " ")} session with {student.User.Full_Name} has been rescheduled to a new time.", "MentorSession", sessionId);
                }

                return (200, new SessionActionResponseDto()
                {
                    Decision = ActionDecision.Allow,
                    Message = "Reschedule completed successfully.",

                });


            }
            catch (Exception)
            {
                try
                {
                    await transaction.RollbackAsync();
                }
                catch
                {
                    return (500, new SessionActionResponseDto()
                    {
                        Decision = ActionDecision.Block,
                        Message = "Something went wrong while processing your request. Please try again.",
                    });
                }
                return (500, new SessionActionResponseDto()
                {
                    Decision = ActionDecision.Block,
                    Message = "Something went wrong while processing your request. Please try again.",
                });
            }

        }
        public override async Task<(UpdateResponse, ProfileStudentDto?)> UpdateProfile(RequestUpdateStudentDto editedStudent, int UserId)
        {
            using var transaction = await internShipWay.Database.BeginTransactionAsync();
            bool ChangeCV = false;
            try
            {
                var student = await internShipWay.Students
                .Include(e => e.Student_Skills)
                .Include(e => e.Student_Experiences)
                .Include(e => e.User)
                .FirstOrDefaultAsync(e => e.user_id == UserId);

                if (student == null)
                {
                    await transaction.RollbackAsync();
                    return (new UpdateResponse()
                    {
                        message = "User unauthenticated",
                        cvChange = ChangeCV,
                        statusCode = 401
                    }
                    ,
                   null
                    );

                }

                var existing = await userManager.FindByEmailAsync(editedStudent.email);
                if (existing != null && existing.Id != UserId)
                {
                    await transaction.RollbackAsync();
                    return (new UpdateResponse()
                    {
                        message = "This email is already in use. Please use a different email.",
                        cvChange = ChangeCV,
                        statusCode = 409
                    }
                       ,
                      null
                       );
                }

                student.User.Full_Name = editedStudent.fullName;
                student.User.Email = editedStudent.email;
                student.User.UserName = editedStudent.email;
                student.User.NormalizedEmail = editedStudent.email.ToUpper();
                student.User.NormalizedUserName = editedStudent.email.ToUpper();
                student.User.Update_at = DateTime.UtcNow;
                student.User.PhoneNumber = editedStudent.phone;

                student.University = editedStudent.university;
                student.College = editedStudent.college;
                student.Major = editedStudent.major;
                student.Graduation_Year = editedStudent.gradYear;


                if (editedStudent.CvFile != null)
                {


                    if (!cloudinary.ValidationCvUpLoad(editedStudent.CvFile, out string error))
                    {
                        await transaction.RollbackAsync();
                        return (new UpdateResponse()
                        {
                            message = error,
                            statusCode = 400,
                            cvChange = ChangeCV

                        }
                        ,
                       null
                        );
                    }

                    var response = await cloudinary
                        .UpdateCV(editedStudent.CvFile, student.CvPublicID);

                    var newPublicId = response.PublicId.CleanPublicId();

                    if ((string.IsNullOrEmpty(newPublicId)
                    || string.IsNullOrEmpty(response.fileName))
                    || newPublicId != student.CvPublicID)
                    {
                        await transaction.RollbackAsync();
                        return (new UpdateResponse()
                        {
                            message = "Something went wrong while uploading the file. Please try again.",
                            statusCode = 400,
                            cvChange = ChangeCV
                        }
                        , null
                        );
                    }

                    ChangeCV = true;
                    student.CvPublicID = newPublicId;
                    student.CvFileName = response.fileName;

                    if (student.Student_Skills != null && student.Student_Skills.Any())
                    {
                        internShipWay.Student_Skills.RemoveRange(student.Student_Skills);
                    }

                    if (student.Student_Experiences != null && student.Student_Experiences.Any())
                    {
                        internShipWay.student_Experiences.RemoveRange(student.Student_Experiences);
                    }

                    var InfoCv = await servicesExternalAi
                      .GetCvFilePath(editedStudent.CvFile, student.Student_Id);

                    var OperationId = BackgroundJob.Enqueue<ServicesExternalAi>
                        (
                        e
                        =>
                        e.ExtractAndStoreInformation(InfoCv.filePath,
                        InfoCv.length,
                        student.Student_Id)
                        );
                }

                await internShipWay.SaveChangesAsync();

                await transaction.CommitAsync();

                var refreshStudent = await internShipWay.Students
                   .Include(e => e.User).Include(e => e.skills)
                   .FirstOrDefaultAsync(e => e.user_id == UserId);

                if (refreshStudent == null)
                    return (new UpdateResponse()
                    {
                        message = "Something went wrong .Please try again.",
                        statusCode = 500,
                        cvChange = ChangeCV
                    }
                    ,
                    new ProfileStudentDto());

                var Skills = refreshStudent.skills?.Select(e => e.Skill_Name).ToList() ?? null;

                return (new UpdateResponse()
                {
                    message = "Updated successfully",
                    statusCode = 200,
                    cvChange = ChangeCV

                }
                ,
                    new ProfileStudentDto()
                    {
                        fullName = refreshStudent.User.Full_Name,
                        email = refreshStudent.User?.Email ?? string.Empty,
                        phone = refreshStudent.User?.PhoneNumber ?? string.Empty,
                        university = refreshStudent.University,
                        college = refreshStudent.College,
                        major = refreshStudent.Major,
                        location = refreshStudent.location ?? null,
                        gradYear = refreshStudent.Graduation_Year?.ToString(),
                        skills = Skills
                    }
                     );
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();

                return (new UpdateResponse()
                {
                    message = "Something went wrong while processing your request. Please try again.",
                    statusCode = 500,
                    cvChange = ChangeCV
                }
                ,
               null);
            }
        }
        public override async Task<(ProfileStudentDto?, int StatusCode)> GetDataBystudent(int UserId)
        {
            try
            {

                var User = await userManager.Users.Include(e => e.Student)
                    .ThenInclude(s => s.skills)
                    .FirstOrDefaultAsync(e => e.Id == UserId);
                if (User == null)
                    return (null, 401);

                List<string>? Skillls = User.Student?.skills?.Select(s => s.Skill_Name).ToList() ?? null;

                var DataStudent = new ProfileStudentDto()
                {
                    fullName = User.Full_Name,
                    email = User.Email ?? string.Empty,
                    location = User.Student?.location,
                    gradYear = User.Student?.Graduation_Year?.ToString(),
                    university = User.Student?.University ?? string.Empty,
                    college = User.Student?.College ?? string.Empty,
                    major = User.Student?.Major ?? string.Empty,
                    phone = User.PhoneNumber ?? string.Empty,
                    skills = Skillls,

                };
                return (DataStudent, 200);
            }
            catch (Exception)
            {
                return (null, 500);
            }

        }
        public override async Task<(DashboardOfStudentDto?, int StatusCode, string message)> GetDashboardOfStudent(int UserId)
        {
            try
            {
                var DataOfStudent = new DashboardOfStudentDto();


                var student = await internShipWay.Students
                      .Where(e => e.user_id == UserId)
                      .Include(e => e.applications)
                      .Include(e => e.mentorship_Sessions)
                      .ThenInclude(ms => ms.mentor_availability)
                      .FirstOrDefaultAsync();

                if (student == null)
                    return (null, 401, "User Unauthorized ");

                var NumApplyedInternships = student.applications?.Count > 0 ? student.applications.Count : 0;

                var NumBookingSession = student.mentorship_Sessions?
                    .Where(e => e.status_session != Status_Session.Cancelled && e.status_session != Status_Session.Expired)?
                    .Count() ?? 0;

                var UpcomingSession = student.mentorship_Sessions?
                    .Where(e =>
                    {
                        var Date = DateTime.SpecifyKind(e.mentor_availability.date
                            .ToDateTime(e.mentor_availability.start_time), DateTimeKind.Utc);

                        return (e.status_session != Status_Session.Expired
                      && e.status_session != Status_Session.Cancelled
                      && e.status_session != Status_Session.Completed)
                      && Date >= DateTime.UtcNow;
                    })
                    .OrderBy(e => e.mentor_availability.date)
                    .ThenBy(e => e.mentor_availability.start_time)
                    .FirstOrDefault();

                if (UpcomingSession == null)
                {
                    DataOfStudent.NumApplyedInternships = NumApplyedInternships;
                    DataOfStudent.NumBookingSession = NumBookingSession;
                    DataOfStudent.UpcomingSessionDate = null;

                    return (DataOfStudent, 200, "Dashboard is retrieved successfully .");
                }

                var dateOfUpcomingSession = DateTime
                    .SpecifyKind(UpcomingSession.mentor_availability.date
                    .ToDateTime(UpcomingSession.mentor_availability.start_time)
                    , DateTimeKind.Utc);

                DataOfStudent.NumApplyedInternships = NumApplyedInternships;
                DataOfStudent.NumBookingSession = NumBookingSession;
                DataOfStudent.UpcomingSessionDate = FormatingDate(dateOfUpcomingSession);

                return (DataOfStudent, 200, "Dashboard is retrieved successfully .");

            }
            catch (Exception)
            {
                return (null, 500, "Something went wrong while processing your request. Please try again.");

            }

        }
        public override async Task<(List<RecommendedInternshipDto>?, int StatusCode, string message)> GetRecommendedInternships(int UserId)
        {
            try
            {
                List<RecommendedInternshipDto>? Internships = new();
                var OpenInternships = await internShipWay.Internships
                     .Include(e => e.company)
                     .Include(e => e.skills)
                     .Where(e => e.status == Internship.Status.Open
                     && e.Revoked_At == null
                     && e.application_deadline >= DateOnly.FromDateTime(DateTime.UtcNow))
                     .ToListAsync();

                if (OpenInternships == null || !OpenInternships.Any())
                    return (null, 200, "No internships are currently available. Please check back later.");

                var student = await internShipWay.Students
                   .Include(s => s.skills)
                   .Include(s => s.Experiences)
                   .Include(s => s.User)
                   .FirstOrDefaultAsync(e => e.user_id == UserId);

                if (student == null)
                    return (null, 401, "User unauthenticated");

                List<string>? Skillls = student.skills?.Select(s => s.Skill_Name).ToList() ?? null;

                List<ExperienceDto>? experiences = student.Experiences?
                    .Select(e => new ExperienceDto()
                    {
                        title = e.title,
                        companyName = e.companyName,
                        endDate = e.endDate,
                        startDate = e.startDate
                    }).ToList() ?? null;

                var locationParts = !string.IsNullOrWhiteSpace(student.location) ?
                    student.location.Split(',').ToList() : new List<string>();

                var city = locationParts?.Count() > 0 ? locationParts[0]?.Trim() : null;

                var country = locationParts?.Count() > 1 ? locationParts[1]?.Trim() : null;

                var StudentJson = new StudentForInternshipJson()
                {
                    StudentId = student.Student_Id.ToString(),
                    SkillS = Skillls,
                    Experiences = experiences,
                    Location = new Location()
                    {
                        city = city,
                        country = country
                    }
                };
                var OpenInternshipsJson = OpenInternships.Select(e =>
                {
                    var locationParts = !string.IsNullOrWhiteSpace(e.location) ?
                    e.location.Split(',').ToList() : new List<string>();

                    var city = locationParts?.Count() > 0 ? locationParts[0]?.Trim() : null;

                    var country = locationParts?.Count() > 1 ? locationParts[1]?.Trim() : null;
                    var RequiredSkills = e.skills?.Select(s => s.Skill_Name).ToList() ?? null;

                    return new InternshipDto()
                    {
                        InternId = e.Internship_Id,
                        Title = e.title,
                        WorkType = e.location_type.ToString(),
                        CompanyName = e.company?.company_name ?? null,
                        Location = city,
                        Skills = string.Join(',', RequiredSkills ?? new List<string>()) ?? null,

                    };

                }).ToList();

                var request = new StudentMatchRequest()
                {
                    student = StudentJson,
                    Internships = OpenInternshipsJson
                };

                var AiResponse = await servicesExternalAi.GetStudentMatchScores(request);

                if (AiResponse == null || AiResponse.MoreMatchInternships == null || !AiResponse.MoreMatchInternships.Any())
                    return (null, 502, "Failed to retrieve response from AI service.");

                if (!int.TryParse(AiResponse.StudentId, out int studentId))
                    return (null, 400, "Invalid student ID format.");

                if (student.Student_Id != studentId)
                    return (null, 403, "Student ID does not match the authenticated user.");

                foreach (var response in AiResponse.MoreMatchInternships.OrderByDescending(e => e.score))
                {
                    var recommendedInternship = OpenInternships.Where(e => e.Internship_Id == response.Id)
                        .Select(e => new RecommendedInternshipDto()
                        {
                            internshipId = e.Internship_Id,
                            title = e.title,
                            companyName = e.company?.company_name ?? null,
                            city = !string.IsNullOrWhiteSpace(e.location) ? e.location.Split(',')[0].Trim() : null,
                            locationType = e.location_type.ToString(),
                            matchScore = response.score


                        }).FirstOrDefault();

                    if (recommendedInternship == null)
                        continue;
                    Internships.Add(recommendedInternship);
                }

                if (Internships == null || !Internships.Any())
                    return (null, 200, "No recommended internships found. Please check back later.");

                var InternshipsData = Internships.OrderByDescending(e => e.matchScore).Take(3).ToList();

                return (InternshipsData, 200, "Internships retrieved successfully.");


            }
            catch (Exception)
            {
                return (null, 500, "Something went wrong while processing your request. Please try again.");
            }

        }
        public override async Task<(List<MentorDataForStudentDto>?, int StatusCode, string message)> GetRecommendedMentors(int UserId)
        {
            try
            {
                List<Mentor>? MentorShips = new();

                var mentors = await internShipWay.Mentors
                      .Include(e => e.User)
                      .Include(e => e.skills)
                      .Include(e => e.Experiences)
                      .Include(e => e.mentor_Availabilities)
                      .ToListAsync();
                if (mentors == null || !mentors.Any())
                    return (null, 200, "No mentors found. Please check back later.");

                if (mentors.Count <= 1)
                    return await GetAllMentorsForStudent();


                var student = await internShipWay.Students
                   .Include(s => s.skills)
                   .Include(s => s.Experiences)
                   .Include(s => s.User)
                   .FirstOrDefaultAsync(e => e.user_id == UserId);

                if (student == null)
                    return (null, 401, "User unauthenticated");

                List<string>? Skillls = student.skills?.Select(s => s.Skill_Name).ToList() ?? null;

                List<string>? experiences = student.Experiences?
                    .Select(e => e.title).ToList() ?? null;

                var mentorsJson = mentors.Select(e => new MentorJson()
                {
                    MentorId = e.Mentor_Id,
                    JopTitle = e.Job_Title ?? null,
                    Years_Experience = e.Years_Experience,
                    Location = e.location?.Split(',')[0] ?? null,
                    Rating = (float)e.AvgRating,
                    SkillS = e.skills?.Select(s => s.Skill_Name).ToList() ?? null,
                    Experiences = e.Experiences?.Select(E => E.title).ToList() ?? null

                }).ToList();

                var request = new MentorshipsMatchRequest()
                {
                    StudentId = student.Student_Id.ToString(),
                    SkillS = Skillls,
                    Experiences = experiences,
                    Mentors = mentorsJson
                };
                var AiResponse = await servicesExternalAi.GetMentorshipMatchScores(request);

                if (AiResponse == null || AiResponse.MoreMatchMentors == null || !AiResponse.MoreMatchMentors.Any())
                    return (null, 502, "Failed to retrieve response from AI service.");

                if (!int.TryParse(AiResponse.StudentId, out int studentId))
                    return (null, 400, "Invalid student ID format.");

                if (student.Student_Id != studentId)
                    return (null, 403, "Student ID does not match the authenticated user.");

                foreach (var response in AiResponse.MoreMatchMentors.OrderByDescending(e => e.score))
                {

                    var Mentor = mentors.FirstOrDefault(e => e.Mentor_Id == response.Id);

                    if (Mentor == null)
                        continue;

                    MentorShips.Add(Mentor);
                }

                if (MentorShips == null || !MentorShips.Any())
                    return (null, 200, "No recommended mentors found. Please check back later.");

                var mentorsData = MentorShips.Select(e =>
                {

                    var IsAvailable = e.mentor_Availabilities?
                         .Any(e =>
                         {
                             var date = DateTime.SpecifyKind(
                                 e.date.ToDateTime(e.start_time), DateTimeKind.Utc
                                 );

                             return !e.is_booked && date >= DateTime.UtcNow;
                         }) ?? false;

                    return new MentorDataForStudentDto()
                    {
                        mentorId = e.Mentor_Id,
                        mentorName = e.User.Full_Name,
                        jobTitle = e.Job_Title,
                        yearsExperience = e.Years_Experience,
                        avgRating = e.AvgRating,
                        countReviewers = e.CountReviewers,
                        description = e.description,
                        IsAvailable = IsAvailable,
                        upcomingAvailability = IsAvailable ?
                        UpcomingSlot(e.mentor_Availabilities ?? new List<Mentor_Availability>()) : null,
                        skills = e.skills?.Select(e => e.Skill_Name).ToList() ?? null
                    };
                }).Take(3).ToList();

                return (mentorsData, 200, "Mentors retrieved successfully.");


            }
            catch (Exception)
            {
                return (null, 500, "Something went wrong while processing your request. Please try again.");
            }
        }
        public override async Task<(List<MentorDataForStudentDto>?, int StatusCode, string message)> GetAllMentorsForStudent()
        {
            try
            {
                var mentors = await internShipWay.Mentors
                      .Include(e => e.User)
                      .Include(e => e.skills)
                      .Include(e => e.mentor_Availabilities)
                      .ToListAsync();
                if (!mentors.Any())
                    return (null, 200, "No mentors found. Please check back later.");

                var mentorsData = mentors.OrderByDescending(e => e.AvgRating).Select(e =>
                {
                    var IsAvailable = e.mentor_Availabilities?
                        .Any(e =>
                        {
                            var date = DateTime.SpecifyKind(
                                e.date.ToDateTime(e.start_time), DateTimeKind.Utc
                                );

                            return !e.is_booked && date >= DateTime.UtcNow;
                        }) ?? false;

                    return new MentorDataForStudentDto()
                    {
                        mentorId = e.Mentor_Id,
                        mentorName = e.User.Full_Name,
                        jobTitle = e.Job_Title,
                        yearsExperience = e.Years_Experience,
                        avgRating = e.AvgRating,
                        countReviewers = e.CountReviewers,
                        description = e.description,
                        IsAvailable = IsAvailable,
                        upcomingAvailability = IsAvailable ?
                             UpcomingSlot(e.mentor_Availabilities ?? new List<Mentor_Availability>()) : null,
                        skills = e.skills?.Select(e => e.Skill_Name).ToList() ?? null
                    };
                }).ToList();

                return (mentorsData, 200, "Mentors retrieved successfully.");
            }
            catch (Exception)
            {
                return (null, 500, "Something went wrong while processing your request. Please try again.");
            }

        }
        public override async Task<(List<SessionTopicDto>?, int StatusCode, string message)> GetAllSessionTopic()
        {
            try
            {
                var Topics = Enum.GetValues(typeof(Topic))
                    .Cast<Topic>()
                    .Select(e => new SessionTopicDto() { Id = (int)e, Title = e.ToDisplay() })
                    .ToList();

                if (Topics == null || !Topics.Any())
                    return (null, 404, "No topics founded.");

                return (Topics, 200, "Topics retrieved successfully. ");
            }
            catch (Exception)
            {
                return (null, 500, "Something went wrong while processing your request. Please try again.");
            }
        }
        public override async Task<(int statusCode, string message)> AddReviewForMentorByStudent(ReviewRequestDto review, int UserId)
        {
            using var transaction = await internShipWay.Database.BeginTransactionAsync();
            try
            {

                var student = await internShipWay.Students
                    .Include(e => e.Reviews)
                      .ThenInclude(e => e.mentor)
                    .Include(e => e.mentorship_Sessions)
                      .ThenInclude(e => e.mentor_availability)
                          .ThenInclude(e => e.Mentor)
                    .FirstOrDefaultAsync(e => e.user_id == UserId);

                if (student == null)
                {
                    await transaction.RollbackAsync();
                    return (401, "User not authenticated");
                }

                var SessionOwnedByStudent = student.mentorship_Sessions
                    .FirstOrDefault(e => e.session_id == review.sessionId);

                if (SessionOwnedByStudent == null)
                {
                    await transaction.RollbackAsync();
                    return (404, "This session does not belong to the student or does not exist.");
                }
                var IsCompletedSession = SessionOwnedByStudent.status_session == Status_Session.Completed;

                if (!IsCompletedSession)
                {
                    await transaction.RollbackAsync();
                    return (400, "You can only review a completed session.");
                }
                var ExistingReview = student.Reviews
                    .FirstOrDefault(e => e.SessionId == review.sessionId);

                if (ExistingReview == null)
                {
                    var Review = new Review()
                    {
                        StudentId = student.Student_Id,
                        MentorId = SessionOwnedByStudent.mentor_availability.mentor_id,
                        SessionId = review.sessionId,
                        Rating = review.rate,
                        Message = review.message,

                    };
                    await internShipWay.Reviews.AddAsync(Review);
                    await internShipWay.SaveChangesAsync();

                    var reviewsOfMentor = await internShipWay.Reviews
                         .Where(e => e.MentorId == Review.MentorId).ToListAsync();

                    if (reviewsOfMentor == null || !reviewsOfMentor.Any())
                        throw new Exception("Review failed. Please try again.");

                    var mentor = await internShipWay.Mentors
                           .FirstOrDefaultAsync(m => m.Mentor_Id == Review.MentorId);

                    if (mentor == null)
                    {
                        await transaction.RollbackAsync();
                        return (404, "This session does not belong to the mentor  or does not exist.");
                    }

                    mentor.AvgRating = Math.Round(reviewsOfMentor.Average(e => e.Rating), 1);
                    mentor.CountReviewers = reviewsOfMentor.Count();

                    await internShipWay.SaveChangesAsync();
                    await transaction.CommitAsync();
                    return (201, "Review submitted successfully.");
                }
                else
                {
                    ExistingReview.Rating = review.rate;
                    ExistingReview.Message = review.message;
                    await internShipWay.SaveChangesAsync();

                    var reviewsOfMentor = await internShipWay.Reviews
                            .Where(e => e.MentorId == ExistingReview.MentorId).ToListAsync();

                    if (reviewsOfMentor == null || !reviewsOfMentor.Any())
                        throw new Exception("Review failed. Please try again.");

                    if (ExistingReview.mentor == null)
                    {
                        await transaction.RollbackAsync();
                        return (404, "This session does not belong to the mentor  or does not exist.");
                    }

                    ExistingReview.mentor.AvgRating = Math.Round(reviewsOfMentor.Average(e => e.Rating), 1);
                    ExistingReview.mentor.CountReviewers = reviewsOfMentor.Count();

                    await internShipWay.SaveChangesAsync();

                }

                await transaction.CommitAsync();
                return (200, "Review submitted successfully.");
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return (500, "Something went wrong while processing your request. Please try again.");
            }

        }
        public override async Task<(List<MatchScoreForStudent>?, int statusCode, string message)> GetMatchScoreOfStudent(int UserId)
        {
            try
            {
                var OpenInternships = await internShipWay.Internships
                                     .Include(e => e.company)
                                     .Include(e => e.skills)
                                    .Where(e => e.status == Internship.Status.Open
                     && e.Revoked_At == null
                     && e.application_deadline >= DateOnly.FromDateTime(DateTime.UtcNow))
                                     .ToListAsync();

                if (!OpenInternships.Any())
                    return (null, 200, "No internships are currently available. Please check back later.");

                var student = await internShipWay.Students
                   .Include(s => s.skills)
                   .Include(s => s.Experiences)
                   .FirstOrDefaultAsync(e => e.user_id == UserId);

                if (student == null)
                    return (null, 401, "User unauthenticated");

                List<string>? Skillls = student.skills?.Select(s => s.Skill_Name).ToList() ?? null;

                List<ExperienceDto>? experiences = student.Experiences?
                    .Select(e => new ExperienceDto()
                    {
                        title = e.title,
                        companyName = e.companyName,
                        endDate = e.endDate,
                        startDate = e.startDate
                    }).ToList() ?? null;

                var locationParts = !string.IsNullOrWhiteSpace(student.location) ?
                    student.location.Split(',').ToList() : new List<string>();

                var city = locationParts?.Count() > 0 ? locationParts[0]?.Trim() : null;

                var country = locationParts?.Count() > 1 ? locationParts[1]?.Trim() : null;

                var StudentJson = new StudentForInternshipJson()
                {
                    StudentId = student.Student_Id.ToString(),
                    SkillS = Skillls,
                    Experiences = experiences,
                    Location = new Location()
                    {
                        city = city,
                        country = country
                    }
                };
                var OpenInternshipsJson = OpenInternships.Select(e =>
                {
                    var locationParts = !string.IsNullOrWhiteSpace(e.location) ?
                    e.location.Split(',').ToList() : new List<string>();

                    var city = locationParts?.Count() > 0 ? locationParts[0]?.Trim() : null;

                    var country = locationParts?.Count() > 1 ? locationParts[1]?.Trim() : null;
                    var RequiredSkills = e.skills?.Select(s => s.Skill_Name).ToList() ?? null;

                    return new InternshipDto()
                    {
                        InternId = e.Internship_Id,
                        Title = e.title,
                        WorkType = e.location_type.ToString(),
                        CompanyName = e.company?.company_name ?? null,
                        Location = city,
                        Skills = string.Join(',', RequiredSkills ?? new List<string>()) ?? null,

                    };

                }).ToList();

                var request = new StudentMatchRequest()
                {
                    student = StudentJson,
                    Internships = OpenInternshipsJson
                };
                var AiResponse = await servicesExternalAi.GetStudentMatchScores(request);

                if (AiResponse == null || AiResponse.MoreMatchInternships == null || !AiResponse.MoreMatchInternships.Any())
                    return (null, 502, "Failed to retrieve response from AI service.");

                if (!int.TryParse(AiResponse.StudentId, out int studentId))
                    return (null, 400, "Invalid student ID format.");

                if (student.Student_Id != studentId)
                    return (null, 403, "Student ID does not match the authenticated user.");

                var MatchScoreModel = AiResponse.MoreMatchInternships
                    .Select(e =>
                    {
                        return new MatchScoreForStudent()
                        {
                            InternshipId = e.Id,
                            Score = e.score
                        };
                    }).Where(e => e != null)
                    .Select(e => e!)
                    .ToList();


                return (MatchScoreModel, 200, "Match Score of internships retrieved successfully.");
            }
            catch (Exception)
            {
                return (null, 500, "Something went wrong while processing your request. Please try again.");
            }


        }
        public override async Task CompleteSession(int sessionId)
        {
            var session = await internShipWay.mentorship_Sessions
                .FirstOrDefaultAsync(s => s.session_id == sessionId);

            if (session == null)
                return;

            if (session.status_session == Status_Session.Completed)
                return;

            if (session.status_session != Status_Session.Started)
                return;

            session.status_session = Status_Session.Completed;
            
             await internShipWay.SaveChangesAsync();
           
        }
        private string FormatingDate(DateTime date)
        {
            var local = date.ToLocalTime();

            var today = DateTime.Now.Date;
            var target = local.Date;

            string time = local.ToString("h:mm tt", CultureInfo.InvariantCulture);

            if (target == today)
                return $"Today {time}";

            if (target == today.AddDays(1))
                return $"Tomorrow {time}";

            if (target == today.AddDays(-1))
                return $"Yesterday {time}";

            var startOfWeek = today.AddDays(-(int)today.DayOfWeek);
            var endOfWeek = startOfWeek.AddDays(7);

            if (target >= startOfWeek && target < endOfWeek)
                return local.ToString("dddd  h:mm tt", CultureInfo.InvariantCulture);

            if (target.Year == today.Year)
                return local.ToString("MMM dd, h:mm tt", CultureInfo.InvariantCulture);

            return local.ToString("MMM dd, yyyy  h:mm tt", CultureInfo.InvariantCulture);
        }
        public string? UpcomingSlot(List<Mentor_Availability> availableSlots)
        {
            if (availableSlots == null || !availableSlots.Any())
                return null;

            var UpcomingSlot = availableSlots.Where(e =>
            {
                var Date = DateTime.SpecifyKind(e.date.ToDateTime(e.start_time), DateTimeKind.Utc);
                return !e.is_booked && Date >= DateTime.UtcNow;
            })
                .OrderBy(e => e.date)
                .ThenBy(e => e.start_time)
                .FirstOrDefault();

            if (UpcomingSlot == null)
                return null;

            var dateOfSlotUTC = DateTime.SpecifyKind(
                UpcomingSlot.date.ToDateTime(UpcomingSlot.start_time), DateTimeKind.Utc);

            var DateToString = FormatingDate(dateOfSlotUTC);

            return DateToString;
        }
        public void EvaluateRestrictions(Student student)
        {
            if (student.Session_Limitation == null)
                return;

            var limitExceeded =
                (student.Session_Limitation.HasExceededLateCancellationLimit)
                && (student.Session_Limitation.HasExceededLateRescheduleLimit);

            if (limitExceeded)
            {
                student.Session_Limitation.BookingBlockedUntil = DateTime.UtcNow.AddDays(10);
            }
        }
        public async Task ExpirePendingSession(int SessionId)
        {

            var session = await internShipWay.mentorship_Sessions
       .Include(s => s.mentor_availability)
       .FirstOrDefaultAsync(s => s.session_id == SessionId);

            if (session == null)
                return;

            var slot = session.mentor_availability;

            if (slot == null)
                return;

            if (session.status_session == Mentorship_Session.Status_Session.Completed ||
                session.status_session == Mentorship_Session.Status_Session.Expired ||
                session.status_session == Mentorship_Session.Status_Session.Confirmed)
                return;

            session.status_session = Mentorship_Session.Status_Session.Expired;
            slot.is_booked = false;
            await internShipWay.SaveChangesAsync();

        }

    }
}

