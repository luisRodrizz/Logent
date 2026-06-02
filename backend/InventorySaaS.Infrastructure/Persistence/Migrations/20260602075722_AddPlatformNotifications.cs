using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InventorySaaS.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPlatformNotifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PlatformNotifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Severity = table.Column<int>(type: "int", nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReadAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompanyId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    RelatedEntityName = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    RelatedEntityId = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    ActionUrl = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlatformNotifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlatformNotifications_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PlatformNotifications_CompanyId",
                table: "PlatformNotifications",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_PlatformNotifications_IsRead_CreatedAt",
                table: "PlatformNotifications",
                columns: new[] { "IsRead", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PlatformNotifications");
        }
    }
}
