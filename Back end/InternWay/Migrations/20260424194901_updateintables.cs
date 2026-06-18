using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InternWay.Migrations
{
    /// <inheritdoc />
    public partial class updateintables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "rating",
                schema: "mentor",
                table: "Mentors");

            migrationBuilder.DropColumn(
                name: "end_time",
                schema: "mentor",
                table: "Mentor_Availabilities");

            migrationBuilder.AlterColumn<string>(
                name: "Degree",
                schema: "student",
                table: "Students",
                type: "varchar(100)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(100)");

            migrationBuilder.AlterColumn<int>(
                name: "topic",
                schema: "mentor",
                table: "Mentorship_Sessions",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<DateTime>(
                name: "MentorJoinedAt",
                schema: "mentor",
                table: "Mentorship_Sessions",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "StudentJoinedAt",
                schema: "mentor",
                table: "Mentorship_Sessions",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "AvgRating",
                schema: "mentor",
                table: "Mentors",
                type: "float",
                maxLength: 5,
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<int>(
                name: "CountReviewers",
                schema: "mentor",
                table: "Mentors",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "description",
                schema: "mentor",
                table: "Mentors",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Duration",
                schema: "mentor",
                table: "Mentor_Availabilities",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<DateOnly>(
                name: "application_deadline",
                schema: "company",
                table: "Internships",
                type: "date",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AddColumn<DateTime>(
                name: "Revoked_At",
                schema: "company",
                table: "Internships",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "startDate",
                schema: "student",
                table: "Experiences",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "endDate",
                schema: "student",
                table: "Experiences",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "companyName",
                schema: "student",
                table: "Experiences",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateTable(
                name: "Reviews",
                schema: "mentor",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    MentorId = table.Column<int>(type: "int", nullable: false),
                    SessionId = table.Column<int>(type: "int", nullable: false),
                    Rating = table.Column<double>(type: "float", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreateAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("Review_Id_PK", x => new { x.Id, x.StudentId, x.SessionId, x.MentorId });
                    table.ForeignKey(
                        name: "FK_Reviews_Mentors_MentorId",
                        column: x => x.MentorId,
                        principalSchema: "mentor",
                        principalTable: "Mentors",
                        principalColumn: "Mentor_Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Reviews_Mentorship_Sessions_SessionId",
                        column: x => x.SessionId,
                        principalSchema: "mentor",
                        principalTable: "Mentorship_Sessions",
                        principalColumn: "session_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Reviews_Students_StudentId",
                        column: x => x.StudentId,
                        principalSchema: "student",
                        principalTable: "Students",
                        principalColumn: "Student_Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_MentorId",
                schema: "mentor",
                table: "Reviews",
                column: "MentorId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_SessionId",
                schema: "mentor",
                table: "Reviews",
                column: "SessionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_StudentId",
                schema: "mentor",
                table: "Reviews",
                column: "StudentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Reviews",
                schema: "mentor");

            migrationBuilder.DropColumn(
                name: "MentorJoinedAt",
                schema: "mentor",
                table: "Mentorship_Sessions");

            migrationBuilder.DropColumn(
                name: "StudentJoinedAt",
                schema: "mentor",
                table: "Mentorship_Sessions");

            migrationBuilder.DropColumn(
                name: "AvgRating",
                schema: "mentor",
                table: "Mentors");

            migrationBuilder.DropColumn(
                name: "CountReviewers",
                schema: "mentor",
                table: "Mentors");

            migrationBuilder.DropColumn(
                name: "description",
                schema: "mentor",
                table: "Mentors");

            migrationBuilder.DropColumn(
                name: "Duration",
                schema: "mentor",
                table: "Mentor_Availabilities");

            migrationBuilder.DropColumn(
                name: "Revoked_At",
                schema: "company",
                table: "Internships");

            migrationBuilder.AlterColumn<string>(
                name: "Degree",
                schema: "student",
                table: "Students",
                type: "varchar(100)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "varchar(100)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "topic",
                schema: "mentor",
                table: "Mentorship_Sessions",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<double>(
                name: "rating",
                schema: "mentor",
                table: "Mentors",
                type: "float",
                maxLength: 6,
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<TimeOnly>(
                name: "end_time",
                schema: "mentor",
                table: "Mentor_Availabilities",
                type: "time",
                nullable: false,
                defaultValue: new TimeOnly(0, 0, 0));

            migrationBuilder.AlterColumn<DateTime>(
                name: "application_deadline",
                schema: "company",
                table: "Internships",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateOnly),
                oldType: "date");

            migrationBuilder.AlterColumn<string>(
                name: "startDate",
                schema: "student",
                table: "Experiences",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "endDate",
                schema: "student",
                table: "Experiences",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "companyName",
                schema: "student",
                table: "Experiences",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);
        }
    }
}
