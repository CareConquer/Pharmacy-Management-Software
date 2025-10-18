import mongoose from 'mongoose';

const medicineCompanySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true,
    unique: true
  }
}, { timestamps: true });

const MedicineCompany = mongoose.model('MedicineCompany', medicineCompanySchema);

export default MedicineCompany;
