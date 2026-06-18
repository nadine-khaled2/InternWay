using static InternWay.Models.mentor_schema.Mentorship_Session;

namespace InternWay.Services.MentorServices
{
    public static class ExtensionMethods
    {
        public static string ToDisplay(this Topic SessionTopic)
        {
            return SessionTopic switch
            {
                Topic.CV_Resume_Review => "CV & Resume Review",
                Topic.Career_Guidance => "Career Guidance",
                Topic.Mock_Interview => "Mock Interview",
                Topic.Technical_Help => "Technical Help",
                Topic.Portfolio_Review => "Portfolio Review",
                _ => SessionTopic.ToString()
            };
        }
        public static string CleanPublicId(this string inputId)
        {
            if (string.IsNullOrEmpty(inputId))
                return inputId;
           
            return Path.ChangeExtension
                (
                inputId.Replace("Cvs/", ""),
                null
                );
        }
    }
}
