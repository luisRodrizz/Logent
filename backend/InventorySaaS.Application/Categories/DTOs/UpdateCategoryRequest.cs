namespace InventorySaaS.Application.Categories.DTOs;

public class UpdateCategoryRequest
{
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }
}
