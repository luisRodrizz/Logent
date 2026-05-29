namespace InventorySaaS.Domain.Enums;

public enum AuditAction
{
    Create,
    Update,
    Delete,
    Login,
    Logout,
    StockEntry,
    StockExit,
    StockAdjustment,
    StockTransfer,
    UserCreated,
    UserUpdated,
    UserRoleChanged,
    UserStatusChanged,
    UserPasswordReset,
    ProfilePasswordChanged
}
