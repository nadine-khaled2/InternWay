
using Hangfire;
using InternWay.Hubs;
using InternWay.IServices;
using InternWay.IServices;
using InternWay.Models.auth_schema;
using InternWay.Services.CompanyServices;
using InternWay.Services.MentorServices;
using InternWay.Services.PaymentServices;
using InternWay.Services.Share;
using InternWay.Services.StudentServices;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Org.BouncyCastle.Bcpg.Sig;
using System.ComponentModel;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace InternWay
{ 
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers().AddJsonOptions(option => {
                option.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
            
            });

            builder.Services.AddDbContext<InternShipWayDB>(
                options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("ConnectDBS"))
                );

            builder.Services.AddIdentity<User, IdentityRole<int>>(
                options => {
                    options.Password.RequireLowercase = true;
                    options.Password.RequireUppercase = true;
                    options.Password.RequireDigit = true;
                    options.Password.RequireNonAlphanumeric = true;
                    options.User.RequireUniqueEmail = true;
                    options.Lockout.MaxFailedAccessAttempts = 10;
                    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(10);
                    options.Lockout.AllowedForNewUsers = true;

                }
                )
                .AddEntityFrameworkStores<InternShipWayDB>()
                .AddDefaultTokenProviders();

            builder.Services.Configure<ApiBehaviorOptions>(
                options => options.SuppressModelStateInvalidFilter = true);

            builder.Services.AddAuthentication  (
              Options => 
              {
                  Options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                  Options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;

              }
              )
                .AddJwtBearer (Options =>
                {
                    Options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            var accessToken = context.Request.Query["access_token"];
                            var path = context.HttpContext.Request.Path;
                            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/notificationHub"))
                            {
                                context.Token = accessToken;
                            }
                            return Task.CompletedTask;
                        }
                    };

                    Options.TokenValidationParameters = new TokenValidationParameters
                  {
                      ValidateIssuer = true,
                      ValidateAudience = true,
                      ValidateLifetime = true,
                      ValidateIssuerSigningKey = true,
                      ValidIssuer = builder.Configuration["jwt:issuer"],
                      ValidAudience = builder.Configuration["jwt:audience"],
                      IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["jwt:key"])),
                      ClockSkew = TimeSpan.Zero,
                      RoleClaimType = ClaimTypes.Role,  
                      NameClaimType = ClaimTypes.NameIdentifier
                  };
                  }) ;
           
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend",
                    builder => builder
                        .WithOrigins("http://localhost:3000", "https://proj-intership.vercel.app") //  frontEnd
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials()
                        );
            });

            builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter()
        );
    });
            builder.Services.Configure<PaymobSettings>(
            builder.Configuration.GetSection("Paymob"));

            builder.Services.AddScoped<CloudinaryService>();
            builder.Services.AddScoped<IAppEmailSender , SenderEmail>();
            builder.Services.AddScoped<AccountServices>();
            builder.Services.AddScoped<IServicesOfStudent, servicesOfStudent>();
            builder.Services.AddScoped<IServicesOfCompany, ServicesOfCompany>();
            builder.Services.AddScoped<IServicesOfInternship, ServicesOfInternship>();
            builder.Services.AddScoped<IServicesOfMentor, ServicesOfMentor>();
            builder.Services.AddScoped<ServicesExternalAi>();
            builder.Services.AddScoped<ServicesRelationsOfStudent>();
            builder.Services.AddScoped<ServicesRelationsOfCompany>();
            builder.Services.AddScoped<PaymentSystem>();
            builder.Services.AddScoped<InternWay.IServices.INotificationService, InternWay.Services.NotificationService>();
            builder.Services.AddSignalR();
            builder.Services.AddHttpClient();
            builder.Services.AddHangfire(e => e.UseSqlServerStorage(builder.Configuration.GetConnectionString("ConnectDBS")));
            builder.Services.AddHangfireServer();

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
                  builder.Services.AddSwaggerGen();

                  //Method to add Roles
                  async Task SeedRolesAsync(IApplicationBuilder app)
                  {
                      using (var scope = app.ApplicationServices.CreateScope())
                      {
                          var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();

                          string[] roles = { "student", "company", "mentor" };

                          foreach (var role in roles)
                          {
                              if (!await roleManager.RoleExistsAsync(role))
                              {
                                  await roleManager.CreateAsync(new IdentityRole<int>(role));
                              }
                          }
                      }
                  }

                  var app = builder.Build();
                  //Calling Method
               await   SeedRolesAsync(app);

                  // Configure the HTTP request pipeline.
                  if (app.Environment.IsDevelopment())
                  {
                      app.UseSwagger();
                      app.UseSwaggerUI();
                  }

                  app.UseCors("AllowFrontend");

                  app.UseAuthentication();

                  app.UseAuthorization();

                  app.UseHangfireDashboard("/InternWayDashboard");

                  app.MapControllers();
                  app.MapHub<InternWay.Hubs.NotificationHub>("/notificationHub");

                  app.Run();

              
} } }
