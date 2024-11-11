import mongoose from 'mongoose';

const purchaseReturnDetailSchema = new mongoose.Schema({
    purchaseReturn: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseReturn', required: true },
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    medicineName: { type: String, required: true },
    batchNo: { type: String, required: true },
    qty: { type: Number, required: true },
    gst: { type: Number, required: true },
    mrp: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    purchaseReturnYear: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const PurchaseReturnDetail = mongoose.model('PurchaseReturnDetail', purchaseReturnDetailSchema);

export default PurchaseReturnDetail;