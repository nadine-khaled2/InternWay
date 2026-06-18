using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace InternWay.Services.StudentServices
{
    public class CloudinaryService
    {
        private readonly Cloudinary _cloudinary;
        private readonly IConfiguration _configuration;
        public CloudinaryService(IConfiguration configuration)
        { 
            this._configuration = configuration;

            var settings = configuration.GetSection("Cloudinary");

            var account = new Account(
                settings["CloudName"],
                settings["ApiKey"],
                settings["ApiSecret"]
            );

            _cloudinary = new Cloudinary(account);
         
        }

        public async Task<(string PublicId  , string fileName)> UploadCvAsync(IFormFile file, string userId)
        {
            try
            {
                await using var stream = file.OpenReadStream();
                var uploadParams = new RawUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    PublicId = $"Cv_{Guid.NewGuid()}",
                    Folder = "Cvs" ,
                    AccessMode = "public"

                };

                var result = await _cloudinary.UploadAsync(uploadParams);

                if (result.StatusCode != System.Net.HttpStatusCode.OK || result.Error != null)
                    throw new Exception("An error occurred while uploading your CV. Please try again.");

                return ( result.PublicId  , file.FileName);
            }
            catch (Exception )
            {
                throw new Exception("An error occurred while uploading your CV. Please try again.");
            }
        }
        public async Task<(string PublicId, string fileName)> UpdateCV(IFormFile file, string existingPublicId)
        {
            try
            {
               await using var stream = file.OpenReadStream();
                var uploadParams = new RawUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    PublicId = existingPublicId,
                    Folder = "Cvs",
                    AccessMode = "public",
                    Invalidate = true , 
                    Overwrite = true
                };

                var result = await _cloudinary.UploadAsync(uploadParams);

                if (result.StatusCode != System.Net.HttpStatusCode.OK || result.Error != null)
                    throw new Exception("An error occurred while update your CV. Please try again.");

                return (result.PublicId,  file.FileName );
            }
            catch (Exception )
            {
                throw new Exception("An error occurred while update your CV. Please try again.");
            }
        }

        public async Task<(string message, int statuscode)> DownloadCv(string publicId , string fileName)
        {
            try
            {
                var extension = Path.GetExtension(fileName);
                var url =  _cloudinary.Api.Url
                    .ResourceType("raw")
                    .Type("upload")
                    .Secure(true)
                    .BuildUrl($"Cvs/{publicId}{extension}");


                return ( url, 200);
            }
            catch (TaskCanceledException)
            {
               return ("Download request timed out." , 504);
            }
            catch (HttpRequestException)
            {
                return("Failed to download the CV file." , 503);
            }
            catch (Exception)
            {
                return ("Error downloading CV ." , 500);
            }
        }
        public bool ValidationCvUpLoad(IFormFile CvFile, out string ErrorMessage)
        {
            if (CvFile == null)
            {
                ErrorMessage = "CV file is required";
                return false;
            }
            var allowedExtension = new[] { ".pdf", ".docx" };
            var fileExtension = Path.GetExtension(CvFile.FileName).ToLower();
            if (!(allowedExtension.Contains(fileExtension)))
            {
                ErrorMessage = "CV file must be PDF or DOCX";
                return false;
            }
            var allowedTypes = new[]
            {
               "application/pdf",
               "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            };

            if (!allowedTypes.Contains(CvFile.ContentType))
            {
                ErrorMessage = "Invalid file type.";
                return false;
            }
            const long allowedSize = 5 * 1024 * 1024;

            if (CvFile.Length > allowedSize)
            {
                ErrorMessage = "CV file size cannot exceed 5 MB";
                return false;
            }
            ErrorMessage = string.Empty;
            return true;
        }
        public bool ValidationPassword(string password , out string ErrorMessage)
        {
            if (password == null)
            {
                ErrorMessage = "Password is required";
                return false; 
            }
            if (password.Length < 8 )
            {
                ErrorMessage = "Password must be at least 8 characters";
                return false;
            }
            var pattern = @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$";
            if (!Regex.IsMatch(password, pattern))
            {
                ErrorMessage = "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
                return false;
            }
            ErrorMessage = string.Empty;
            return true;
        }

    }
}


