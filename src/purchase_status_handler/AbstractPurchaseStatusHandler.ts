import PurchaseStatusHandler from "./PurchaseStatusHandler";
import { PurchaseStatus } from "../model/PurchaseStatus";
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

    handle(purchaseStatus: PurchaseStatus) {
        if (this.nextHandler) {
            this.nextHandler.handle(purchaseStatus)
        }
        return null;
    }
}