using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InternWay.Migrations
{
    /// <inheritdoc />
    public partial class lastMerg : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RelatedEntityId",
                schema: "auth",
                table: "Notifications",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Title",
                schema: "auth",
                table: "Notifications",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Type",
                schema: "auth",
                table: "Notifications",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RelatedEntityId",
                schema: "auth",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "Title",
                schema: "auth",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "Type",
                schema: "auth",
                table: "Notifications");
        }
    }
}
