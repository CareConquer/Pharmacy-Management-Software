import mongoose from 'mongoose';

const PurchaseOrderDetailSchema = new mongoose.Schema({
  purchaseOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
  // itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  itemName: { type: String, required: true },
  batch: { type: String, required: true },
  expiry: { type: String, required: true },
  mrp: { type: Number, required: true },
  ptr: { type: Number, required: true },
  qty: { type: Number, required: true },
  packs: { type: Number, required: true },
  totalQty: { type: Number, required: true },
  free: { type: Number, required: true },
  schAmt: { type: Number, required: true },
  disc: { type: Number, required: true },
  base: { type: Number, required: true },
  gst: { type: Number, required: true },
  amount: { type: Number, required: true },
  purchaseYear: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  
});


const PurchaseOrderDetail = mongoose.model('PurchaseOrderDetail', PurchaseOrderDetailSchema);

export default PurchaseOrderDetail;