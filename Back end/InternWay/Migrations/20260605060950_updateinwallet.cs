using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InternWay.Migrations
{
    /// <inheritdoc />
    public partial class updateinwallet : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MentorWallets_Mentors_Mentor_Id",
                schema: "PaymentSystem",
                table: "MentorWallets");

            migrationBuilder.DropIndex(
                name: "IX_MentorWallets_Mentor_Id",
                schema: "PaymentSystem",
                table: "MentorWallets");

            migrationBuilder.DropIndex(
                name: "IX_MentorWallets_MentorId",
                schema: "PaymentSystem",
                table: "MentorWallets");

            migrationBuilder.DropColumn(
                name: "Mentor_Id",
                schema: "PaymentSystem",
                table: "MentorWallets");

            migrationBuilder.CreateIndex(
                name: "IX_MentorWallets_MentorId",
                schema: "PaymentSystem",
                table: "MentorWallets",
                column: "MentorId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_MentorWallets_MentorId",
                schema: "PaymentSystem",
                table: "MentorWallets");

            migrationBuilder.AddColumn<int>(
                name: "Mentor_Id",
                schema: "PaymentSystem",
                table: "MentorWallets",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_MentorWallets_Mentor_Id",
                schema: "PaymentSystem",
                table: "MentorWallets",
                column: "Mentor_Id",
                unique: true,
                filter: "[Mentor_Id] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_MentorWallets_MentorId",
                schema: "PaymentSystem",
                table: "MentorWallets",
                column: "MentorId");

            migrationBuilder.AddForeignKey(
                name: "FK_MentorWallets_Mentors_Mentor_Id",
                schema: "PaymentSystem",
                table: "MentorWallets",
                column: "Mentor_Id",
                principalSchema: "mentor",
                principalTable: "Mentors",
                principalColumn: "Mentor_Id");
        }
    }
}
