using InventorySaaS.Application.Common.DTOs;
using Microsoft.EntityFrameworkCore;

namespace InventorySaaS.Infrastructure.Common.Extensions;

public static class PaginationExtensions
{
    public static async Task<PagedResponse<T>> ToPagedResponseAsync<T>(
        this IQueryable<T> query,
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        return Create(items, request, totalCount);
    }

    public static PagedResponse<T> ToPagedResponse<T>(
        this IReadOnlyList<T> items,
        PagedRequest request,
        int totalCount)
    {
        return Create(items, request, totalCount);
    }

    public static string? NormalizeSearch(this PagedRequest request)
    {
        return string.IsNullOrWhiteSpace(request.Search) ? null : request.Search.Trim().ToLower();
    }

    private static PagedResponse<T> Create<T>(IReadOnlyList<T> items, PagedRequest request, int totalCount)
    {
        var totalPages = totalCount == 0
            ? 0
            : (int)Math.Ceiling(totalCount / (double)request.PageSize);

        return new PagedResponse<T>
        {
            Items = items,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount,
            TotalPages = totalPages,
            HasPreviousPage = request.PageNumber > 1 && totalPages > 0,
            HasNextPage = request.PageNumber < totalPages
        };
    }
}
