using InternWay.Models.auth_schema;
using InternWay.Models.company_schema;
using InternWay.Models.mentor_schema;
using InternWay.Models.PaymentSystem;
using InternWay.Models.student_schema;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using static InternWay.Models.company_schema.Application;
using static InternWay.Models.company_schema.Internship;
using static InternWay.Models.mentor_schema.Mentorship_Session;

namespace InternWay
{
    public class InternShipWayDB: IdentityDbContext<User ,IdentityRole<int> , int>
    {
        public InternShipWayDB()
        {
        }

        public InternShipWayDB(DbContextOptions options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            //user
            modelBuilder.Entity<User>()
                .HasKey(e => e.Id)
                .HasName("User_id_PK");

            modelBuilder.Entity<User>()
                .Property(e => e.Full_Name)
                .HasColumnType("varchar(100)");

            modelBuilder.Entity<User>()
                .Property(e => e.Email)
                .HasColumnType("varchar(150)");

            modelBuilder.Entity<User>().
                Property(e => e.PasswordHash)
                .HasColumnType("varchar(255)");

            modelBuilder.Entity<User>()
                .Property(e => e.Create_at)
               .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder.Entity<User>()
                .Property(e => e.Role)
                .HasConversion<string>();

            //notification
            modelBuilder
                .Entity<Notification>()
                .HasKey(e => e.Notification_Id)
                .HasName("Notification_Id_PK");

            modelBuilder
                .Entity<Notification>()
                .Property(e => e.Message)
                .HasColumnName("Message_Text")
                .HasColumnType("text");

            modelBuilder
                .Entity<Notification>()
                .Property(e => e.Create_at)
                .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder
                .Entity<Notification>()
                .Property(e => e.Is_Read)
                .HasDefaultValue(false);

            modelBuilder
                .Entity<User>()
                .HasMany(e => e.notifications)
                .WithOne(e=>e.user)
                .HasForeignKey(c => c.User_Id)
                .HasPrincipalKey(p => p.Id).HasConstraintName("User_Notification_FK");

            // student
            modelBuilder
             .Entity<Student>()
             .HasKey(e => e.Student_Id).HasName("Student_Id_PK");

            modelBuilder
             .Entity<Student>()
             .HasOne(e => e.User)
             .WithOne(e => e.Student)
             .HasForeignKey<Student>(e => e.user_id)
             .HasPrincipalKey<User>(e => e.Id)
             .HasConstraintName("User_Student_FK")
             .OnDelete(DeleteBehavior.Cascade);

            modelBuilder
            .Entity<Student>()
            .Property(e => e.University)
            .HasColumnType("varchar(100)")
            .IsRequired();

            modelBuilder
           .Entity<Student>()
           .Property(e => e.College)
           .HasColumnType("varchar(100)")
           .IsRequired();

            modelBuilder
           .Entity<Student>()
           .Property(e => e.Degree)
           .HasColumnType("varchar(100)");

            modelBuilder
          .Entity<Student>()
          .Property(e => e.Major)
          .HasColumnType("varchar(100)")
          .IsRequired();

            modelBuilder
          .Entity<Student>()
          .Property(e => e.Graduation_Year);

            modelBuilder
            .Entity<Student>()
            .Property(e => e.CvPublicID)
            .HasColumnType("varchar(255)")
            .IsRequired();


            modelBuilder
           .Entity<Student>()
           .Property(e => e.CvFileName)
           .HasColumnType("varchar(255)")
           .IsRequired();

            modelBuilder
           .Entity<Student>()
           .Property(e => e.location)
           .HasColumnType("varchar(255)");

            // Student_Session_limitation
            modelBuilder
           .Entity<Student_Session_limitation>()
           .HasKey(e => new { e.Id, e.StudentId })
           .HasName("Pk_Student_Session_limitation");

            modelBuilder.Entity<Student_Session_limitation>()
                    .Property(e => e.Id)
                    .ValueGeneratedOnAdd();

            modelBuilder
         .Entity<Student_Session_limitation>()
         .HasIndex(e => e.StudentId)
         .IsUnique();

            modelBuilder
           .Entity<Student_Session_limitation>()
           .Property(e => e.LastResetDate)
           .HasDefaultValueSql("CAST(GETUTCDATE() AS DATE)")
            .IsRequired();

            modelBuilder
            .Entity<Student_Session_limitation>()
            .Property(e => e.CancelCountTotal)
            .HasDefaultValue(0)
            .IsRequired();

            modelBuilder
           .Entity<Student_Session_limitation>()
             .Property(e => e.RescheduleCountTotal)
            .HasDefaultValue(0)
            .IsRequired();

            modelBuilder
           .Entity<Student_Session_limitation>()
             .Property(e => e.LastHourCancellationCount)
            .HasDefaultValue(0)
            .IsRequired();

            modelBuilder
           .Entity<Student_Session_limitation>()
             .Property(e => e.LastHourRescheduleCount)
            .HasDefaultValue(0)
            .IsRequired();

            modelBuilder
          .Entity<Student_Session_limitation>()
          .HasOne(e => e.Student)
          .WithOne(e => e.Session_Limitation)
          .HasForeignKey<Student_Session_limitation>(e => e.StudentId)
          .OnDelete(DeleteBehavior.Cascade);


            // Student_Skills
            modelBuilder
          .Entity<Student_Skills>()
          .HasKey(e => new { e.student_id, e.skill_id })
          .HasName("Student_Skills_PK");

            modelBuilder
                .Entity<Student>()
                .HasMany(e => e.skills)
                .WithMany(e => e.students).UsingEntity<Student_Skills>(
                 e => e.HasOne(p => p.Skill)
                 .WithMany(s => s.Student_Skills)
                 .HasForeignKey(e => e.skill_id)
                 ,

                e => e.HasOne(p => p.Student)
                .WithMany(s => s.Student_Skills)
                .HasForeignKey(e => e.student_id)

                );

            //Student_Experience
            modelBuilder
                .Entity<Student_Experience>()
                .HasKey(e => new { e.student_id, e.expertise_Id })
                .HasName("Student_Experiences_PK");

            modelBuilder.Entity<Student>()
                .HasMany(e => e.Experiences)
                .WithMany(e => e.students)
                .UsingEntity<Student_Experience>(
                e => e.HasOne(p => p.Experience)
                 .WithMany(s => s.student_Experiences)
                 .HasForeignKey(e => e.expertise_Id)
                 ,

                e => e.HasOne(p => p.Student)
                .WithMany(s => s.Student_Experiences)
                .HasForeignKey(e => e.student_id)

            );

            //company 11
            modelBuilder
             .Entity<Company>()
             .HasKey(e => e.company_id)
             .HasName("company_id_PK");

            modelBuilder
             .Entity<Company>()
             .HasOne(e => e.User)
             .WithOne(e => e.Company)
             .HasForeignKey<Company>(e => e.user_id)
             .HasPrincipalKey<User>(e => e.Id)
             .HasConstraintName("User_Company_FK");

            modelBuilder
            .Entity<Company>()
            .Property(e => e.company_name)
            .HasColumnType("varchar(150)")
            .IsRequired();

            modelBuilder
           .Entity<Company>()
           .Property(e => e.industry)
           .HasColumnType("varchar(150)")
           .IsRequired();

            modelBuilder
           .Entity<Company>()
           .Property(e => e.foundedYear);


            modelBuilder
           .Entity<Company>()
           .Property(e => e.description)
           .HasColumnType("text")
           .IsRequired();

            modelBuilder
           .Entity<Company>()
           .Property(e => e.location)
           .HasColumnType("varchar(100)")
           .IsRequired(); ;

            modelBuilder
          .Entity<Company>()
          .Property(e => e.officeAddress)
          .HasColumnType("varchar(255)")
          .IsRequired();


            modelBuilder
           .Entity<Company>()
           .Property(e => e.Twitter)
           .HasColumnType("varchar(255)");

            modelBuilder
           .Entity<Company>()
           .Property(e => e.Instagram)
           .HasColumnType("varchar(255)");

            modelBuilder
           .Entity<Company>()
           .Property(e => e.Facebook)
           .HasColumnType("varchar(255)");

            modelBuilder
           .Entity<Company>()
           .Property(e => e.LinkedIn)
           .HasColumnType("varchar(255)");


            modelBuilder
           .Entity<Company>()
           .Property(e => e.website)
           .HasColumnType("varchar(255)");

            //Internship

            modelBuilder
             .Entity<Internship>()
             .HasKey(e => e.Internship_Id)
             .HasName("Internship_Id_PK");

            modelBuilder
          .Entity<Internship>()
          .Property(e => e.title)
          .HasColumnType("varchar(150)")
          .IsRequired();

            modelBuilder
             .Entity<Internship>()
             .Property(e => e.description)
             .HasColumnType("text")
             .IsRequired();

            modelBuilder
           .Entity<Internship>()
           .Property(e => e.requirements)
           .HasColumnType("text")
           .IsRequired();

            modelBuilder
         .Entity<Internship>()
         .Property(e => e.location)
         .HasColumnType("varchar(100)");

            modelBuilder
           .Entity<Internship>()
           .Property(e => e.status)
           .HasConversion<string>()
           .HasDefaultValue(Status.Open);

            modelBuilder
          .Entity<Internship>()
          .Property(e => e.paid_status)
          .HasConversion<string>();

            modelBuilder
            .Entity<Internship>()
            .Property(e => e.location_type)
            .HasConversion<string>();

            modelBuilder
                .Entity<Internship>()
                .Property(e => e.Create_at)
                .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder
                .Entity<Internship>()
                .HasOne(e => e.company)
                .WithMany(e => e.internships)
                .HasForeignKey(e => e.company_id)
                .HasPrincipalKey(p => p.company_id)
                .HasConstraintName("company_Internship_FK")
                .OnDelete(DeleteBehavior.Cascade);

            

            // Application
            modelBuilder
            .Entity<Application>()
            .HasKey(e => e.Application_Id)
            .HasName("Application_Id_PK");

            modelBuilder
            .Entity<Application>()
            .Property(e => e.status)
            .HasConversion<string>()
            .HasDefaultValue(Status_Application.Pending);

            modelBuilder
            .Entity<Application>()
            .Property(e => e.applied_at)
            .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder.Entity<Application>()
           .HasOne(a => a.Student)
           .WithMany(s => s.applications)
           .HasForeignKey(a => a.Student_Id)
           .HasPrincipalKey(p => p.Student_Id)
           .HasConstraintName("Student_Application_FK")
           .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Application>()
                .HasOne(a => a.internship)
                .WithMany(i => i.applications)
                .HasForeignKey(a => a.Internship_Id)
                .HasPrincipalKey(p => p.Internship_Id)
                .HasConstraintName("Internship_Application_FK")
                .OnDelete(DeleteBehavior.Cascade);
            
            modelBuilder.Entity<Application>()
                .HasIndex(a => new { a.Student_Id, a.Internship_Id })
                .IsUnique(true);

            //Skill
            modelBuilder
                .Entity<Skill>()
                .HasKey(e => e.Skill_Id)
                .HasName("Skill_Id_PK");

            modelBuilder
                .Entity<Skill>()
                .HasIndex(e => e.Skill_Name)
                .IsUnique();

            // Internship_Skills
            modelBuilder
                .Entity<Internship_Skills>()
                .HasKey(e => new { e.Internship_Id, e.Skill_Id })
                .HasName("Internship_Skills_PK");
            modelBuilder
                .Entity<Internship>()
                .HasMany(e => e.skills)
                .WithMany(s => s.internships)
                .UsingEntity<Internship_Skills>
                (
                e => e.HasOne(s => s.Skill)
                .WithMany(s => s.Internship_Skills)
                .HasForeignKey(e => e.Skill_Id)
                ,
                e => e.HasOne(s => s.Internship)
                .WithMany(s => s.Internship_Skills)
                .HasForeignKey(e => e.Internship_Id)

                );

            //mentor
            modelBuilder
             .Entity<Mentor>()
             .HasKey(e => e.Mentor_Id)
             .HasName("Mentor_Id_PK");

            modelBuilder
             .Entity<Mentor>()
             .HasOne(e => e.User)
             .WithOne(e => e.Mentor)
             .HasForeignKey<Mentor>(e => e.user_id)
             .HasPrincipalKey<User>(e => e.Id)
             .HasConstraintName("User_Mentor_FK");

            modelBuilder
            .Entity<Mentor>()
            .Property(e => e.Job_Title)
            .HasColumnType("varchar(100)")
            .IsRequired();

           

            modelBuilder
           .Entity<Mentor>()
           .Property(e => e.AvgRating)
           .HasDefaultValue(0)
           .HasMaxLength(5)
           .IsRequired();

            modelBuilder
         .Entity<Mentor>()
         .Property(e => e.CountReviewers)
         .HasDefaultValue(0)
         .IsRequired();


            modelBuilder
           .Entity<Mentor>()
           .Property(e => e.Years_Experience)
           .IsRequired();

            modelBuilder
           .Entity<Mentor>()
           .Property(e => e.Linkedin)
           .HasColumnType("varchar(255)");

            //mentor_availability
            modelBuilder
            .Entity<Mentor_Availability>()
            .HasKey(e => e.Slot_Id)
            .HasName("Slot_Id_PK");

            modelBuilder
               .Entity<Mentor_Availability>()
               .HasOne(e => e.Mentor)
               .WithMany(e => e.mentor_Availabilities)
               .HasForeignKey(e => e.mentor_id)
               .HasPrincipalKey(p => p.Mentor_Id)
               .HasConstraintName("Mentor_Mentor_Availability_FK")
               .OnDelete(DeleteBehavior.Cascade);

            modelBuilder
           .Entity<Mentor_Availability>()
           .Property(e => e.session_link)
           .HasColumnType("varchar(255)")
           .IsRequired();

            modelBuilder
           .Entity<Mentor_Availability>()
           .Property(e => e.paid_status)
           .HasConversion<string>();

            modelBuilder
                .Entity<Mentor_Availability>()
                .Property(e => e.priceSlot)
                .HasDefaultValue(0);

            modelBuilder
           .Entity<Mentor_Availability>()
           .Property(e => e.is_booked)
           .HasDefaultValue(false);

            //Mentorship_Session 
            modelBuilder
            .Entity<Mentorship_Session>()
            .HasKey(e => e.session_id)
            .HasName("Session_Id_PK");

            modelBuilder
               .Entity<Mentorship_Session>()
               .HasOne(e => e.student)
               .WithMany(e => e.mentorship_Sessions)
               .HasForeignKey(e => e.student_id)
               .HasPrincipalKey(p => p.Student_Id)
               .HasConstraintName("student_Mentorship_Session_FK");

            modelBuilder
               .Entity<Mentorship_Session>()
               .HasOne(e => e.mentor_availability)
               .WithMany(e=>e.mentorship_Session)
               .HasForeignKey(e=>e.slot_id)
               .HasPrincipalKey(p => p.Slot_Id)
               .HasConstraintName("mentor_availability_Mentorship_Session_FK")
               .OnDelete(DeleteBehavior.Cascade);

            modelBuilder
               .Entity<Mentorship_Session>()
               .Property(e => e.status_session)
               .HasConversion<string>()
               .HasDefaultValue(Status_Session.Pending);


            modelBuilder
          .Entity<Mentorship_Session>()
          .Property(e => e.created_at)
          .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder.Entity<Mentorship_Session>()
          .Property(e => e.topic)
          .IsRequired();

            //Mentor_Experience

            modelBuilder
               .Entity<Mentor_Experience>()
               .HasKey(e => new { e.mentor_id, e.expertise_Id })
               .HasName("Mentor_Experiences_PK");

            modelBuilder.Entity<Mentor>()
                .HasMany(e => e.Experiences)
                .WithMany(e => e.mentors)
                .UsingEntity<Mentor_Experience>(
                e => e.HasOne(p => p.Experience)
                 .WithMany(s => s.mentor_Experiences)
                 .HasForeignKey(e => e.expertise_Id)
                 ,

                e => e.HasOne(p => p.mentor)
                .WithMany(s => s.Mentor_Experiences)
                .HasForeignKey(e => e.mentor_id)

            );

            //Mentor_Skills
            modelBuilder
              .Entity<Mentor_Skill>()
              .HasKey(e => new { e.mentor_id, e.skill_Id })
              .HasName("Mentor_Skills_PK");

            modelBuilder.Entity<Mentor>()
                .HasMany(e => e.skills)
                .WithMany(e => e.mentors)
                .UsingEntity<Mentor_Skill>(
                e => e.HasOne(p => p.skill)
                 .WithMany(s => s.mentor_Skills)
                 .HasForeignKey(e => e.skill_Id)
                 ,

                e => e.HasOne(p => p.mentor)
                .WithMany(s => s.Mentor_Skills)
                .HasForeignKey(e => e.mentor_id)

                
            );

            //experience
            modelBuilder
         .Entity<Experience>()
         .HasKey(e => e.expertiseId).HasName("Experience_Id_PK");


            //Review
            modelBuilder.Entity<Review>()
                .HasKey(e => new { e.Id, e.StudentId, e.SessionId, e.MentorId })
                .HasName("Review_Id_PK");
          
            modelBuilder.Entity<Review>()
                .Property(e => e.Id)
                .ValueGeneratedOnAdd();
          
            modelBuilder.Entity<Review>()
                .Property(e => e.Rating).IsRequired();


            modelBuilder
            .Entity<Review>()
            .Property(e => e.CreateAt)
            .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder.Entity<Review>()
                .HasOne(r => r.session)
                .WithOne(s => s.review)
                .HasForeignKey<Review>(r => r.SessionId);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.mentor)
                .WithMany(m => m.Reviews)
                .HasForeignKey(r => r.MentorId);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.student)
                .WithMany(s => s.Reviews)
                .HasForeignKey(r => r.StudentId);

