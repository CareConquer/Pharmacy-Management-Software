import mongoose from 'mongoose';

const salesReturnDetailSchema = new mongoose.Schema({
    salesReturn: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesReturn', required: true },
    // medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    medicineName: { type: String, required: true },
    batchNo: { type: String, required: true },
    qty: { type: Number, required: true },
    gst: { type: Number, required: true },
    mrp: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    billReturnYear: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const SalesReturnDetail = mongoose.model('SalesReturnDetail', salesReturnDetailSchema);

export default SalesReturnDetail;