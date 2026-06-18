using Hangfire;
using InternWay.DTOs;
using InternWay.DTOs.AIModels;
using InternWay.IServices;
using InternWay.Models.student_schema;
using InternWay.Services.CompanyServices;
using InternWay.Services.StudentServices;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;


namespace InternWay.Services.Share
{
    public class ServicesExternalAi
    {
        private HttpClient _HttpClient;
        private readonly IWebHostEnvironment inv;
        private readonly InternShipWayDB internShipWay;
        private readonly ServicesRelationsOfCompany servicesOfCompany;
        private readonly ServicesRelationsOfStudent servicesOfStudent;
        private readonly CloudinaryService cloudinary;
        private readonly IServicesOfMentor servicesOfMentor;

        public ServicesExternalAi(HttpClient HttpClient 
            , IWebHostEnvironment _inv 
            , InternShipWayDB internShipWay 
            , ServicesRelationsOfCompany servicesOfCompany
            ,ServicesRelationsOfStudent servicesOfStudent
            ,CloudinaryService cloudinary
            ,IServicesOfMentor servicesOfMentor)
        { 
            this._HttpClient = HttpClient;
            inv = _inv;
            this.internShipWay = internShipWay;
            this.servicesOfCompany = servicesOfCompany;
            this.servicesOfStudent = servicesOfStudent;
            this.cloudinary = cloudinary;
            this.servicesOfMentor = servicesOfMentor;
        }
        public async Task<(string filePath , long length)> GetCvFilePath(IFormFile CvFile, int userId)
        {
            try
            { 
                var FolderPath = Path.Combine(inv.ContentRootPath, "Uploads");
               
                if (!Directory.Exists(FolderPath))
                { 
                    Directory.CreateDirectory(FolderPath);
                }
               
                var extension = Path.GetExtension(CvFile.FileName);
               
                var fileName = $"{Path.GetFileNameWithoutExtension(CvFile.FileName)}{Guid.NewGuid().ToString()}_{userId}{extension}";
               
                var FilePath = Path.Combine(FolderPath, fileName);
             
                using(var stream = new FileStream(FilePath , FileMode.Create , FileAccess.Write))
                {
                   await   CvFile.CopyToAsync(stream);
                }
                
                return (FilePath , CvFile.Length);

            }
            catch (Exception)
            {
                throw;
            }
        }
       
