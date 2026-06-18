using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InternWay.Models.student_schema
{
    [Table("Student_Session_limitations", Schema = "student")]
    public class Student_Session_limitation
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        [Range(minimum: 0, maximum: 3
     , ErrorMessage = "Cancel count cannot exceed 2 cancellations per month.")]
        public int CancelCountTotal { get; set; }
        [Range(minimum: 0, maximum: 3
   , ErrorMessage = "Reschedule count cannot exceed 2 times per month.")]
        public int RescheduleCountTotal { get; set; }
        [Range(minimum: 0, maximum: 2
  , ErrorMessage = "You have reached the maximum number of last-hour cancellations allowed (2).")]
        public int LastHourCancellationCount { get; set; }
        [Range(minimum: 0, maximum: 2
  , ErrorMessage = "You have reached the maximum number of last-hour reschedules allowed (2).")]
        public int LastHourRescheduleCount { get; set; }
        public bool HasExceededLateCancellationLimit => LastHourCancellationCount >=2 ? true : false;
        public bool HasExceededLateRescheduleLimit => LastHourRescheduleCount >= 2 ? true : false;
        public DateOnly LastResetDate { get; set; }
        public DateTime? BookingBlockedUntil { get; set; }
        public Student Student { get; set; }


    }
}
