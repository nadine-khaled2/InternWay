using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InternWay.Migrations
{
    /// <inheritdoc />
    public partial class updateduration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<TimeSpan>(
                name: "Duration",
                schema: "mentor",
                table: "Mentor_Availabilities",
                type: "time",
                nullable: true,
                oldClrType: typeof(TimeSpan),
                oldType: "time",
                oldNullable: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<TimeSpan>(
        name: "Duration",
        schema: "mentor",
        table: "Mentor_Availabilities",
        type: "time",
        nullable: false,
        oldClrType: typeof(TimeSpan),
        oldType: "time",
        oldNullable: true);
        }
    }
}
