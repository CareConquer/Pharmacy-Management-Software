import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  MedicineName: {
    type: String,
    required: true
  },
  MedicineCompany: { 
    type: String,
    required: true
  },
  Composition: { 
    type: String,
    required: true
  },
  MedicineType: {
    type: String,
    required: true
  },
  HSNCode: {
    type: String,
    required: true
  },
  Schedule: {
    type: String,
    required: true
  },
  ReOrderLevel: {
    type: Number,
    required: true
  }
});

const Medicine = mongoose.model('Medicine', medicineSchema);

export default Medicine;
