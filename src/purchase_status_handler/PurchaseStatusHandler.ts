import { PurchaseStatus } from "../model/PurchaseStatus";

export default interface PurchaseStatusHandler {
    setNext(handler: PurchaseStatusHandler): PurchaseStatusHandler
    handle(purchaseStatus: PurchaseStatus): Promise<void>
}