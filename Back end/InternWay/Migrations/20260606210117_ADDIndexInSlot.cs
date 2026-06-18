using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InternWay.Migrations
{
    /// <inheritdoc />
    public partial class ADDIndexInSlot : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Mentor_Availabilities_mentor_id",
                schema: "mentor",
                table: "Mentor_Availabilities");

            migrationBuilder.CreateIndex(
                name: "IX_Mentor_Availabilities_mentor_id_date_start_time",
                schema: "mentor",
                table: "Mentor_Availabilities",
                columns: new[] { "mentor_id", "date", "start_time" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Mentor_Availabilities_mentor_id_date_start_time",
                schema: "mentor",
                table: "Mentor_Availabilities");

            migrationBuilder.CreateIndex(
                name: "IX_Mentor_Availabilities_mentor_id",
                schema: "mentor",
                table: "Mentor_Availabilities",
                column: "mentor_id");
        }
    }
}
