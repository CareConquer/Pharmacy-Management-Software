import mongoose from "mongoose";

const medicineAvailableSchema = new mongoose.Schema({
  // itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  itemName: { type: String, required: true },
  batch: { type: String, required: true },
  expiry: { type: String, required: true },
  mrp: { type: Number, required: true },
  ptr: { type: Number, required: true },
  qty: { type: Number, required: true },
  free: { type: Number, default: 0 },
  schAmt: { type: Number, required: true },
  disc: { type: Number, required: true },
  base: { type: Number, required: true },
  gst: { type: Number, required: true },
  amount: { type: Number, required: true },
  purchaseOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
  createdAt: { type: Date, default: Date.now },

});

const MedicineAvailable = mongoose.model('MedicineAvailable', medicineAvailableSchema);

export default MedicineAvailable;