        [AutomaticRetry(Attempts =10)]
        public async Task ExtractAndStoreInformation(string FilePath, long length, int studentId)
        {
            await using var transaction = await internShipWay.Database.BeginTransactionAsync();
           
            try
            {
                var file = new byte[length];
               
                var Experiences = new List<Experience>();
               
                var cancel = new CancellationTokenSource(TimeSpan.FromMinutes(20));

                string? fileName = null;
                string? extension = null;

                if (!File.Exists(FilePath))
                {
                    var data = await internShipWay.Students.Where(e => e.Student_Id == studentId)
                        .Select(e => new { e.CvPublicID , e.CvFileName }).FirstOrDefaultAsync();
                  
                    if (string.IsNullOrEmpty( data?.CvPublicID ))
                        return;
                    
                    if (string.IsNullOrEmpty(data?.CvFileName))
                        return;
                    
                    fileName = data.CvFileName;
                    
                    extension =Path.GetExtension(fileName).ToLower();
                  
                    if (string.IsNullOrEmpty(extension))
                        extension = ".pdf";
                      
                    var result = await cloudinary.DownloadCv(data.CvPublicID, data.CvFileName);
                  
                    string SignedUrl;
                 
                    switch (result.statuscode)
                    {
                        case 200:
                            {
                                SignedUrl = result.message;
       
                                break;
                            }
                        default:
                            throw new Exception("Not Found Url Of Cv");
                    }
                  
                    if (SignedUrl == null)
                        throw new Exception("Not Found Url Of Cv");

                  file =  await _HttpClient.GetByteArrayAsync(SignedUrl);
                }
                else 
                { 
                    file = await File.ReadAllBytesAsync(FilePath, cancel.Token);
                    fileName = Path.GetFileName(FilePath);
                    extension = Path.GetExtension(FilePath).ToLower();
                }

                var request = new HttpRequestMessage(HttpMethod.Post, "https://nadinekhaled500-cv-parser-api.hf.space/parse_resume");
               
                request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
              
                var content = new MultipartFormDataContent();
               
                var fileContent = new ByteArrayContent(file);
                
               

                string contentType = extension switch
                {
                    ".pdf" => "application/pdf",
                    ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    ".doc" => "application/msword",
                    _ => "application/octet-stream"
                };


                fileContent.Headers.ContentType = new MediaTypeHeaderValue(contentType);

                content.Add(fileContent, "file" , fileName);
               
                content.Add(new StringContent(studentId.ToString()), "user_id");
               
                request.Content = content;

                var response = await _HttpClient.SendAsync(request, cancel.Token);
                
                response.EnsureSuccessStatusCode();
               
                var contentJson = await response.Content.ReadAsStringAsync();
              
                var modelAi = JsonSerializer.Deserialize<CvAnalysisResponse>(contentJson);
                
                if (modelAi == null)
                    throw new Exception("Not Found Response OF Cv Parser");

                if (int.TryParse(modelAi.UserId, out var idAi))
                {
                    if (idAi != studentId)
                        throw new Exception();
                }    
               
                var student = await internShipWay.Students.FirstOrDefaultAsync(e => e.Student_Id == studentId);
               
                if (student == null)
                    throw new Exception("Not Found User");

                if (File.Exists(FilePath))
                {
                    File.Delete(FilePath);
                }
              
                student.location = $"{modelAi.location?.city} , {modelAi.location?.country}";


                foreach (var Experience in modelAi.Experiences?? new List<ExperienceDto>())
                {
                    Experiences.Add(
                        new Experience()
                        {
                            title = Experience.title
                            ,
                            companyName = Experience.companyName
                            ,
                            startDate = Experience.startDate
                            ,
                            endDate = Experience.endDate
                        });
                }
                
                if(Experiences.Count > 0)
                { await internShipWay.Experiences.AddRangeAsync(Experiences); }
              
                await internShipWay.SaveChangesAsync();

                var ExperienceSId = Experiences.Select(e => e.expertiseId).ToList();
               
                var ListSkillIdResponse = await servicesOfCompany.AddSkills(modelAi.Skills);

                if(ListSkillIdResponse.statusCode ==500)
                    throw new Exception("Failed to add skills of Student");

                await servicesOfStudent.addSkillsOfStudent(student.Student_Id, ListSkillIdResponse.Item1);

                await servicesOfStudent.addExperiencesOfStudent(student.Student_Id, ExperienceSId);
               
                student.IsCompleteAccount = true;
               
                await internShipWay.SaveChangesAsync();
               
                await transaction.CommitAsync();

            }
            catch (HttpRequestException )
            {
                await transaction.RollbackAsync();
                throw new Exception("Unable to complete the request. Please try again.");
              
            }

            catch (TaskCanceledException)
            {
                await transaction.RollbackAsync();
                throw new Exception("The request timed out. Please try again.");

            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw new Exception("An unexpected error occurred.");

            }
        }

