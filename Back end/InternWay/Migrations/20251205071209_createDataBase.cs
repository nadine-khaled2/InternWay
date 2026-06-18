using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InternWay.Migrations
{
    /// <inheritdoc />
    public partial class createDataBase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "company");

            migrationBuilder.EnsureSchema(
                name: "mentor");

            migrationBuilder.EnsureSchema(
                name: "auth");

            migrationBuilder.EnsureSchema(
                name: "student");

            migrationBuilder.CreateTable(
                name: "RoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<int>(type: "int", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoleClaims", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NormalizedName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Skills",
                schema: "company",
                columns: table => new
                {
                    Skill_Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Skill_Name = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("Skill_Id_PK", x => x.Skill_Id);
                });

            migrationBuilder.CreateTable(
                name: "UserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserClaims", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderKey = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserLogins", x => new { x.LoginProvider, x.ProviderKey });
                });

            migrationBuilder.CreateTable(
                name: "UserRoles",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false),
                    RoleId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRoles", x => new { x.UserId, x.RoleId });
                });

            migrationBuilder.CreateTable(
                name: "Users",
                schema: "auth",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Full_Name = table.Column<string>(type: "varchar(100)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Create_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    Update_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    UserName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NormalizedUserName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "varchar(150)", nullable: false),
                    NormalizedEmail = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    PasswordHash = table.Column<string>(type: "varchar(255)", nullable: false),
                    SecurityStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("User_id_PK", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserTokens",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false),
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                });

            migrationBuilder.CreateTable(
                name: "Companies",
                schema: "company",
                columns: table => new
                {
                    company_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    company_name = table.Column<string>(type: "varchar(150)", nullable: false),
                    industry = table.Column<string>(type: "varchar(150)", nullable: false),
                    location = table.Column<string>(type: "varchar(100)", nullable: true),
                    description = table.Column<string>(type: "text", nullable: false),
                    website = table.Column<string>(type: "varchar(255)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("company_id_PK", x => x.company_id);
                    table.ForeignKey(
                        name: "User_Company_FK",
                        column: x => x.user_id,
                        principalSchema: "auth",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Mentors",
                schema: "mentor",
                columns: table => new
                {
                    Mentor_Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    Expertise = table.Column<string>(type: "text", nullable: false),
                    Job_Title = table.Column<string>(type: "varchar(100)", nullable: false),
                    Years_Experience = table.Column<int>(type: "int", nullable: false),
                    Linkedin = table.Column<string>(type: "varchar(255)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("Mentor_Id_PK", x => x.Mentor_Id);
                    table.ForeignKey(
                        name: "User_Mentor_FK",
                        column: x => x.user_id,
                        principalSchema: "auth",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                schema: "auth",
                columns: table => new
                {
                    Notification_Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    User_Id = table.Column<int>(type: "int", nullable: false),
                    Message_Text = table.Column<string>(type: "text", nullable: false),
                    Create_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    Is_Read = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("Notification_Id_PK", x => x.Notification_Id);
                    table.ForeignKey(
                        name: "User_Notification_FK",
                        column: x => x.User_Id,
                        principalSchema: "auth",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Students",
                schema: "student",
                columns: table => new
                {
                    Student_Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    University = table.Column<string>(type: "varchar(100)", nullable: false),
                    College = table.Column<string>(type: "varchar(100)", nullable: false),
                    Degree = table.Column<string>(type: "varchar(100)", nullable: false),
                    Major = table.Column<string>(type: "varchar(100)", nullable: false),
                    Graduation_Year = table.Column<int>(type: "int", nullable: false),
                    CvPublicID = table.Column<string>(type: "varchar(255)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("Student_Id_PK", x => x.Student_Id);
                    table.ForeignKey(
                        name: "User_Student_FK",
                        column: x => x.user_id,
                        principalSchema: "auth",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Internships",
                schema: "company",
                columns: table => new
                {
                    Internship_Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    company_id = table.Column<int>(type: "int", nullable: false),
                    title = table.Column<string>(type: "varchar(150)", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    duration_months = table.Column<int>(type: "int", nullable: false),
                    location_type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    city = table.Column<string>(type: "varchar(100)", nullable: true),
                    application_deadline = table.Column<DateTime>(type: "datetime2", nullable: false),
                    paid_status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    status = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "Open")
                },
                constraints: table =>
                {
                    table.PrimaryKey("Internship_Id_PK", x => x.Internship_Id);
                    table.ForeignKey(
                        name: "company_Internship_FK",
                        column: x => x.company_id,
                        principalSchema: "company",
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Mentor_Availabilities",
                schema: "mentor",
                columns: table => new
                {
                    Slot_Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    mentor_id = table.Column<int>(type: "int", nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    start_time = table.Column<TimeOnly>(type: "time", nullable: false),
                    end_time = table.Column<TimeOnly>(type: "time", nullable: false),
                    topic = table.Column<string>(type: "varchar(150)", nullable: true),
                    session_link = table.Column<string>(type: "varchar(255)", nullable: false),
                    is_booked = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("Slot_Id_PK", x => x.Slot_Id);
                    table.ForeignKey(
                        name: "Mentor_Mentor_Availability_FK",
                        column: x => x.mentor_id,
                        principalSchema: "mentor",
                        principalTable: "Mentors",
                        principalColumn: "Mentor_Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Student_Skills",
                schema: "student",
                columns: table => new
                {
                    student_id = table.Column<int>(type: "int", nullable: false),
                    skill_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("Student_Skills_PK", x => new { x.student_id, x.skill_id });
                    table.ForeignKey(
                        name: "FK_Student_Skills_Skills_skill_id",
                        column: x => x.skill_id,
                        principalSchema: "company",
                        principalTable: "Skills",
                        principalColumn: "Skill_Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Student_Skills_Students_student_id",
                        column: x => x.student_id,
                        principalSchema: "student",
                        principalTable: "Students",
                        principalColumn: "Student_Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Applications",
                schema: "company",
                columns: table => new
                {
                    Application_Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Student_Id = table.Column<int>(type: "int", nullable: false),
                    Internship_Id = table.Column<int>(type: "int", nullable: false),
                    status = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "Pending"),
                    applied_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("Application_Id_PK", x => x.Application_Id);
                    table.ForeignKey(
                        name: "Internship_Application_FK",
                        column: x => x.Internship_Id,
                        principalSchema: "company",
                        principalTable: "Internships",
                        principalColumn: "Internship_Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "Student_Application_FK",
                        column: x => x.Student_Id,
                        principalSchema: "student",
                        principalTable: "Students",
                        principalColumn: "Student_Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Internship_Skills",
                schema: "company",
                columns: table => new
                {
                    Internship_Id = table.Column<int>(type: "int", nullable: false),
                    Skill_Id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("Internship_Skills_PK", x => new { x.Internship_Id, x.Skill_Id });
                    table.ForeignKey(
                        name: "FK_Internship_Skills_Internships_Internship_Id",
                        column: x => x.Internship_Id,
                        principalSchema: "company",
                        principalTable: "Internships",
                        principalColumn: "Internship_Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Internship_Skills_Skills_Skill_Id",
                        column: x => x.Skill_Id,
                        principalSchema: "company",
                        principalTable: "Skills",
                        principalColumn: "Skill_Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Mentorship_Sessions",
                schema: "mentor",
                columns: table => new
                {
                    session_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    slot_id = table.Column<int>(type: "int", nullable: false),
                    student_id = table.Column<int>(type: "int", nullable: false),
                    status_session = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "Pending"),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("Session_Id_PK", x => x.session_id);
                    table.ForeignKey(
                        name: "mentor_availability_Mentorship_Session_FK",
                        column: x => x.slot_id,
                        principalSchema: "mentor",
                        principalTable: "Mentor_Availabilities",
                        principalColumn: "Slot_Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "student_Mentorship_Session_FK",
                        column: x => x.student_id,
                        principalSchema: "student",
                        principalTable: "Students",
                        principalColumn: "Student_Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Applications_Internship_Id",
                schema: "company",
                table: "Applications",
                column: "Internship_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_Student_Id",
                schema: "company",
                table: "Applications",
                column: "Student_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Companies_user_id",
                schema: "company",
                table: "Companies",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Internship_Skills_Skill_Id",
                schema: "company",
                table: "Internship_Skills",
                column: "Skill_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Internships_company_id",
                schema: "company",
                table: "Internships",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_Mentor_Availabilities_mentor_id",
                schema: "mentor",
                table: "Mentor_Availabilities",
                column: "mentor_id");

            migrationBuilder.CreateIndex(
                name: "IX_Mentors_user_id",
                schema: "mentor",
                table: "Mentors",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Mentorship_Sessions_slot_id",
                schema: "mentor",
                table: "Mentorship_Sessions",
                column: "slot_id");

            migrationBuilder.CreateIndex(
                name: "IX_Mentorship_Sessions_student_id",
                schema: "mentor",
                table: "Mentorship_Sessions",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_User_Id",
                schema: "auth",
                table: "Notifications",
                column: "User_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Skills_Skill_Name",
                schema: "company",
                table: "Skills",
                column: "Skill_Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Student_Skills_skill_id",
                schema: "student",
                table: "Student_Skills",
                column: "skill_id");

            migrationBuilder.CreateIndex(
                name: "IX_Students_user_id",
                schema: "student",
                table: "Students",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                schema: "auth",
                table: "Users",
                column: "Email",
                unique: true,
                filter: "[Email] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Applications",
                schema: "company");

            migrationBuilder.DropTable(
                name: "Internship_Skills",
                schema: "company");

            migrationBuilder.DropTable(
                name: "Mentorship_Sessions",
                schema: "mentor");

            migrationBuilder.DropTable(
                name: "Notifications",
                schema: "auth");

            migrationBuilder.DropTable(
                name: "RoleClaims");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "Student_Skills",
                schema: "student");

            migrationBuilder.DropTable(
                name: "UserClaims");

            migrationBuilder.DropTable(
                name: "UserLogins");

            migrationBuilder.DropTable(
                name: "UserRoles");

            migrationBuilder.DropTable(
                name: "UserTokens");

            migrationBuilder.DropTable(
                name: "Internships",
                schema: "company");

            migrationBuilder.DropTable(
                name: "Mentor_Availabilities",
                schema: "mentor");

            migrationBuilder.DropTable(
                name: "Skills",
                schema: "company");

            migrationBuilder.DropTable(
                name: "Students",
                schema: "student");

            migrationBuilder.DropTable(
                name: "Companies",
                schema: "company");

            migrationBuilder.DropTable(
                name: "Mentors",
                schema: "mentor");

            migrationBuilder.DropTable(
                name: "Users",
                schema: "auth");
        }
    }
}
