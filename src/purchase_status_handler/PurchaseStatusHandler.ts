import { MonetizzePurchaseStatus } from "../model/MonetizzePurchaseStatus";

export default interface PurchaseStatusHandler {
    setNext(handler: PurchaseStatusHandler): PurchaseStatusHandler
    handle(purchaseStatus: MonetizzePurchaseStatus): Promise<void>
}