using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InternWay.Migrations
{
    /// <inheritdoc />
    public partial class addnewtables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Applications_Student_Id",
                schema: "company",
                table: "Applications");

            migrationBuilder.EnsureSchema(
                name: "PaymentSystem");

            migrationBuilder.AddColumn<int>(
                name: "NumCancelSession",
                schema: "student",
                table: "Students",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "NumReschaduleSession",
                schema: "student",
                table: "Students",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SessionLimitedId",
                schema: "student",
                table: "Students",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<decimal>(
                name: "priceSlot",
                schema: "mentor",
                table: "Mentor_Availabilities",
                type: "decimal(18,2)",
                nullable: true,
                oldClrType: typeof(double),
                oldType: "float",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Currency",
                schema: "mentor",
                table: "Mentor_Availabilities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Student_Session_limitations",
                schema: "student",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    CancelCountTotal = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    RescheduleCountTotal = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    LastHourCancellationCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    LastHourRescheduleCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    LastResetDate = table.Column<DateOnly>(type: "date", nullable: false, defaultValueSql: "CAST(GETUTCDATE() AS DATE)"),
                    BookingBlockedUntil = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("Pk_Student_Session_limitation", x => new { x.Id, x.StudentId });
                    table.ForeignKey(
                        name: "FK_Student_Session_limitations_Students_StudentId",
                        column: x => x.StudentId,
                        principalSchema: "student",
                        principalTable: "Students",
                        principalColumn: "Student_Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Wallets",
                schema: "PaymentSystem",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Balance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Wallets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Wallets_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Transactions",
                schema: "PaymentSystem",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WalletId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReferenceId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Transactions_Wallets_WalletId",
                        column: x => x.WalletId,
                        principalSchema: "PaymentSystem",
                        principalTable: "Wallets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Applications_Student_Id_Internship_Id",
                schema: "company",
                table: "Applications",
                columns: new[] { "Student_Id", "Internship_Id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Student_Session_limitations_StudentId",
                schema: "student",
                table: "Student_Session_limitations",
                column: "StudentId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_WalletId",
                schema: "PaymentSystem",
                table: "Transactions",
                column: "WalletId");

            migrationBuilder.CreateIndex(
                name: "IX_Wallets_UserId",
                schema: "PaymentSystem",
                table: "Wallets",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Student_Session_limitations",
                schema: "student");

            migrationBuilder.DropTable(
                name: "Transactions",
                schema: "PaymentSystem");

            migrationBuilder.DropTable(
                name: "Wallets",
                schema: "PaymentSystem");

            migrationBuilder.DropIndex(
                name: "IX_Applications_Student_Id_Internship_Id",
                schema: "company",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "NumCancelSession",
                schema: "student",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "NumReschaduleSession",
                schema: "student",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "SessionLimitedId",
                schema: "student",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "Currency",
                schema: "mentor",
                table: "Mentor_Availabilities");

            migrationBuilder.AlterColumn<double>(
                name: "priceSlot",
                schema: "mentor",
                table: "Mentor_Availabilities",
                type: "float",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Applications_Student_Id",
                schema: "company",
                table: "Applications",
                column: "Student_Id");
        }
    }
}
