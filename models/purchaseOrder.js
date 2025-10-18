import mongoose from 'mongoose';

const PurchaseOrderSchema = new mongoose.Schema({
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  billNo: { type: String, required: true },
  billDate: { type: Date, required: true },
  // dueDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  discount: { type: Number, required: true },
  afterDiscount: { type: Number, required: true },
  gstAmount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  payingAmount: { type: Number, required: true },
  dueAmount: { type: Number, required: true },
  refundAmount: { type: Number, required: true },
  paymentType: { type: String, required: true },
  purchaseYear: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },

});


const PurchaseOrder = mongoose.model('PurchaseOrder', PurchaseOrderSchema);

export default PurchaseOrder;