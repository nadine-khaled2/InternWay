using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InternWay.Migrations
{
    /// <inheritdoc />
    public partial class updaterelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Mentorship_Sessions_slot_id",
                schema: "mentor",
                table: "Mentorship_Sessions");

            migrationBuilder.CreateIndex(
                name: "IX_Mentorship_Sessions_slot_id",
                schema: "mentor",
                table: "Mentorship_Sessions",
                column: "slot_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Mentorship_Sessions_slot_id",
                schema: "mentor",
                table: "Mentorship_Sessions");

            migrationBuilder.CreateIndex(
                name: "IX_Mentorship_Sessions_slot_id",
                schema: "mentor",
                table: "Mentorship_Sessions",
                column: "slot_id",
                unique: true);
        }
    }
}
