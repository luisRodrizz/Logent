# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY backend/InventorySaaS.Domain/InventorySaaS.Domain.csproj backend/InventorySaaS.Domain/
COPY backend/InventorySaaS.Application/InventorySaaS.Application.csproj backend/InventorySaaS.Application/
COPY backend/InventorySaaS.Infrastructure/InventorySaaS.Infrastructure.csproj backend/InventorySaaS.Infrastructure/
COPY backend/InventorySaaS.WebApi/InventorySaaS.WebApi.csproj backend/InventorySaaS.WebApi/

RUN dotnet restore backend/InventorySaaS.WebApi/InventorySaaS.WebApi.csproj

COPY backend/ backend/

RUN dotnet publish backend/InventorySaaS.WebApi/InventorySaaS.WebApi.csproj \
    --configuration Release \
    --output /app/publish \
    --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_RUNNING_IN_CONTAINER=true

EXPOSE 8080

COPY --from=build /app/publish .

ENTRYPOINT ["sh", "-c", "dotnet InventorySaaS.WebApi.dll --urls http://0.0.0.0:${PORT:-8080}"]
