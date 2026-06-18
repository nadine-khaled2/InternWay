namespace InternWay.DTOs.StudentModels
{
    public enum ActionDecision
    {
        Allow,         
        Block,              
        ConfirmPenalty     
    }
    public class SessionActionResponseDto
    {

        public ActionDecision Decision { get; set; }
        public string Message { get; set; }

        public decimal? PenaltyAmount { get; set; }

    }
}
