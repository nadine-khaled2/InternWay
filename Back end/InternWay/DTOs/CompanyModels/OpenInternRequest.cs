using InternWay.ValidationAttributesModel;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace InternWay.DTOs.CompanyModels
{
    public class OpenInternRequest
    {
        [Required(ErrorMessage =" Id of internship is required")]
        public int internshipId { get; set; }

        [ValidateDeadline]
        public string? deadline { get; set; }

    }
}
