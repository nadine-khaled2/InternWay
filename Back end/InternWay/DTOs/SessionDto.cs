using static InternWay.Models.mentor_schema.Mentorship_Session;

namespace InternWay.DTOs
{
    public class SessionDto
    { // Topic , mentor-id (getmentorby id)  , session-link , s-t , e-t , duration , 
        public SessionDto(int session_id, int mentor_id, string mentorName, string date,
            string start_time, string end_time, string topic , string status, bool isPaid)
        {
            this.session_id = session_id;
            this.mentor_id = mentor_id;
            this.mentorName = mentorName;
            this.date = date;
            this.start_time = start_time;
            this.end_time = end_time;
            this.topic = topic;
            this.status = status;
            this.isPaid = isPaid;
            
        }

        public int session_id { get; set; }
        public int mentor_id { get; set; }
        public string mentorName { get; set; }
        public string date { get; set; }
        public string start_time { get; set; }
        public string end_time { get; set; }
        public string topic { get; set; }
        public string status { get; set; } 
        public bool isPaid { get; set; }

    }
}