            modelBuilder.Entity<RefreshToken>()
        .HasKey(x => x.Id);
          
            modelBuilder.Entity<RefreshToken>()
    .Property(x => x.UserId)
    .IsRequired();

            modelBuilder.Entity<RefreshToken>()
      .HasOne(r => r.User)
      .WithMany(u => u.RefreshTokens)
      .HasForeignKey(r => r.UserId);
 
            //payment system
            modelBuilder.Entity<Payment>()
        .HasOne(x => x.Session)
        .WithMany()
        .HasForeignKey(x => x.SessionId)
        .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Payment>()
      .Property(e=>e.Status)
      .HasConversion<string>();

            modelBuilder.Entity<Payment>()
   .Property(e => e.RefundStatus)
   .HasConversion<string>();

            modelBuilder.Entity<MentorWallet>()
     .HasOne(w => w.Mentor)
     .WithOne(m => m.Wallet)
     .HasForeignKey<MentorWallet>(w => w.MentorId)
     .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Transaction>()
                .Property(e=>e.Type)
                .HasConversion<string>();



        }
        public DbSet<User> Users { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Application> Applications { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<Internship> Internships { get; set; }
        public DbSet<Internship_Skills> Internship_Skills { get; set; }
        public DbSet<Skill> Skills { get; set; }
        public DbSet<Mentor> Mentors { get; set; }
        public DbSet<Mentor_Availability> Mentor_Availabilities { get; set; }
        public DbSet<Mentorship_Session> mentorship_Sessions { get; set; }
        public DbSet<Mentor_Experience> Mentor_Experiences { get; set; }

        public DbSet<Mentor_Skill> mentor_Skills { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<Student_Skills> Student_Skills { get; set; }
        public DbSet<Experience> Experiences { get; set; }
        public DbSet<Student_Experience> student_Experiences  { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<MentorWallet> mentorWallets  { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Student_Session_limitation> Student_Session_Limitations { get; set; }

    }
}

