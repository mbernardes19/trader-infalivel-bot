import { PurchaseStatus } from "../model/PurchaseStatus";
import { SceneContextMessageUpdate } from "telegraf/typings/stage";
import PurchaseApprovedHandler from "./PurchaseApprovedHandler";
import PlanoNotApprovedHandler from "./PlanoNotApprovedHandler";
import PurchaseNotApprovedHandler from "./PurchaseNotApprovedHandler";
import BoletoPaymentNotApprovedYetHandler from "./BoletoPaymentNotApprovedYet";

const handlePurchaseStatus = (ctx: SceneContextMessageUpdate, purchaseStatus: PurchaseStatus) => {
    const purchaseApproved = new PurchaseApprovedHandler(ctx);
    const purchaseNotApproved = new PurchaseNotApprovedHandler(ctx);
    const planoNotApproved = new PlanoNotApprovedHandler(ctx);
    const boletoNotApprovedYet = new BoletoPaymentNotApprovedYetHandler(ctx);

    purchaseApproved
        .setNext(purchaseNotApproved)
        .setNext(boletoNotApprovedYet)
        .setNext(planoNotApproved)

    purchaseApproved.handle(purchaseStatus)
}

export default handlePurchaseStatus