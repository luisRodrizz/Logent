using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InventorySaaS.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddStripeBillingFieldsToCompanies : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "StripeCurrentPeriodEnd",
                table: "Companies",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StripeCustomerId",
                table: "Companies",
                type: "nvarchar(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StripeSubscriptionId",
                table: "Companies",
                type: "nvarchar(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StripeSubscriptionStatus",
                table: "Companies",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Companies_StripeCustomerId",
                table: "Companies",
                column: "StripeCustomerId",
                unique: true,
                filter: "[StripeCustomerId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Companies_StripeSubscriptionId",
                table: "Companies",
                column: "StripeSubscriptionId",
                unique: true,
                filter: "[StripeSubscriptionId] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Companies_StripeCustomerId",
                table: "Companies");

            migrationBuilder.DropIndex(
                name: "IX_Companies_StripeSubscriptionId",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "StripeCurrentPeriodEnd",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "StripeCustomerId",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "StripeSubscriptionId",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "StripeSubscriptionStatus",
                table: "Companies");
        }
    }
}
