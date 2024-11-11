import mongoose from 'mongoose';


const billSchema = new mongoose.Schema({
  billDate: { type: Date, required: true },
  billNo:{type: Number, required: true},
  customerName: { type: String, required: true },
  customerNumber: { type: String, required: true },
  billingFor: { type: String, required: true },
  selectedDoctor: { type: String }, // Optional, if implemented later
  totalAmount: { type: Number, required: true },
  payingAmount: { type: Number, required: true },
  dueAmount: { type: Number, required: true }, 
  refundAmount: { type: Number, required: true },
  paymentType: { type: String, required: true },
  billYear: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },

});

const pharmaBill = mongoose.model('pharmaBill', billSchema);

export default pharmaBill;
