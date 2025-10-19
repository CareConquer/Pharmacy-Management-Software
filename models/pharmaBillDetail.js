import mongoose from 'mongoose';


const billDetailSchema = new mongoose.Schema({
  bill: { type: mongoose.Schema.Types.ObjectId, ref: 'pharmaBill', required: true },
  // medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  billNo:{type: String, required: true},
  medicineName: { type: String, required: true },
  batchNo: { type: String, required: true },
  expiryDate: { type: String, required: true },
  qty: { type: Number, required: true },
  gst: { type: Number, required: true },
  mrp: { type: Number, required: true },
   hsn: {type: String, required: true},
  company: {type: String, required: true},
  discount: { type: Number, default: 0 }, // Default discount to 0
  totalAmount: { type: Number, required: true },
  billYear: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const pharmaBillDetail = mongoose.model('pharmaBillDetail', billDetailSchema);

export default pharmaBillDetail;

