namespace InventorySaaS.Domain.Enums;

public enum TenantNotificationType
{
    UpgradeRequestCreated,
    UpgradeRequestApproved,
    UpgradeRequestRejected,
    PlanUpdatedByStripe,
    BillingPaymentSucceeded,
    BillingPaymentFailed,
    BillingSubscriptionCancelled,
    InvitationAccepted,
    PasswordChanged,
    System
}
