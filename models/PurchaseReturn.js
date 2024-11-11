import mongoose from 'mongoose';

const purchaseReturnSchema = new mongoose.Schema({
    purchaseOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
    returnDate: { type: Date, default: Date.now },
    totalRefundAmount: { type: Number, required: true },
    purchaseReturnYear: { type: String, required: true },

});

const PurchaseReturn = mongoose.model('PurchaseReturn', purchaseReturnSchema);

export default PurchaseReturn;