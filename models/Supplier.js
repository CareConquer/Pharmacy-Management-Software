// models/Supplier.js
import mongoose from 'mongoose';

const SupplierSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  contactPerson: {
    type: String,
    required: true,
  },
  contactNo: {
    type: String,
    required: true,
  },
  gstin: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Supplier = mongoose.model('Supplier', SupplierSchema);

export default Supplier;