        [AutomaticRetry(Attempts = 7)]
        public async Task ExtractAndStoreMentorInformation(string FilePath, long length, int mentorId)
        {
            await using var transaction = await internShipWay.Database.BeginTransactionAsync();
            try
            {
                var file = new byte[length];
                var Experiences = new List<Experience>();
                var cancel = new CancellationTokenSource(TimeSpan.FromMinutes(10));
                string? fileName = null;
                string? extension = null;

                if (!File.Exists(FilePath))
                {
                    var data = await internShipWay.Mentors.Where(e => e.Mentor_Id == mentorId)
                        .Select(e => new { e.CvPublicID, e.CvFileName }).FirstOrDefaultAsync();

                    if (string.IsNullOrEmpty(data?.CvPublicID) || string.IsNullOrEmpty(data.CvFileName))
                        return;

                    fileName = data.CvFileName;
                    extension = Path.GetExtension(fileName).ToLower();

                    if (string.IsNullOrEmpty(extension))
                        extension = ".pdf";

                    var result = await cloudinary.DownloadCv(data.CvPublicID, data.CvFileName);
                    string SignedUrl;

                    switch (result.statuscode)
                    {
                        case 200:
                            SignedUrl = result.message;
                            break;
                        default:
                            throw new Exception("Not Found Url Of Cv");
                    }

                    if (SignedUrl == null)
                        throw new Exception("Not Found Url Of Cv");

                    file = await _HttpClient.GetByteArrayAsync(SignedUrl);
                }
                else
                {
                    file = await File.ReadAllBytesAsync(FilePath, cancel.Token);
                    fileName = Path.GetFileName(FilePath);
                    extension = Path.GetExtension(FilePath).ToLower();
                }

                var request = new HttpRequestMessage(HttpMethod.Post, "https://nadinekhaled500-cv-parser-api.hf.space/parse_resume");
                request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                var content = new MultipartFormDataContent();
                var fileContent = new ByteArrayContent(file);

                string contentType = extension switch
                {
                    ".pdf" => "application/pdf",
                    ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    ".doc" => "application/msword",
                    _ => "application/octet-stream"
                };

                fileContent.Headers.ContentType = new MediaTypeHeaderValue(contentType);
                content.Add(fileContent, "file", fileName);
                content.Add(new StringContent(mentorId.ToString()), "user_id");
                request.Content = content;

                var response = await _HttpClient.SendAsync(request, cancel.Token);
                response.EnsureSuccessStatusCode();

                var contentJson = await response.Content.ReadAsStringAsync();
                var modelAi = JsonSerializer.Deserialize<CvAnalysisResponse>(contentJson);

                if (modelAi == null)
                    throw new Exception("Not Found Response OF Cv Parser");

                if (int.TryParse(modelAi.UserId, out var idAi))
                {
                    if (idAi != mentorId)
                        throw new Exception();
                }

                var mentor = await internShipWay.Mentors.FirstOrDefaultAsync(e => e.Mentor_Id == mentorId);
                if (mentor == null)
                    throw new Exception("Not Found User");

                if (File.Exists(FilePath))
                {
                    File.Delete(FilePath);
                }

                mentor.location = $"{modelAi.location?.city} , {modelAi.location?.country}";

                foreach (var Experience in modelAi.Experiences ?? new List<ExperienceDto>())
                {
                    Experiences.Add(new Experience()
                    {
                        title = Experience.title,
                        companyName = Experience.companyName,
                        startDate = Experience.startDate,
                        endDate = Experience.endDate
                    });
                }

                if (Experiences.Count > 0)
                {
                    await internShipWay.Experiences.AddRangeAsync(Experiences);
                }

                await internShipWay.SaveChangesAsync();

                var ExperienceSId = Experiences.Select(e => e.expertiseId).ToList();
                var ListSkillIdResponse = await servicesOfCompany.AddSkills(modelAi.Skills);

                if (ListSkillIdResponse.statusCode == 500)
                    throw new Exception("Failed to add skills of Mentor");

                await servicesOfMentor.addSkillsOfMentor(mentor.Mentor_Id, ListSkillIdResponse.Item1);
                await servicesOfMentor.addExperiencesOfMentor(mentor.Mentor_Id, ExperienceSId);

                await internShipWay.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (HttpRequestException)
            {
                await transaction.RollbackAsync();
                throw new Exception("Unable to complete the request. Please try again.");
            }
            catch (TaskCanceledException)
            {
                await transaction.RollbackAsync();
                throw new Exception("The request timed out. Please try again.");
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw new Exception("An unexpected error occurred.");
            }
        }

        public async Task<StudentMatchResponse?> GetStudentMatchScores(StudentMatchRequest request)
        {
            if (request.Internships == null || !request.Internships.Any())
                return null;

            try
            {
                var options = new JsonSerializerOptions
                {
                    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
                };
                var json = JsonSerializer.Serialize(request , options);

                var cancel = new CancellationTokenSource(TimeSpan.FromMinutes(5));

                using var Request = new HttpRequestMessage(HttpMethod.Post, "https://nadinekhaled500-internship-recommender.hf.space/recommend");

                Request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                Request.Content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _HttpClient.SendAsync(Request, cancel.Token);

                response.EnsureSuccessStatusCode();

                var ResponseBody = await response.Content.ReadAsStringAsync();

                var StudentMatchResponse = JsonSerializer.Deserialize<StudentMatchResponse>(ResponseBody);

                if (StudentMatchResponse == null)
                    return null;
               
                return StudentMatchResponse;

            }
            catch (HttpRequestException)
            {

                throw new Exception("Unable to complete the request. Please try again.");

            }

            catch (TaskCanceledException)
            {

                throw new Exception("The request timed out. Please try again.");

            }
            catch (Exception)
            {

                throw new Exception("An unexpected error occurred.");

            }


        }
        public async Task<InternshipMatchResponse?> GetInternshipMatchScores(InternshipMatchRequest request)
        {   
            
            if (request.applicants ==null || !request.applicants.Any())
                return null;

            try
            {
                var options = new JsonSerializerOptions
                {
                    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
                };
                var json = JsonSerializer.Serialize(request, options);

                var cancel = new CancellationTokenSource(TimeSpan.FromMinutes(5));

                using var Request = new HttpRequestMessage(HttpMethod.Post, "URL");

                Request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                Request.Content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _HttpClient.SendAsync(Request, cancel.Token);

                response.EnsureSuccessStatusCode();

                var ResponseBody = await response.Content.ReadAsStringAsync();

                var InternshipMatchResponse = JsonSerializer.Deserialize<InternshipMatchResponse>(ResponseBody);

                if (InternshipMatchResponse == null)
                    return null;

                return InternshipMatchResponse;

            }
            catch (HttpRequestException)
            {

                throw new Exception("Unable to complete the request. Please try again.");

            }

            catch (TaskCanceledException)
            {

                throw new Exception("The request timed out. Please try again.");

            }
            catch (Exception)
            {

                throw new Exception("An unexpected error occurred.");

            }


        }
        public async Task<MentorshipsMatchResponse?> GetMentorshipMatchScores(MentorshipsMatchRequest request)
        {
            if(request.Mentors == null || !request.Mentors.Any())
                return null;

            if(request.Mentors.Count()==1)
                return null;
            try
            {
                var options = new JsonSerializerOptions
                {
                    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
                };
                var json = JsonSerializer.Serialize(request , options);
               
                var cancel = new CancellationTokenSource(TimeSpan.FromMinutes(5));

               using var Request = new HttpRequestMessage(HttpMethod.Post
                   , "https://dinaahmed-dinaahmed11-mentor-recommendation-api.hf.space/recommend");

              
                Request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                Request.Content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await _HttpClient.SendAsync(Request, cancel.Token);
               
                response.EnsureSuccessStatusCode();

                var ResponseBody = await response.Content.ReadAsStringAsync();

                var MentorshipsMatchs = JsonSerializer.Deserialize< MentorshipsMatchResponse> (ResponseBody);

                if(MentorshipsMatchs == null)
                    return null;
                return MentorshipsMatchs;
              
            }
            catch (HttpRequestException)
            {

                throw new Exception("Unable to complete the request. Please try again.");

            }

            catch (TaskCanceledException)
            {

                throw new Exception("The request timed out. Please try again.");

            }
            catch (Exception)
            {

                throw new Exception("An unexpected error occurred.");

            }

        }
    }
}
