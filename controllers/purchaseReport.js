import pharmaBillDetail from "../models/pharmaBillDetail.js";
import PurchaseOrder from "../models/purchaseOrder.js";
import PurchaseOrderDetail from "../models/purchaseOrderDetail.js";
import pharmaBill from "../models/pharmaBill.js";
import MedicineAvailable from "../models/MedicineAvailable.js";

export const getPurchaseReport = async (req, res) => {
    const { supplier, startDate, endDate } = req.query;
    
    try {
        // Parse dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Set end of the day for the toDate

        // Find purchase orders within the date range and for the specified supplier
        const purchaseOrders = await PurchaseOrder.find({
            supplier: supplier,
            billDate: { $gte: start, $lte: end }
        });
        

        if (!purchaseOrders.length) {
            return res.status(404).json({ message: 'No purchase orders found for the given criteria.' });
        }

        // Get purchase order details for the found purchase orders
        const purchaseOrderIds = purchaseOrders.map(order => order._id);
        const purchaseOrderDetails = await PurchaseOrderDetail.find({
            purchaseOrder: { $in: purchaseOrderIds }
        });

        // Combine the data
        const report = purchaseOrders.map(order => {
            const details = purchaseOrderDetails.filter(detail => detail.purchaseOrder.equals(order._id));
            return {
                order,
                details
            };
        });

        res.json(report);
    } catch (error) {
        console.error('Error fetching purchase report:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMedicineStock = async (req, res) => {
    const { supplier, startDate, endDate } = req.query;

    try {
        // Parse dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Set end of the day for the toDate

        // Find purchase orders within the date range and for the specified supplier
        const purchaseOrders = await MedicineAvailable.find({
            createdAt: { $gte: start, $lte: end }
        }); // Populate itemId with its name
        
        if (!purchaseOrders.length) {
            return res.status(404).json({ message: 'No purchase orders found for the given criteria.' });
        }

        // Return the purchase orders directly without additional details
        res.json(purchaseOrders);
    } catch (error) {
        console.error('Error fetching purchase report:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const getMedicineWisePurchaseReport = async (req, res) => {
    const { medicine, startDate, endDate } = req.query;

    try {
        // Validate input
        if (!medicine || !startDate || !endDate) {
            return res.status(400).json({ error: 'Item ID, start date, and end date are required.' });
        }

        // Fetch purchase order details for the selected item within the date range
        const purchaseOrderDetails = await PurchaseOrderDetail.find({
            itemId: medicine,
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        });


        // Aggregate purchase details
        const result = purchaseOrderDetails.map(detail => ({
            itemName: detail.itemName,
            batch: detail.batch,
            expiry: detail.expiry,
            mrp: detail.mrp,
            ptr: detail.ptr,
            qty: detail.qty,
            packs: detail.packs,
            totalQty: detail.totalQty,
            free: detail.free,
            schAmt: detail.schAmt,
            disc: detail.disc,
            base: detail.base,
            gst: detail.gst,
            amount: detail.amount,
            purchaseYear: detail.purchaseYear,
            createdAt: detail.createdAt
        }));

        res.json(result);
    } catch (error) {
        console.error('Error fetching medicine wise purchase report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


export const getMedicineWiseSalesReport = async (req, res) => {
    const { medicine, startDate, endDate } = req.query;

    try {
        // Validate input
        if (!medicine || !startDate || !endDate) {
            return res.status(400).json({ error: 'Medicine ID, start date, and end date are required.' });
        }

        // Fetch sales details for the selected medicine within the date range
        const salesDetails = await pharmaBillDetail.find({
            medicineId: medicine,
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        });
        console.log(salesDetails);

        // Extract billNos from salesDetails
        const billNos = [...new Set(salesDetails.map(detail => detail.billNo))];
        // console.log(billNos);
        // Fetch bill details for the extracted billNos
        const bills = await pharmaBill.find({
            billNo: { $in: billNos }
        });

        // Create a map for quick lookup of bill information by billNo
        const billMap = bills.reduce((map, bill) => {
            map[bill.billNo] = bill;
            return map;
        }, {});

        // Combine sales details with corresponding bill details
        const result = salesDetails.map(detail => {
            const bill = billMap[detail.billNo] || {};
            return {
                billDate: bill.billDate,
                billNo: bill.billNo,
                patientId: bill.patientId,
                customerName: bill.customerName,
                contactNo: bill.contactNo,
                qty: detail.qty,
                details: salesDetails.filter(d => d.billNo === detail.billNo) // Include all details for the bill
            };
        });

        // Remove duplicates and aggregate quantities for the selected medicine
        const aggregatedResult = result.map(item => ({
            ...item,
            details: item.details.filter(d => d.medicineId.toString() === medicine)
        }));

        // Send the result
        res.json(aggregatedResult);
    } catch (error) {
        console.error('Error fetching medicine wise sales report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

