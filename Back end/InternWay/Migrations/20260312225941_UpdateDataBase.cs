using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InternWay.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDataBase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Mentorship_Sessions_slot_id",
                schema: "mentor",
                table: "Mentorship_Sessions");

            migrationBuilder.DropColumn(
                name: "Expertise",
                schema: "mentor",
                table: "Mentors");

            migrationBuilder.DropColumn(
                name: "topic",
                schema: "mentor",
                table: "Mentor_Availabilities");

            migrationBuilder.RenameColumn(
                name: "city",
                schema: "company",
                table: "Internships",
                newName: "location");

            migrationBuilder.AddColumn<string>(
                name: "CvFileName",
                schema: "student",
                table: "Students",
                type: "varchar(255)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CvURL",
                schema: "student",
                table: "Students",
                type: "varchar(255)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "location",
                schema: "student",
                table: "Students",
                type: "varchar(255)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "topic",
                schema: "mentor",
                table: "Mentorship_Sessions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CvFileName",
                schema: "mentor",
                table: "Mentors",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CvPublicID",
                schema: "mentor",
                table: "Mentors",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CvURL",
                schema: "mentor",
                table: "Mentors",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "location",
                schema: "mentor",
                table: "Mentors",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "rating",
                schema: "mentor",
                table: "Mentors",
                type: "float",
                maxLength: 6,
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "paid_status",
                schema: "mentor",
                table: "Mentor_Availabilities",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "priceSlot",
                schema: "mentor",
                table: "Mentor_Availabilities",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Create_at",
                schema: "company",
                table: "Internships",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<double>(
                name: "priceInternship",
                schema: "company",
                table: "Internships",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "requirements",
                schema: "company",
                table: "Internships",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "location",
                schema: "company",
                table: "Companies",
                type: "varchar(100)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "varchar(100)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Facebook",
                schema: "company",
                table: "Companies",
                type: "varchar(255)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Instagram",
                schema: "company",
                table: "Companies",
                type: "varchar(255)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LinkedIn",
                schema: "company",
                table: "Companies",
                type: "varchar(255)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Twitter",
                schema: "company",
                table: "Companies",
                type: "varchar(255)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "foundedYear",
                schema: "company",
                table: "Companies",
                type: "int",
                nullable: true,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "officeAddress",
                schema: "company",
                table: "Companies",
                type: "varchar(255)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "Experiences",
                schema: "student",
                columns: table => new
                {
                    expertiseId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    companyName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    startDate = table.Column<DateOnly>(type: "date", nullable: false),
                    endDate = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("Experience_Id_PK", x => x.expertiseId);
                });

            migrationBuilder.CreateTable(
                name: "Mentor_Skills",
                schema: "mentor",
                columns: table => new
                {
                    mentor_id = table.Column<int>(type: "int", nullable: false),
                    skill_Id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("Mentor_Skills_PK", x => new { x.mentor_id, x.skill_Id });
                    table.ForeignKey(
                        name: "FK_Mentor_Skills_Mentors_mentor_id",
                        column: x => x.mentor_id,
                        principalSchema: "mentor",
                        principalTable: "Mentors",
                        principalColumn: "Mentor_Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Mentor_Skills_Skills_skill_Id",
                        column: x => x.skill_Id,
                        principalSchema: "company",
                        principalTable: "Skills",
                        principalColumn: "Skill_Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Mentor_Experiences",
                schema: "mentor",
                columns: table => new
                {
                    mentor_id = table.Column<int>(type: "int", nullable: false),
                    expertise_Id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("Mentor_Experiences_PK", x => new { x.mentor_id, x.expertise_Id });
                    table.ForeignKey(
                        name: "FK_Mentor_Experiences_Experiences_expertise_Id",
                        column: x => x.expertise_Id,
                        principalSchema: "student",
                        principalTable: "Experiences",
                        principalColumn: "expertiseId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Mentor_Experiences_Mentors_mentor_id",
                        column: x => x.mentor_id,
                        principalSchema: "mentor",
                        principalTable: "Mentors",
                        principalColumn: "Mentor_Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Student_Experiences",
                schema: "student",
                columns: table => new
                {
                    student_id = table.Column<int>(type: "int", nullable: false),
                    expertise_Id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("Student_Experiences_PK", x => new { x.student_id, x.expertise_Id });
                    table.ForeignKey(
                        name: "FK_Student_Experiences_Experiences_expertise_Id",
                        column: x => x.expertise_Id,
                        principalSchema: "student",
                        principalTable: "Experiences",
                        principalColumn: "expertiseId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Student_Experiences_Students_student_id",
                        column: x => x.student_id,
                        principalSchema: "student",
                        principalTable: "Students",
                        principalColumn: "Student_Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Mentorship_Sessions_slot_id",
                schema: "mentor",
                table: "Mentorship_Sessions",
                column: "slot_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Mentor_Experiences_expertise_Id",
                schema: "mentor",
                table: "Mentor_Experiences",
                column: "expertise_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Mentor_Skills_skill_Id",
                schema: "mentor",
                table: "Mentor_Skills",
                column: "skill_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Student_Experiences_expertise_Id",
                schema: "student",
                table: "Student_Experiences",
                column: "expertise_Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Mentor_Experiences",
                schema: "mentor");

            migrationBuilder.DropTable(
                name: "Mentor_Skills",
                schema: "mentor");

            migrationBuilder.DropTable(
                name: "Student_Experiences",
                schema: "student");

            migrationBuilder.DropTable(
                name: "Experiences",
                schema: "student");

            migrationBuilder.DropIndex(
                name: "IX_Mentorship_Sessions_slot_id",
                schema: "mentor",
                table: "Mentorship_Sessions");

            migrationBuilder.DropColumn(
                name: "CvFileName",
                schema: "student",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "CvURL",
                schema: "student",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "location",
                schema: "student",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "topic",
                schema: "mentor",
                table: "Mentorship_Sessions");

            migrationBuilder.DropColumn(
                name: "CvFileName",
                schema: "mentor",
                table: "Mentors");

            migrationBuilder.DropColumn(
                name: "CvPublicID",
                schema: "mentor",
                table: "Mentors");

            migrationBuilder.DropColumn(
                name: "CvURL",
                schema: "mentor",
                table: "Mentors");

            migrationBuilder.DropColumn(
                name: "location",
                schema: "mentor",
                table: "Mentors");

            migrationBuilder.DropColumn(
                name: "rating",
                schema: "mentor",
                table: "Mentors");

            migrationBuilder.DropColumn(
                name: "paid_status",
                schema: "mentor",
                table: "Mentor_Availabilities");

            migrationBuilder.DropColumn(
                name: "priceSlot",
                schema: "mentor",
                table: "Mentor_Availabilities");

            migrationBuilder.DropColumn(
                name: "Create_at",
                schema: "company",
                table: "Internships");

            migrationBuilder.DropColumn(
                name: "priceInternship",
                schema: "company",
                table: "Internships");

            migrationBuilder.DropColumn(
                name: "requirements",
                schema: "company",
                table: "Internships");

            migrationBuilder.DropColumn(
                name: "Facebook",
                schema: "company",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "Instagram",
                schema: "company",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "LinkedIn",
                schema: "company",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "Twitter",
                schema: "company",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "foundedYear",
                schema: "company",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "officeAddress",
                schema: "company",
                table: "Companies");

            migrationBuilder.RenameColumn(
                name: "location",
                schema: "company",
                table: "Internships",
                newName: "city");

            migrationBuilder.AddColumn<string>(
                name: "Expertise",
                schema: "mentor",
                table: "Mentors",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "topic",
                schema: "mentor",
                table: "Mentor_Availabilities",
                type: "varchar(150)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "location",
                schema: "company",
                table: "Companies",
                type: "varchar(100)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(100)");

            migrationBuilder.CreateIndex(
                name: "IX_Mentorship_Sessions_slot_id",
                schema: "mentor",
                table: "Mentorship_Sessions",
                column: "slot_id");
        }
    }
}
