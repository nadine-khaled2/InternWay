using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InternWay.Migrations
{
    /// <inheritdoc />
    public partial class ADDUpdateInREviews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. شيل الـ PK القديم
            migrationBuilder.DropPrimaryKey(
                name: "Review_Id_PK",
                schema: "mentor",
                table: "Reviews");

            // 2. احذف Id القديم (لو موجود)
            migrationBuilder.DropColumn(
                name: "Id",
                schema: "mentor",
                table: "Reviews");

            // 3. أضف Id جديد بشكل صحيح 👇
            migrationBuilder.AddColumn<int>(
                name: "Id", // ❗ لازم اسم العمود هنا
                schema: "mentor",
                table: "Reviews",
                nullable: false)
                .Annotation("SqlServer:Identity", "1, 1");

            // 4. رجّع الـ PK (Composite + Id)
            migrationBuilder.AddPrimaryKey(
                name: "Review_Id_PK",
                schema: "mentor",
                table: "Reviews",
                columns: new[] { "Id", "StudentId", "SessionId", "MentorId" });

            // 5. Index على Id
            migrationBuilder.CreateIndex(
                name: "IX_Reviews_Id",
                schema: "mentor",
                table: "Reviews",
                column: "Id",
                unique: true);


        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // 1. شيل الـ Index بتاع Id
            migrationBuilder.DropIndex(
                name: "IX_Reviews_Id",
                schema: "mentor",
                table: "Reviews");

            // 2. شيل الـ Primary Key الحالي (Composite + Id)
            migrationBuilder.DropPrimaryKey(
                name: "Review_Id_PK",
                schema: "mentor",
                table: "Reviews");

            // 3. احذف العمود الجديد Id
            migrationBuilder.DropColumn(
                name: "Id",
                schema: "mentor",
                table: "Reviews");

            // 4. رجّع الـ Primary Key القديم (Composite بدون Id)
            migrationBuilder.AddPrimaryKey(
                name: "Review_Id_PK",
                schema: "mentor",
                table: "Reviews",
                columns: new[] { "StudentId", "SessionId", "MentorId" });

        }
    }
}
