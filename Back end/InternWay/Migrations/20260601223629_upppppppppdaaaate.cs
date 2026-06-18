using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InternWay.Migrations
{
    /// <inheritdoc />
    public partial class upppppppppdaaaate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Wallets_WalletId",
                schema: "PaymentSystem",
                table: "Transactions");

            migrationBuilder.DropTable(
                name: "Wallets",
                schema: "PaymentSystem");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_WalletId",
                schema: "PaymentSystem",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "Reason",
                schema: "PaymentSystem",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "ReferenceId",
                schema: "PaymentSystem",
                table: "Transactions");

            migrationBuilder.RenameColumn(
                name: "Status",
                schema: "PaymentSystem",
                table: "Transactions",
                newName: "TransactionId");

            migrationBuilder.AlterColumn<string>(
                name: "Type",
                schema: "PaymentSystem",
                table: "Transactions",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "SessionId",
                schema: "PaymentSystem",
                table: "Transactions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<decimal>(
                name: "priceSlot",
                schema: "mentor",
                table: "Mentor_Availabilities",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
    name: "Duration_New",
    schema: "mentor",
    table: "Mentor_Availabilities",
    type: "time",
    nullable: true);
            migrationBuilder.DropColumn(
    name: "Duration",
    schema: "mentor",
    table: "Mentor_Availabilities");
            migrationBuilder.RenameColumn(
    name: "Duration_New",
    schema: "mentor",
    table: "Mentor_Availabilities",
    newName: "Duration");

            migrationBuilder.CreateTable(
                name: "MentorWallets",
                schema: "PaymentSystem",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MentorId = table.Column<int>(type: "int", nullable: false),
                    CurrentBalance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PendingBalance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Mentor_Id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MentorWallets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MentorWallets_Mentors_MentorId",
                        column: x => x.MentorId,
                        principalSchema: "mentor",
                        principalTable: "Mentors",
                        principalColumn: "Mentor_Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MentorWallets_Mentors_Mentor_Id",
                        column: x => x.Mentor_Id,
                        principalSchema: "mentor",
                        principalTable: "Mentors",
                        principalColumn: "Mentor_Id");
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                schema: "PaymentSystem",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SessionId = table.Column<int>(type: "int", nullable: false),
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TransactionId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RefundStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RefundedAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Payments_Mentorship_Sessions_SessionId",
                        column: x => x.SessionId,
                        principalSchema: "mentor",
                        principalTable: "Mentorship_Sessions",
                        principalColumn: "session_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Payments_Students_StudentId",
                        column: x => x.StudentId,
                        principalSchema: "student",
                        principalTable: "Students",
                        principalColumn: "Student_Id",
                        onDelete: ReferentialAction.Cascade);
                });

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

            migrationBuilder.CreateIndex(
                name: "IX_Payments_SessionId",
                schema: "PaymentSystem",
                table: "Payments",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_StudentId",
                schema: "PaymentSystem",
                table: "Payments",
                column: "StudentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MentorWallets",
                schema: "PaymentSystem");

            migrationBuilder.DropTable(
                name: "Payments",
                schema: "PaymentSystem");

            migrationBuilder.DropColumn(
                name: "SessionId",
                schema: "PaymentSystem",
                table: "Transactions");

            migrationBuilder.RenameColumn(
                name: "TransactionId",
                schema: "PaymentSystem",
                table: "Transactions",
                newName: "Status");

            migrationBuilder.AlterColumn<int>(
                name: "Type",
                schema: "PaymentSystem",
                table: "Transactions",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "Reason",
                schema: "PaymentSystem",
                table: "Transactions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "ReferenceId",
                schema: "PaymentSystem",
                table: "Transactions",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "priceSlot",
                schema: "mentor",
                table: "Mentor_Availabilities",
                type: "decimal(18,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldDefaultValue: 0m);

            migrationBuilder.AlterColumn<int>(
                name: "Duration",
                schema: "mentor",
                table: "Mentor_Availabilities",
                type: "int",
                nullable: false,
                oldClrType: typeof(TimeSpan),
                oldType: "time");

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

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Wallets_WalletId",
                schema: "PaymentSystem",
                table: "Transactions",
                column: "WalletId",
                principalSchema: "PaymentSystem",
                principalTable: "Wallets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
