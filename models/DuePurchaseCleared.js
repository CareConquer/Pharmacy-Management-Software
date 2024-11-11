import mongoose from 'mongoose';

const DuePurchaseClearedSchema = new mongoose.Schema({
  purchaseOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrder',
    required: true
  },
  clearedAmount: {
    type: Number,
    required: true
  },
  paymentType: {
    type: String,
    enum: ['Cash', 'PhonePe', 'GPay', 'Online'],
    required: true
  },
  clearedDate: {
    type: Date,
  }
});

const DuePurchaseCleared = mongoose.model('DuePurchaseCleared', DuePurchaseClearedSchema);

export default DuePurchaseCleared;