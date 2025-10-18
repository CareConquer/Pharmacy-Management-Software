import mongoose from 'mongoose';

const medicineTypeSchema = new mongoose.Schema({
  typeName: {
    type: String,
    required: true,
    trim: true,
    unique: true
  }
}, { timestamps: true });

const MedicineType = mongoose.model('MedicineType', medicineTypeSchema);

export default MedicineType;
