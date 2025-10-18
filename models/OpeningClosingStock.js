import mongoose from "mongoose";

const StockSchema = new mongoose.Schema({
  medicineName: { type: String, required: true },
  batchNo: { type: String, required: true },
  openingStock: { type: Number, default: 0 },
  purchase: { type: Number, default: 0 },
  sales: { type: Number, default: 0 },
  currentStock: { type: Number, default: 0 },
  stockDate: { type: Date, required: true },
  purchaseOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder' }, // optional link
  createdAt: { type: Date, default: Date.now },
});

const OpeningClosingStock = mongoose.model("OpeningClosingStock", StockSchema);

export default OpeningClosingStock;
