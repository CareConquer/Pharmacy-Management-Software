import mongoose from 'mongoose';

const salesReturnSchema = new mongoose.Schema({
    bill: { type: mongoose.Schema.Types.ObjectId, ref: 'PharmaBill', required: true },
    returnDate: { type: Date, default: Date.now },
    totalRefundAmount: { type: Number, required: true },
    billReturnYear: { type: String, required: true },

});

const SalesReturn = mongoose.model('SalesReturn', salesReturnSchema);

export default SalesReturn;