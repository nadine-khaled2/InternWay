using System.ComponentModel.DataAnnotations;
using System.Globalization;

namespace InternWay.ValidationAttributesModel
{
    public class ValidateDeadlineAttribute :ValidationAttribute
    {
        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value == null)
            { return ValidationResult.Success; }

            var Deadline = value as string;
            
  

            if (!DateOnly.TryParseExact(Deadline, 
                new[] { "MM/dd/yyyy" , "MM-dd-yyyy" , "yyyy-MM-dd" , "yyyy/MM/dd" , "dd/MM/yyyy" , "dd-MM-yyyy" },CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out var deadLine))
            {
                return new ValidationResult("Invalid date format .");
            }
           
            var currentDate = DateOnly.FromDateTime(DateTime.UtcNow);
            if (deadLine < currentDate)
            {
                return new ValidationResult("Application deadline cannot be a past date");

            }
            return ValidationResult.Success;
        }
    }
}
