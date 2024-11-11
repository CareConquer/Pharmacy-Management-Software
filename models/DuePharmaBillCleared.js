import mongoose from 'mongoose';

const DuePharmaBillClearedSchema = new mongoose.Schema({
  pharmaBillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PharmaBill',
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

const DuePharmaBillCleared = mongoose.model('DuePharmaBillCleared', DuePharmaBillClearedSchema);

export default DuePharmaBillCleared;
