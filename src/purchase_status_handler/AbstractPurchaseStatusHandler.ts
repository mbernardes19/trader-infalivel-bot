import PurchaseStatusHandler from "./PurchaseStatusHandler";
import { MonetizzePurchaseStatus } from "../model/MonetizzePurchaseStatus";
import { SceneContextMessageUpdate } from "telegraf/typings/stage";

export default class AbstractPurchaseStatusHandler implements PurchaseStatusHandler {
    private nextHandler: PurchaseStatusHandler;
    protected _ctx: SceneContextMessageUpdate;

    constructor(ctx: SceneContextMessageUpdate) {
        this._ctx = ctx;
    }

    setNext(nextHandler: PurchaseStatusHandler) {
        this.nextHandler = nextHandler
        return this.nextHandler;
    }

    handle(purchaseStatus: MonetizzePurchaseStatus) {
        if (this.nextHandler) {
            this.nextHandler.handle(purchaseStatus)
        }
        return null;
    }
}