import PurchaseOrder from "../models/purchaseOrder.js";
import PurchaseOrderDetail from "../models/purchaseOrderDetail.js";
import MedicineAvailable from "../models/MedicineAvailable.js";
import pharmaBill from "../models/pharmaBill.js";
import pharmaBillDetail from "../models/pharmaBillDetail.js";
import { startOfDay, endOfDay,addMonths, addDays  } from 'date-fns';

export const sales = async (req, res) => {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const startDate = startOfDay(date);
    const endDate = endOfDay(date);

    try {
        const sales = await pharmaBill.find({ createdAt: { $gte: startDate, $lte: endDate } });
        res.json(sales);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const purchases = async (req, res) => {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const startDate = startOfDay(date);
    const endDate = endOfDay(date);

    try {
        const purchases = await PurchaseOrder.find({ createdAt: { $gte: startDate, $lte: endDate } });
        res.json(purchases);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// export const expiringMedicines = async (req, res) => {
//     const date = req.query.date ? new Date(req.query.date) : new Date();
//     const startDate = startOfDay(date);
//     const endDate = endOfDay(addDays(date, 2)); // Add 2 days to the current date

//     try {
//         const medicines = await MedicineAvailable.find({});
//         const expiringMedicines = medicines.filter(medicine => {
//             const [month, year] = medicine.expiry.split('/').map(Number);
//             const expiryDate = new Date(`20${year}`, month - 1); // Assuming the year is 20YY
//             return expiryDate >= startDate && expiryDate <= endDate;
//         });
//         console.log(expiringMedicines)
//         res.json(expiringMedicines);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };

export const expiringMedicines = async (req, res) => {
    try {
        const date = req.query.date ? new Date(req.query.date) : new Date();
        const startDate = startOfDay(date);
        const endDate = endOfDay(addMonths(date, 2)); // 2 months ahead

        const medicines = await MedicineAvailable.find({});
        console.log(medicines);

        const expiringMedicines = medicines.filter(med => {
            if (!med.expiry) return false;

            const [month, year] = med.expiry.split('/').map(Number);
            if (!month || !year) return false;

            // Last day of expiry month
            const expiryDate = new Date(2000 + year, month, 0);

            return expiryDate >= startDate && expiryDate <= endDate;
        });

        console.log(expiringMedicines);
        res.json(expiringMedicines);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



export const expiredMedicines = async (req, res) => {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const startDate = startOfDay(date);

    try {
        const medicines = await MedicineAvailable.find({});
        const expiredMedicines = medicines.filter(medicine => {
            const [month, year] = medicine.expiry.split('/').map(Number);
            const expiryDate = new Date(`20${year}`, month - 1); // Assuming the year is 20YY
            return expiryDate < startDate;
        });
        res.json(expiredMedicines);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


export const custDue = async (req, res) => {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const startDate = startOfDay(date);
    const endDate = endOfDay(date);

    try {
        // Updated query to include the dueAmount > 0 condition
        const custDue = await pharmaBill.find({
            billDate: { $gte: startDate, $lte: endDate },
            dueAmount: { $gt: 0 }
        });
        res.json(custDue);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getDueDistibutors = async (req, res) => {

    try {
        const getDueDistibutors = await PurchaseOrder.find({
            dueAmount: { $gt: 0 }
        }).populate('supplier', 'companyName');

        res.json(getDueDistibutors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

