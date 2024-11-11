import Supplier from "../models/Supplier.js";
import Medicine from "../models/medicineModel.js";
import PurchaseOrder from "../models/purchaseOrder.js";
import PurchaseOrderDetail from "../models/purchaseOrderDetail.js";
import MedicineAvailable from "../models/MedicineAvailable.js";
import pharmaBill from "../models/pharmaBill.js";
import pharmaBillDetail from "../models/pharmaBillDetail.js";
import SalesReturn from "../models/SalesReturn.js";
import SalesReturnDetail from "../models/SalesReturnDetail.js";
import PurchaseReturn from "../models/PurchaseReturn.js";
import PurchaseReturnDetail from "../models/PurchaseReturnDetail.js";
import DuePurchaseCleared from "../models/DuePurchaseCleared.js";
import DuePharmaBillCleared from "../models/DuePharmaBillCleared.js";
import HTMLToPDF from './htmlPf.js';




export const createSupplier = async (req, res) => {
  const { companyName, contactPerson, contactNo, gstin, address } = req.body;
  try {
    const newSupplier = new Supplier({ companyName, contactPerson, contactNo, gstin, address });
    const savedSupplier = await newSupplier.save();
    res.status(201).json(savedSupplier);
  } catch (error) {
    res.status(500).json({ error: 'Error creating supplier' });
  }
};

export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find();
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const findSupplier = async (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  try {
    const id = req.params.supplierId; // Get the patient id from the route parameter
    const test = await Supplier.findById(id); // Use findById to fetch a patient by id
    // console.log('Fetched Test:', test);

    if (!test) {
      return res.status(404).json({ error: 'Dist not found' });
    }

    res.json(test);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Failed to fetch Dist' });
  }
}

export const updateSupplier = async (req, res) => {
  const doctorId = req.params.supplierId;
  const updatedData = req.body;
  // console.log(updatedData);

  try {
    const updatedDoctor = await Supplier.findByIdAndUpdate(
      doctorId,
      updatedData,
      { new: true }
    );

    res.json(updatedDoctor);
  } catch (error) {
    res.status(500).json({ error: 'Error updating doctor' });
  }
};

export const findMedicine = async (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  try {
    const id = req.params.medicineId; // Get the patient id from the route parameter
    const test = await Medicine.findById(id); // Use findById to fetch a patient by id
    // console.log('Fetched Test:', test);

    if (!test) {
      return res.status(404).json({ error: 'Dist not found' });
    }

    res.json(test);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Failed to fetch Dist' });
  }
}

export const updateMedicine = async (req, res) => {
  const medicineId = req.params.medicineId;
  const updatedData = req.body;

  try {
    const updatedMedicine = await Medicine.findByIdAndUpdate(
      medicineId,
      updatedData,
      { new: true }
    );

    res.json(updatedMedicine);
  } catch (error) {
    res.status(500).json({ error: 'Error updating medicine' });
  }
};
// export const purchaseOrder = async (req, res) => {
//   try {
//     const { supplier, billNo, billDate, dueDate, items, amount, discount, afterDiscount, gstAmount, totalAmount, payingAmount, dueAmount, refundAmount, paymentType } = req.body;

//     // Create PurchaseOrder
//     const purchaseOrder = new PurchaseOrder({
//       supplier,
//       billNo,
//       billDate,
//       dueDate,
//       amount,
//       discount,
//       afterDiscount,
//       gstAmount,
//       totalAmount,
//       payingAmount,
//       dueAmount,
//       refundAmount,
//       paymentType,
//     });

//     await purchaseOrder.save();

//     // Create PurchaseOrderDetail for each item
//     const purchaseOrderDetails = items.map(item => ({
//       ...item,
//       purchaseOrder: purchaseOrder._id,
//     }));

//     await PurchaseOrderDetail.insertMany(purchaseOrderDetails);

//     res.status(201).send({ purchaseOrder, purchaseOrderDetails });
//   } catch (error) {
//     res.status(400).send(error);
//   }
// };

// Function to determine financial year based on a given date
const getFinancialYear = (date) => {
  const year = date.getFullYear();
  if (date.getMonth() >= 3) { // April is month 3 in JS Date (0-based index)
    return { start: new Date(year, 3, 1), end: new Date(year + 1, 2, 31), label: `${year}-${year + 1}` };
  } else {
    return { start: new Date(year - 1, 3, 1), end: new Date(year, 2, 31), label: `${year - 1}-${year}` };
  }
};

// export const purchaseOrder = async (req, res) => {
//   try {
//     const { supplier, billNo, billDate, dueDate, items, amount, discount, afterDiscount, gstAmount, totalAmount, payingAmount, dueAmount, refundAmount, paymentType } = req.body;

//     // Create PurchaseOrder
//     const purchaseOrder = new PurchaseOrder({
//       supplier,
//       billNo,
//       billDate,
//       dueDate,
//       amount,
//       discount,
//       afterDiscount,
//       gstAmount,
//       totalAmount,
//       payingAmount,
//       dueAmount,
//       refundAmount,
//       paymentType,
//     });

//     await purchaseOrder.save();

//     // Create PurchaseOrderDetail for each item
//     const purchaseOrderDetails = items.map(item => ({
//       ...item,
//       purchaseOrder: purchaseOrder._id,
//     }));

//     await PurchaseOrderDetail.insertMany(purchaseOrderDetails);

//     // Save items to MedicineAvailable
//     const medicineAvailableData = items.map(item => ({
//       ...item,
//       qty: item.totalQty, 
//       purchaseOrder: purchaseOrder._id,
//     }));

//     await MedicineAvailable.insertMany(medicineAvailableData);

//     res.status(201).send({ purchaseOrder, purchaseOrderDetails });
//   } catch (error) {
//     res.status(400).send(error);
//   }
// };

// export const purchaseOrder = async (req, res) => {
//   try {
//     const { supplier, billNo, billDate, dueDate, items, amount, discount, afterDiscount, gstAmount, totalAmount, payingAmount, dueAmount, refundAmount, paymentType } = req.body;


//     // Get the financial year based on the bill date
//     const purchaseYear = getFinancialYear(new Date(billDate)).label;

//     // Create PurchaseOrder
//     const purchaseOrder = new PurchaseOrder({
//       supplier,
//       billNo,
//       billDate,
//       dueDate,
//       amount,
//       discount,
//       afterDiscount,
//       gstAmount,
//       totalAmount,
//       payingAmount,
//       dueAmount,
//       refundAmount,
//       purchaseYear,
//       paymentType,
//     });

//     await purchaseOrder.save();

//     // Create PurchaseOrderDetail for each item
//     const purchaseOrderDetails = items.map(item => ({
//       ...item,
//       purchaseOrder: purchaseOrder._id,
//       purchaseYear
//     }));

//     await PurchaseOrderDetail.insertMany(purchaseOrderDetails);

//     // Save items to MedicineAvailable
//     const medicineAvailableData = items.map(item => ({
//       ...item,
//       qty: item.totalQty, 
//       purchaseOrder: purchaseOrder._id,

//     }));

//     await MedicineAvailable.insertMany(medicineAvailableData);

//     res.status(201).send({ purchaseOrder, purchaseOrderDetails });
//   } catch (error) {
//     res.status(400).send(error);
//   }
// };

export const purchaseOrder = async (req, res) => {
  try {
    const {
      supplier,
      billNo,
      billDate,
      dueDate,
      items,
      amount,
      discount,
      afterDiscount,
      gstAmount,
      totalAmount,
      payingAmount,
      dueAmount,
      refundAmount,
      paymentType,
    } = req.body;

    // Get the financial year based on the bill date
    const purchaseYear = getFinancialYear(new Date(billDate)).label;

    // Create PurchaseOrder
    const purchaseOrder = new PurchaseOrder({
      supplier,
      billNo,
      billDate,
      dueDate,
      amount,
      discount,
      afterDiscount,
      gstAmount,
      totalAmount,
      payingAmount,
      dueAmount,
      refundAmount,
      purchaseYear,
      paymentType,
    });

    // Create PurchaseOrderDetail for each item
    const purchaseOrderDetails = items.map((item) => ({
      ...item,
      purchaseOrder: purchaseOrder._id,
      purchaseYear,
    }));

    // Save PurchaseOrder and PurchaseOrderDetails in a single transaction
    await Promise.all([
      purchaseOrder.save(),
      PurchaseOrderDetail.insertMany(purchaseOrderDetails),
    ]);

    // Save items to MedicineAvailable
    const medicineAvailableData = items.map((item) => ({
      ...item,
      qty: item.totalQty,
      purchaseOrder: purchaseOrder._id,
    }));
    await MedicineAvailable.insertMany(medicineAvailableData);

    res.status(201).send({ purchaseOrder, purchaseOrderDetails });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).send({ message: error.message });
    }
    res.status(500).send({ message: 'Internal server error' });
  }
};


export const getPurchaseOrders = async (req, res) => {
  try {
    let query = {};

    // Filter by bill number if provided
    if (req.query.billNo) {
      query.billNo = req.query.billNo;
    }

    // Filter by date range if both from and to dates are provided
    if (req.query.fromDate && req.query.toDate) {
      query.billDate = {
        $gte: new Date(req.query.fromDate),
        $lte: new Date(req.query.toDate),
      };
    } else if (req.query.fromDate) {
      query.billDate = {
        $gte: new Date(req.query.fromDate),
      };
    } else if (req.query.toDate) {
      query.billDate = {
        $lte: new Date(req.query.toDate),
      };
    }

    // Filter by distributor name if provided
    if (req.query.distributor) {
      const supplier = await Supplier.findOne({ companyName: req.query.distributor });
      if (supplier) {
        query.supplier = supplier._id;
      } else {
        // Return empty array if distributor not found
        return res.status(404).json([]);
      }
    }

    // Fetch purchase orders based on constructed query
    const purchaseOrders = await PurchaseOrder.find(query).populate('supplier');

    res.status(200).json(purchaseOrders);
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getAvailable = async (req, res) => {
  try {
    const currentDate = new Date();
    const medicines = await MedicineAvailable.find({
      // available: true,
      qty: { $gt: 0 }, // Filter out medicines with quantity less than or equal to zero
    }).lean(); // Converting to plain JavaScript objects for manipulation

    // Filter out expired medicines
    const availableMedicines = medicines.filter(medicine => {
      if (!medicine.expiry) return false; // Handle cases where expiry date might be missing

      // Parse the expiry date string in "MM/YY" format to compare
      const [expiryMonth, expiryYear] = medicine.expiry.split('/');
      const expiryDate = new Date(parseInt(`20${expiryYear}`), parseInt(expiryMonth) - 1, 1); // Assume expiry day as 1 for comparison

      return expiryDate >= currentDate;
    });

    res.status(200).json(availableMedicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// export const saveBill = async (req, res) => {
//   try {
//     const {
//       billDate,
//       customerName,
//       customerNumber,
//       billingFor,
//       selectedDoctor,
//       totalAmount,
//       payingAmount,
//       dueAmount,
//       discountAmount,
//       refundAmount,
//       paymentType,
//       items, // Array of items from request body
//     } = req.body;

//     // Fetch the latest bill number and increment it by 1
//     const latestBill = await pharmaBill.findOne().sort({ billNo: -1 }).exec();
//     const newBillNo = latestBill ? latestBill.billNo + 1 : 1;

//     // Create a new bill instance with the incremented bill number
//     const bill = new pharmaBill({
//       billNo: newBillNo,
//       billDate,
//       customerName,
//       customerNumber,
//       billingFor,
//       selectedDoctor,
//       totalAmount,
//       payingAmount,
//       discountAmount,
//       dueAmount,
//       refundAmount,
//       paymentType,
//     });

//     // Save the bill to the database
//     await bill.save();

//     // Create bill details for each item with the same bill number
//     const billDetails = items.map(item => ({
//       bill: bill._id, // Reference to the bill
//       medicineId: item.itemId,
//       billNo: newBillNo,
//       medicineName: item.medicineName,
//       batchNo: item.batchNo,
//       expiryDate: item.expiryDate,
//       qty: item.qty,
//       gst: item.gst,
//       mrp: item.mrp,
//       discount: item.discount,
//       totalAmount: item.totalAmount,
//     }));

//     // Save all bill details to the database
//     await pharmaBillDetail.insertMany(billDetails);

//     // Update the MedicineAvailable collection to reduce the quantity
//     for (const item of items) {
//       const medicine = await MedicineAvailable.findOne({ itemName: item.medicineName, batch: item.batchNo });
//       if (medicine) {
//         medicine.qty -= item.qty;
//         await medicine.save();
//       } else {
//         throw new Error(`Medicine ${item.medicineName} with batch ${item.batchNo} not found`);
//       }
//     }

//     res.status(201).json({ bill, billDetails });
//   } catch (error) {
//     console.error('Error saving bill:', error);
//     res.status(500).json({ message: 'Failed to save bill' });
//   }
// };


export const saveBill = async (req, res) => {
  try {
    const {
      billDate,
      customerName,
      customerNumber,
      billingFor,
      selectedDoctor,
      totalAmount,
      payingAmount,
      dueAmount,
      discountAmount,
      refundAmount,
      paymentType,
      items, // Array of items from request body
    } = req.body;

    // Get the financial year based on the bill date
    const billYear = getFinancialYear(new Date(billDate)).label;

    // Fetch the latest bill number and increment it by 1
    const latestBill = await pharmaBill.findOne().sort({ billNo: -1 }).exec();
    const newBillNo = latestBill ? latestBill.billNo + 1 : 1;

    // Create a new bill instance with the incremented bill number
    const bill = new pharmaBill({
      billNo: newBillNo,
      billDate,
      customerName,
      customerNumber,
      billingFor,
      selectedDoctor,
      totalAmount,
      payingAmount,
      discountAmount,
      dueAmount,
      refundAmount,
      billYear,
      paymentType,
    });

    // Save the bill to the database
    await bill.save();

    // Create bill details for each item with the same bill number
    const billDetails = items.map(item => ({
      bill: bill._id, // Reference to the bill
      medicineId: item.itemId,
      billNo: newBillNo,
      medicineName: item.medicineName,
      batchNo: item.batchNo,
      expiryDate: item.expiryDate,
      qty: item.qty,
      gst: item.gst,
      mrp: item.mrp,
      discount: item.discount,
      totalAmount: item.totalAmount,
      billYear
    }));

    // Save all bill details to the database
    await pharmaBillDetail.insertMany(billDetails);

    // Update the MedicineAvailable collection to reduce the quantity
    for (const item of items) {
      const medicine = await MedicineAvailable.findOne({ itemName: item.medicineName, batch: item.batchNo });
      if (medicine) {
        medicine.qty -= item.qty;
        await medicine.save();
      } else {
        throw new Error(`Medicine ${item.medicineName} with batch ${item.batchNo} not found`);
      }
    }

    res.status(201).json({ bill, billDetails, billId: bill._id });
  } catch (error) {
    console.error('Error saving bill:', error);
    res.status(500).json({ message: 'Failed to save bill' });
  }
};


// export const pharmaBills = async (req, res) => {
//   try {
//     const { billNo, billDate } = req.query;
//     let query = {};

//     if (billNo) {
//       query.billNo = billNo;
//     }

//     if (billDate) {
//       query.billDate = billDate;
//     }

//     const bills = await pharmaBill.find(query).sort({ billNo: 1 }); // Default sorting by billNo ascending
//     res.json(bills);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

export const pharmaBills = async (req, res) => {
  try {
    const { billNo, billDate } = req.query;
    let query = {};

    // Handle billNo query
    if (billNo) {
      query.billNo = Number(billNo); // Convert billNo to number if it’s not already
    }

    // Handle billDate query
    if (billDate) {
      const date = new Date(billDate);

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }

      // Set date range for querying
      query.billDate = {
        $gte: new Date(date.setHours(0, 0, 0, 0)), // Start of the day
        $lte: new Date(date.setHours(23, 59, 59, 999)) // End of the day
      };
    }

    // Fetch bills from the database
    const bills = await pharmaBill.find(query).sort({ billNo: 1 }); // Default sorting by billNo ascending

    res.json(bills);
  } catch (err) {
    console.error('Error fetching bills:', err);
    res.status(500).json({ error: 'Server error' });
  }
};



export const getBillDetails = async (req, res) => {
  try {
    const { billId } = req.params;

    // Fetch the bill details by ID
    const bill = await pharmaBill.findById(billId);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Fetch the associated bill items
    const billDetails = await pharmaBillDetail.find({ bill: billId });

    res.status(200).json({ ...bill._doc, items: billDetails });
  } catch (error) {
    console.error('Error fetching bill details:', error);
    res.status(500).json({ message: 'Failed to fetch bill details' });
  }
};


export const getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the bill details by ID
    const bill = await PurchaseOrder.findById(id).populate('supplier', 'companyName');

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Fetch the associated bill items
    const billDetails = await PurchaseOrderDetail.find({ purchaseOrder: id });

    res.status(200).json({ ...bill._doc, items: billDetails });
  } catch (error) {
    console.error('Error fetching bill details:', error);
    res.status(500).json({ message: 'Failed to fetch bill details' });
  }
};

export const getBillData = async (id) => {
  try {
    // Fetch the bill details by ID
    const bill = await pharmaBill.findById(id);
    if (!bill) {
      throw new Error('Bill not found');
    }

    // Fetch the associated bill items
    const billDetails = await pharmaBillDetail.find({ bill: id });

    // Return the combined bill data
    return { ...bill._doc, items: billDetails };
  } catch (error) {
    console.error('Error fetching bill details:', error);
    throw new Error('Failed to fetch bill details');
  }
};


export const pharmaBillPrint = async (req, res) => {
  try {
    const id = req.params.id;
    // Assuming you have the billData available
    const billData = await getBillData(id);

    // Generate the HTML content for the bill
    const billDetailsHTML = generateBillHTML(billData);

    // Initialize HTMLToPDF
    const htmlToPDF = new HTMLToPDF();

    // Generate PDF from HTML content
    const pdfBuffer = await htmlToPDF.generatePDF(billDetailsHTML);

    // Set response headers to indicate PDF content
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=bill.pdf');

    // Send the PDF buffer as a response
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('Error printing bill:', error);
    res.status(500).json({ error: 'Failed to print bill' });
  }
};


// export const returnMedicine = async (req, res) => {
//   const { billId } = req.params;
//     const { selectedItems } = req.body; // selectedItems should be an array of bill detail IDs to be returned

//     try {
//         const bill = await pharmaBill.findById(billId);
//         if (!bill) {
//             return res.status(404).json({ error: 'Bill not found' });
//         }

//         const selectedItemsData = await pharmaBillDetail.find({
//             _id: { $in: selectedItems },
//             bill: billId
//         });

//         // Create a new SalesReturn record
//         const totalRefundAmount = selectedItemsData.reduce((sum, item) => sum + item.totalAmount, 0);
//         const salesReturn = new SalesReturn({
//             bill: billId,
//             totalRefundAmount
//         });
//         await salesReturn.save();

//         // Update quantities, remove items, and create SalesReturnDetail records
//         const promises = selectedItemsData.map(async (item) => {
//             const medicine = await MedicineAvailable.findOne({
//               itemId: item.medicineId,
//                 batch: item.batchNo
//             });

//             if (medicine) {
//                 medicine.qty += item.qty;
//                 await medicine.save();
//             }

//             // Create a SalesReturnDetail record
//             const salesReturnDetail = new SalesReturnDetail({
//                 salesReturn: salesReturn._id,
//                 medicineId: item.medicineId,
//                 medicineName: item.medicineName,
//                 batchNo: item.batchNo,
//                 qty: item.qty,
//                 gst: item.gst,
//                 mrp: item.mrp,
//                 totalAmount: item.totalAmount
//             });
//             await salesReturnDetail.save();
//         });

//         await Promise.all(promises);

//         res.status(200).json({ message: 'Medicines returned successfully and quantities updated.' });
//     } catch (error) {
//         console.error('Error returning medicine:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };


export const returnMedicine = async (req, res) => {
  const { billId } = req.params;
  const { selectedItems } = req.body; // selectedItems should be an array of bill detail IDs to be returned

  try {
    const bill = await pharmaBill.findById(billId);
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    const billReturnYear = getFinancialYear(new Date()).label;

    const selectedItemsData = await pharmaBillDetail.find({
      _id: { $in: selectedItems },
      bill: billId
    });

    // Create a new SalesReturn record
    const totalRefundAmount = selectedItemsData.reduce((sum, item) => sum + item.totalAmount, 0);
    const salesReturn = new SalesReturn({
      bill: billId,
      totalRefundAmount,
      billReturnYear
    });
    await salesReturn.save();

    // Update quantities, remove items, and create SalesReturnDetail records
    const promises = selectedItemsData.map(async (item) => {
      const medicine = await MedicineAvailable.findOne({
        itemId: item.medicineId,
        batch: item.batchNo
      });

      if (medicine) {
        medicine.qty += item.qty;
        await medicine.save();
      }

      // Create a SalesReturnDetail record
      const salesReturnDetail = new SalesReturnDetail({
        salesReturn: salesReturn._id,
        medicineId: item.medicineId,
        medicineName: item.medicineName,
        batchNo: item.batchNo,
        qty: item.qty,
        gst: item.gst,
        mrp: item.mrp,
        totalAmount: item.totalAmount,
        billReturnYear
      });
      await salesReturnDetail.save();
    });

    await Promise.all(promises);

    res.status(200).json({ message: 'Medicines returned successfully and quantities updated.' });
  } catch (error) {
    console.error('Error returning medicine:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// export const returnPurchase = async (req, res) => {
//   const { id } = req.params;
//   const { selectedItems } = req.body;
//   console.log(selectedItems);
//   try {
//       const selectedItemsData = await PurchaseOrderDetail.find({
//           _id: { $in: selectedItems },
//           purchaseOrder: id
//       });

//       // Create a new PurchaseReturn record
//       const totalRefundAmount = selectedItemsData.reduce((sum, item) => sum + item.amount, 0);
//       const purchaseReturn = new PurchaseReturn({
//           purchaseOrder: id,
//           totalRefundAmount
//       });
//       await purchaseReturn.save();

//       // Update quantities, remove items, and create PurchaseReturnDetail records
//       const promises = selectedItemsData.map(async (item) => {
//           const medicine = await MedicineAvailable.findOne({
//               itemId: item.itemId,
//               batch: item.batch
//           });

//           if (medicine) {
//               medicine.qty -= item.qty;
//               await medicine.save();
//           }

//           // Create a PurchaseReturnDetail record
//           const purchaseReturnDetail = new PurchaseReturnDetail({
//               purchaseReturn: purchaseReturn._id,
//               medicineId: item.itemId,
//               medicineName: item.itemName,
//               batchNo: item.batch,
//               qty: item.qty,
//               gst: item.gst,
//               mrp: item.mrp,
//               totalAmount: item.amount
//           });
//           await purchaseReturnDetail.save();
//       });

//       await Promise.all(promises);

//       res.status(200).json({ message: 'Items returned successfully and quantities updated.' });
//   } catch (error) {
//       console.error('Error returning items:', error);
//       res.status(500).json({ error: 'Internal server error' });
//   }
// };

export const returnPurchase = async (req, res) => {
  const { id } = req.params;
  const { selectedItems } = req.body;

  try {
    const selectedItemsData = await PurchaseOrderDetail.find({
      _id: { $in: selectedItems },
      purchaseOrder: id
    });

    const purchaseReturnYear = getFinancialYear(new Date()).label;

    // Create a new PurchaseReturn record
    const totalRefundAmount = selectedItemsData.reduce((sum, item) => sum + item.amount, 0);
    const purchaseReturn = new PurchaseReturn({
      purchaseOrder: id,
      totalRefundAmount,
      purchaseReturnYear
    });
    await purchaseReturn.save();

    // Update quantities, remove items, and create PurchaseReturnDetail records
    const promises = selectedItemsData.map(async (item) => {
      const medicine = await MedicineAvailable.findOne({
        itemId: item.itemId,
        batch: item.batch
      });

      if (medicine) {
        medicine.qty -= item.qty;
        await medicine.save();
      }

      // Create a PurchaseReturnDetail record
      const purchaseReturnDetail = new PurchaseReturnDetail({
        purchaseReturn: purchaseReturn._id,
        medicineId: item.itemId,
        medicineName: item.itemName,
        batchNo: item.batch,
        qty: item.qty,
        gst: item.gst,
        mrp: item.mrp,
        totalAmount: item.amount,
        purchaseReturnYear
      });
      await purchaseReturnDetail.save();
    });

    await Promise.all(promises);

    res.status(200).json({ message: 'Items returned successfully and quantities updated.' });
  } catch (error) {
    console.error('Error returning items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// export const clearDue = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const purchaseOrder = await PurchaseOrder.findById(id);

//     if (!purchaseOrder) {
//       return res.status(404).json({ error: 'Purchase order not found' });
//     }

//     purchaseOrder.dueAmount = 0;
//     await purchaseOrder.save();

//     res.status(200).json({ message: 'Due amount cleared successfully' });
//   } catch (error) {
//     console.error('Error clearing due amount:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

export const clearDue = async (req, res) => {
  const { id } = req.params;
  const { clearedAmount, paymentType } = req.body;

  try {
    const purchaseOrder = await PurchaseOrder.findById(id);

    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    if (clearedAmount <= 0 || clearedAmount > purchaseOrder.dueAmount) {
      return res.status(400).json({ message: 'Cleared amount should be greater than 0 and less than or equal to due amount' });
    }

    const duePurchaseCleared = new DuePurchaseCleared({
      purchaseOrderId: id,
      clearedAmount,
      paymentType
    });

    await duePurchaseCleared.save();

    purchaseOrder.dueAmount -= clearedAmount;
    await purchaseOrder.save();

    res.status(201).json({ message: 'Due amount cleared successfully', duePurchaseCleared });
  } catch (error) {
    console.error('Error clearing due amount:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const clearBillDue = async (req, res) => {
  const { id } = req.params; // PharmaBill ID from URL params
  const { clearedAmount, paymentType } = req.body; // Amount to clear and payment type

  try {
    // Find the PharmaBill by ID
    const pharmaBillDetail = await pharmaBill.findById(id);

    if (!pharmaBillDetail) {
      return res.status(404).json({ message: 'PharmaBill not found' });
    }

    // Validate cleared amount
    if (clearedAmount <= 0 || clearedAmount > pharmaBillDetail.dueAmount) {
      return res.status(400).json({ message: 'Cleared amount should be greater than 0 and less than or equal to due amount' });
    }

    // Create a new DuePharmaBillCleared record
    const duePharmaBillCleared = new DuePharmaBillCleared({
      pharmaBillId: id,
      clearedAmount,
      paymentType
    });

    // Save the cleared amount record
    await duePharmaBillCleared.save();

    // Update the due amount on the PharmaBill
    pharmaBillDetail.dueAmount -= clearedAmount;
    if (pharmaBillDetail.dueAmount < 0) {
      pharmaBillDetail.dueAmount = 0; // Ensure dueAmount does not go negative
    }

    await pharmaBillDetail.save();

    res.status(201).json({
      message: 'Due amount cleared successfully',
      duePharmaBillCleared,
      updatedPharmaBill: pharmaBillDetail
    });
  } catch (error) {
    console.error('Error clearing due amount:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// const generateBillHTML = (data) => {
//   let serialNumber = 1; // Initialize the serial number

//   // Function to calculate GST amount
//   const calculateGstAmount = (mrp, gstPercentage) => (mrp * gstPercentage / 100).toFixed(2);

//   const totalMrp = data.items.reduce((sum, item) => sum + (item.mrp * item.qty), 0);
//   const totalDiscount = data.items.reduce((sum, item) => sum + ((item.mrp * item.discount / 100) * item.qty), 0);
//   const totalCgst = data.items.reduce((sum, item) => sum + parseFloat(calculateGstAmount(item.mrp * item.qty, item.gst / 2)), 0);
//   const totalSgst = data.items.reduce((sum, item) => sum + parseFloat(calculateGstAmount(item.mrp * item.qty, item.gst / 2)), 0);
//   const totalGst = totalCgst + totalSgst;
//   const totalAmount = totalMrp - totalDiscount + totalGst;
//   const roundedTotal = totalAmount.toFixed(2);

//   const billDetailsHTML = `
//     <div style="text-align: center; font-family: Arial, sans-serif;">
//         <h1 style="font-weight: bold; font-size: 24px;">Care Conquer</h1>
//         <p>46/4, Hosur Rd, Kudlu Gate, Krishna Reddy Industrial Area, H.S</p>
//         <p>R Extension, Bengaluru, Karnataka 560068</p>
//         <p>Email: careconqueronline@gmail.com</p>
//         <p>PH: 8574968523</p>
//         <h3>BILL RECEIPT</h3>
//         <hr style="border-top: 1px solid #000; margin: 10px 0;">
//     </div>
//     <div style="margin: 20px 0; display: flex; justify-content: space-between;">
//         <div style="width: 48%; font-family: Arial, sans-serif;">
//             <table>
//                 <tr>
//                     <td>Patient Name:</td>
//                     <td><strong>${data.customerName}</strong></td>
//                 </tr>
//                 <tr>
//                     <td>Mobile No:</td>
//                     <td><strong>${data.customerNumber}</strong></td>
//                 </tr>
//                 <tr>
//                     <td>Referred By:</td>
//                     <td><strong>${data.selectedDoctor}</strong></td>
//                 </tr>
//             </table>
//         </div>
//         <div style="width: 48%; font-family: Arial, sans-serif;">
//             <table>
//                 <tr>
//                     <td>Bill ID:</td>
//                     <td><strong>${data.billNo}</strong></td>
//                 </tr>
//                 <tr>
//                     <td>Bill Date:</td>
//                     <td><strong>${data.billDate}</strong></td>
//                 </tr>
//             </table>
//         </div>
//     </div>
//     <hr style="border-top: 1px solid #000; margin: 10px 0;">
//     <div style="font-family: Arial, sans-serif;">
//         <table style="width: 100%; border-collapse: collapse;">
//             <thead>
//                 <tr>
//                     <th style="border: 1px solid #000; padding: 8px; text-align: left;">Sl No.</th>
//                     <th style="border: 1px solid #000; padding: 8px; text-align: left;">Medicine Name</th>
//                     <th style="border: 1px solid #000; padding: 8px; text-align: center;">Qty</th>
//                     <th style="border: 1px solid #000; padding: 8px; text-align: left;">Batch No</th>
//                     <th style="border: 1px solid #000; padding: 8px; text-align: left;">Expiry</th>
//                     <th style="border: 1px solid #000; padding: 8px; text-align: right;">MRP</th>
//                     <th style="border: 1px solid #000; padding: 8px; text-align: right;">Discount</th>
//                     <th style="border: 1px solid #000; padding: 8px; text-align: right;">CGST</th>
//                     <th style="border: 1px solid #000; padding: 8px; text-align: right;">SGST</th>
//                     <th style="border: 1px solid #000; padding: 8px; text-align: right;">Amount</th>
//                 </tr>
//             </thead>
//             <tbody>
//                 ${data.items.map((item) => {
//                     const itemTotal = (item.mrp * item.qty).toFixed(2);
//                     const itemDiscount = (item.mrp * item.discount / 100 * item.qty).toFixed(2);
//                     const itemGstPercentage = item.gst; // GST percentage for the item
//                     const itemCgst = calculateGstAmount(item.mrp * item.qty, itemGstPercentage / 2);
//                     const itemSgst = calculateGstAmount(item.mrp * item.qty, itemGstPercentage / 2);
//                     const itemAmount = (item.mrp * item.qty - itemDiscount + parseFloat(itemCgst) + parseFloat(itemSgst)).toFixed(2);

//                     return `
//                         <tr>
//                             <td style="border: 1px solid #000; padding: 8px; text-align: left;">${serialNumber++}</td>
//                             <td style="border: 1px solid #000; padding: 8px; text-align: left;">${item.medicineName}</td>
//                             <td style="border: 1px solid #000; padding: 8px; text-align: center;">${item.qty}</td>
//                             <td style="border: 1px solid #000; padding: 8px; text-align: left;">${item.batchNo}</td>
//                             <td style="border: 1px solid #000; padding: 8px; text-align: left;">${item.expiryDate}</td>
//                             <td style="border: 1px solid #000; padding: 8px; text-align: right;">${item.mrp}</td>
//                             <td style="border: 1px solid #000; padding: 8px; text-align: right;">${item.discount}%</td>
//                             <td style="border: 1px solid #000; padding: 8px; text-align: right;">${itemCgst}</td>
//                             <td style="border: 1px solid #000; padding: 8px; text-align: right;">${itemSgst}</td>
//                             <td style="border: 1px solid #000; padding: 8px; text-align: right;">${itemAmount}</td>
//                         </tr>
//                     `;
//                 }).join('')}
//             </tbody>
//         </table>
//         <hr style="border-top: 1px solid #000; margin: 10px 0;">
//         <div style="display: flex; justify-content: space-between; font-family: Arial, sans-serif;">
//             <div style="width: 48%;">
//                 <p><strong>Terms & Conditions</strong></p>
//                 <p>Net Payable: Rs. ${roundedTotal}</p>
//                 <p>Billed By: ${data.billedBy}</p>
//                 <p>Sign: _____________</p>
//             </div>
//             <div style="width: 48%; text-align: right;">
//                 <p>Total Item(s): ${data.items.length}</p>
//                 <p>Total MRP: Rs. ${totalMrp.toFixed(2)}</p>
//                 <p>Total Discount: Rs. ${totalDiscount.toFixed(2)}</p>
//                 <p>Total CGST: Rs. ${totalCgst.toFixed(2)}</p>
//                 <p>Total SGST: Rs. ${totalSgst.toFixed(2)}</p>
//                 <p>Total GST: Rs. ${totalGst.toFixed(2)}</p>
//                 <p>Round off: Rs. ${(roundedTotal - totalAmount).toFixed(2)}</p>
//                 <p><strong>Rs. ${roundedTotal}</strong></p>
//             </div>
//         </div>
//     </div>
//   `;

//   return billDetailsHTML;
// };

// const generateBillHTML = (data) => {
//   let serialNumber = 1; // Initialize the serial number

//   // Function to calculate GST amount
//   const calculateGstAmount = (mrp, gstPercentage) => (mrp * gstPercentage / 100).toFixed(2);

//   const totalMrp = data.items.reduce((sum, item) => sum + (item.mrp * item.qty), 0);
//   const totalDiscount = data.items.reduce((sum, item) => sum + ((item.mrp * item.discount / 100) * item.qty), 0);
//   const totalCgst = data.items.reduce((sum, item) => sum + parseFloat(calculateGstAmount(item.mrp * item.qty, item.gst / 2)), 0);
//   const totalSgst = data.items.reduce((sum, item) => sum + parseFloat(calculateGstAmount(item.mrp * item.qty, item.gst / 2)), 0);
//   const totalGst = totalCgst + totalSgst;
//   const totalAmount = totalMrp - totalDiscount + totalGst;
//   const roundedTotal = totalAmount.toFixed(2);

//   const billDetailsHTML = `
//     <div style="text-align: center; font-family: Arial, sans-serif;">
//         <h1 style="font-weight: bold; font-size: 24px;">Care Conquer</h1>
//         <p>46/4, Hosur Rd, Kudlu Gate, Krishna Reddy Industrial Area, H.S</p>
//         <p>R Extension, Bengaluru, Karnataka 560068</p>
//         <p>Email: careconqueronline@gmail.com</p>
//         <p>PH: 8574968523</p>
//         <h3>BILL RECEIPT</h3>
//         <hr style="border-top: 1px solid #000; margin: 10px 0;">
//     </div>
//     <div style="margin: 20px 0; display: flex; justify-content: space-between;">
//         <div style="width: 48%; font-family: Arial, sans-serif;">
//             <table>
//                 <tr>
//                     <td>Patient Name:</td>
//                     <td><strong>${data.customerName}</strong></td>
//                 </tr>
//                 <tr>
//                     <td>Mobile No:</td>
//                     <td><strong>${data.customerNumber}</strong></td>
//                 </tr>
//                 <tr>
//                     <td>Referred By:</td>
//                     <td><strong>${data.selectedDoctor}</strong></td>
//                 </tr>
//             </table>
//         </div>
//         <div style="width: 48%; font-family: Arial, sans-serif;">
//             <table>
//                 <tr>
//                     <td>Bill ID:</td>
//                     <td><strong>${data.billNo}</strong></td>
//                 </tr>
//                 <tr>
//                     <td>Bill Date:</td>
//                     <td><strong>${data.billDate}</strong></td>
//                 </tr>
//             </table>
//         </div>
//     </div>
//     <hr style="border-top: 1px solid #000; margin: 10px 0;">
//     <div style="font-family: Arial, sans-serif;">
//         <table style="width: 100%; border-collapse: collapse;">
//             <thead>
//                 <tr>
//                     <th style="border: 1px solid #000; padding: 8px; text-align: left;">Sl No.</th>
//                     <th style="border: 1px solid #000; padding: 8px; text-align: left;">Medicine Name</th>
//                     <th style="border: 1px solid #000; padding: 8px; text-align: center;">Qty</th>
//                     <th style="border: 1px solid #000; padding: 8px; text-align: left;">Batch No</th>
//                     <th style="border: 1px solid #000; padding: 8px; text-align: left;">Expiry</th>
//                     <th style="border: 1px solid #000; padding: 8px; text-align: right;">MRP</th>
//                     <th style="border: 1px solid #000; padding: 8px; text-align: right;">Discount</th>
//                     <th style="border: 1px solid #000; padding: 8px; text-align: right;">CGST</th>
//                     <th style="border: 1px solid #000; padding: 8px; text-align: right;">SGST</th>
//                     <th style="border: 1px solid #000; padding: 8px; text-align: right;">Amount</th>
//                 </tr>
//             </thead>
//             <tbody>
//                 ${data.items.map((item) => {
//                     const itemGstPercentage = item.gst; // GST percentage for the item
//                     const itemCgst = calculateGstAmount(item.mrp * item.qty, itemGstPercentage / 2);
//                     const itemSgst = calculateGstAmount(item.mrp * item.qty, itemGstPercentage / 2);
//                     const itemAmount = (item.mrp * item.qty);

//                     return `
//                         <tr>
//                             <td style="border: 1px solid #000; padding: 8px; text-align: left;">${serialNumber++}</td>
//                             <td style="border: 1px solid #000; padding: 8px; text-align: left;">${item.medicineName}</td>
//                             <td style="border: 1px solid #000; padding: 8px; text-align: center;">${item.qty}</td>
//                             <td style="border: 1px solid #000; padding: 8px; text-align: left;">${item.batchNo}</td>
//                             <td style="border: 1px solid #000; padding: 8px; text-align: left;">${item.expiryDate}</td>
//                             <td style="border: 1px solid #000; padding: 8px; text-align: right;">${item.mrp}</td>
//                             <td style="border: 1px solid #000; padding: 8px; text-align: right;">${item.discount}%</td>
//                             <td style="border: 1px solid #000; padding: 8px; text-align: right;">${itemCgst}</td>
//                             <td style="border: 1px solid #000; padding: 8px; text-align: right;">${itemSgst}</td>
//                             <td style="border: 1px solid #000; padding: 8px; text-align: right;">${itemAmount}</td>
//                         </tr>
//                     `;
//                 }).join('')}
//             </tbody>
//         </table>
//         <hr style="border-top: 1px solid #000; margin: 10px 0;">
//         <div style="display: flex; justify-content: space-between; font-family: Arial, sans-serif;">
//             <div style="width: 48%;">
//                 <p><strong>Terms & Conditions</strong></p>
//                 <p>Net Payable: Rs. ${roundedTotal}</p>
//                 <p>Billed By: ${data.billedBy}</p>
//                 <p>Sign: _____________</p>
//             </div>
//             <div style="width: 48%; text-align: right;">
//                 <p>Total Item(s): ${data.items.length}</p>
//                 <p>Total MRP: Rs. ${totalMrp.toFixed(2)}</p>
//                 <p>Total Discount: Rs. ${totalDiscount.toFixed(2)}</p>
//                 <p>Total CGST: Rs. ${totalCgst.toFixed(2)}</p>
//                 <p>Total SGST: Rs. ${totalSgst.toFixed(2)}</p>
//                 <p>Total GST: Rs. ${totalGst.toFixed(2)}</p>
//                 <p>Round off: Rs. ${(roundedTotal - totalAmount).toFixed(2)}</p>
//                 <p><strong>Rs. ${roundedTotal}</strong></p>
//             </div>
//         </div>
//     </div>
//   `;

//   return billDetailsHTML;
// };

// const generateBillHTML = (data) => {
//   let serialNumber = 1; // Initialize the serial number

//   // Function to calculate GST amount
//   const calculateGstAmount = (mrp, gstPercentage) => (mrp * gstPercentage / 100).toFixed(2);

//   const totalMrp = data.items.reduce((sum, item) => sum + (item.mrp * item.qty), 0);
//   const totalDiscount = data.items.reduce((sum, item) => sum + ((item.mrp * item.discount / 100) * item.qty), 0);
//   const totalCgst = data.items.reduce((sum, item) => sum + parseFloat(calculateGstAmount(item.mrp * item.qty, item.gst / 2)), 0);
//   const totalSgst = data.items.reduce((sum, item) => sum + parseFloat(calculateGstAmount(item.mrp * item.qty, item.gst / 2)), 0);
//   const totalGst = totalCgst + totalSgst;
//   const totalAmount = totalMrp - totalDiscount + totalGst;
//   const roundedTotal = totalAmount.toFixed(2);

//   const billDetailsHTML = `
//     <div style="text-align: center; font-family: Arial, sans-serif;">
//         <h3>BILL RECEIPT</h3>
//         <hr style="border-top: 1px solid #000; margin: 10px 0;">
//     </div>
//     <div style="margin: 20px 0; display: flex; justify-content: space-between;">
//         <div style="width: 45%; font-family: Arial, sans-serif;">
//             <p><strong>Address:</strong></p>
//             <p>46/4, Hosur Rd, Kudlu Gate, Krishna Reddy Industrial Area, H.S</p>
//             <p>R Extension, Bengaluru, Karnataka 560068</p>
//             <p>Email: careconqueronline@gmail.com</p>
//             <p>PH: 8574968523</p>
//         </div>
//         <div style="width: 45%; font-family: Arial, sans-serif;">
//             <table>
//                 <tr>
//                     <td>Patient Name:</td>
//                     <td><strong>${data.customerName}</strong></td>
//                 </tr>
//                 <tr>
//                     <td>Mobile No:</td>
//                     <td><strong>${data.customerNumber}</strong></td>
//                 </tr>
//                 <tr>
//                     <td>Referred By:</td>
//                     <td><strong>${data.selectedDoctor}</strong></td>
//                 </tr>
//                 <tr>
//                     <td>Bill ID:</td>
//                     <td><strong>${data.billNo}</strong></td>
//                 </tr>
//                 <tr>
//                     <td>Bill Date:</td>
//                     <td><strong>${data.billDate}</strong></td>
//                 </tr>
//             </table>
//         </div>
//     </div>
//     <hr style="border-top: 1px solid #000; margin: 10px 0;">
//     <div style="font-family: Arial, sans-serif;">
//         <table style="width: 100%; border-collapse: collapse;">
//             <thead>
//                 <tr>
//                     <th style="border: 1px solid #000; padding: 8px; text-align: left;">Sl No.</th>
//                     <th style="border: 1px solid #000; padding: 8px; text-align: left;">Medicine Name</th>
//                     <th style="border: 1px solid #000; padding: 8px; text-align: center;">Qty</th>
//                     <th style="border: 1px solid #000; padding: 8px; text-align: left;">Batch No</th>
//                     <th style="border: 1px solid #000; padding: 8px; text-align: left;">Expiry</th>
//                     <th style="border: 1px solid #000; padding: 8px; text-align: right;">MRP</th>
//                     <th style="border: 1px solid #000; padding: 8px; text-align: right;">Discount</th>
//                     <th style="border: 1px solid #000; padding: 8px; text-align: right;">CGST</th>
//                     <th style="border: 1px solid #000; padding: 8px; text-align: right;">SGST</th>
//                     <th style="border: 1px solid #000; padding: 8px; text-align: right;">Amount</th>
//                 </tr>
//             </thead>
//             <tbody>
//                 ${data.items.map((item) => {
//                     const itemGstPercentage = item.gst; // GST percentage for the item
//                     const itemCgst = calculateGstAmount(item.mrp * item.qty, itemGstPercentage / 2);
//                     const itemSgst = calculateGstAmount(item.mrp * item.qty, itemGstPercentage / 2);
//                     const itemAmount = (item.mrp * item.qty);

//                     return `
//                         <tr>
//                             <td style="border: 1px solid #000; padding: 8px; text-align: left;">${serialNumber++}</td>
//                             <td style="border: 1px solid #000; padding: 8px; text-align: left;">${item.medicineName}</td>
//                             <td style="border: 1px solid #000; padding: 8px; text-align: center;">${item.qty}</td>
//                             <td style="border: 1px solid #000; padding: 8px; text-align: left;">${item.batchNo}</td>
//                             <td style="border: 1px solid #000; padding: 8px; text-align: left;">${item.expiryDate}</td>
//                             <td style="border: 1px solid #000; padding: 8px; text-align: right;">${item.mrp}</td>
//                             <td style="border: 1px solid #000; padding: 8px; text-align: right;">${item.discount}%</td>
//                             <td style="border: 1px solid #000; padding: 8px; text-align: right;">${itemCgst}</td>
//                             <td style="border: 1px solid #000; padding: 8px; text-align: right;">${itemSgst}</td>
//                             <td style="border: 1px solid #000; padding: 8px; text-align: right;">${itemAmount}</td>
//                         </tr>
//                     `;
//                 }).join('')}
//             </tbody>
//         </table>
//         <hr style="border-top: 1px solid #000; margin: 10px 0;">
//         <div style="display: flex; justify-content: space-between; font-family: Arial, sans-serif;">
//             <div style="width: 48%;">
//                 <p><strong>Terms & Conditions</strong></p>
//                 <p>Net Payable: Rs. ${roundedTotal}</p>
//                 <p>Billed By: ${data.billedBy}</p>
//                 <p>Sign: _____________</p>
//             </div>
//             <div style="width: 48%; text-align: right;">
//                 <p>Sub Total: ${totalMrp.toFixed(2)}</p>
//                 <p>Bill Disc:  ${totalDiscount.toFixed(2)}</p>
//                 <p>SGST: ${totalSgst.toFixed(2)}</p>
//                 <p>CGST: ${totalCgst.toFixed(2)}</p>
//                 <p>Round off:  ${(roundedTotal - totalAmount).toFixed(2)}</p>
//                 <p><strong>Grand Total ${roundedTotal}</strong></p>
//             </div>
//         </div>
//     </div>
//   `;

//   return billDetailsHTML;
// };

const generateBillHTML = (data) => {
  let serialNumber = 1; // Initialize the serial number

  // Function to calculate GST amount
  const calculateGstAmount = (mrp, gstPercentage) => (mrp * gstPercentage / 100).toFixed(2);

  const totalMrp = data.items.reduce((sum, item) => sum + (item.mrp * item.qty), 0);
  const totalDiscount = data.items.reduce((sum, item) => sum + ((item.mrp * item.discount / 100) * item.qty), 0);
  const totalCgst = data.items.reduce((sum, item) => sum + parseFloat(calculateGstAmount(item.mrp * item.qty, item.gst / 2)), 0);
  const totalSgst = data.items.reduce((sum, item) => sum + parseFloat(calculateGstAmount(item.mrp * item.qty, item.gst / 2)), 0);
  const totalGst = totalCgst + totalSgst;
  const totalAmount = totalMrp - totalDiscount + totalGst;
  const roundedTotal = totalAmount.toFixed(2);

  const billDate = new Date(data.billDate);
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  const formattedBillDate = billDate.toLocaleDateString('en-GB', options);

  const billDetailsHTML = `
    <div style="text-align: center; font-family: Arial, sans-serif;">
        <h3 style="font-size: 15px;">BILL RECEIPT</h3>
        <hr style="border-top: 1px solid #000; margin: 10px 0;">
    </div>
    <div style="margin: 20px 0; display: flex; justify-content: space-between;">
       <div style="width: 45%; font-family: Arial, sans-serif;">
    <span style="font-size: 10px; display: block;"><strong>Address:</strong> 46/4, Hosur Rd, Kudlu Gate, Krishna Reddy Industrial Area, H.S R Extension, Bengaluru, Karnataka 560068</span>
    <span style="font-size: 10px; display: block;">Email: careconqueronline@gmail.com</span>
    <span style="font-size: 10px; display: block;">PH: 8574968523</span>
</div>

        <div style="width: 45%; font-family: Arial, sans-serif;">
            <table style="font-size: 10px;">
                <tr>
                    <td>Patient Name:</td>
                    <td><strong>${data.customerName}</strong></td>
                </tr>
                <tr>
                    <td>Mobile No:</td>
                    <td><strong>${data.customerNumber}</strong></td>
                </tr>
                <tr>
                    <td>Referred By:</td>
                    <td><strong>${data.selectedDoctor}</strong></td>
                </tr>
                <tr>
                    <td>Bill ID:</td>
                    <td><strong>${data.billNo}</strong></td>
                </tr>
                <tr>
                    <td>Bill Date:</td>
                    <td><strong>${formattedBillDate}</strong></td>
                </tr>
            </table>
        </div>
    </div>
    <div style="font-family: Arial, sans-serif;">
        <table style="width: 100%; border-collapse: collapse; font-size: 8px;">
            <thead>
                <tr>
                    <th style="border: 1px solid #000; padding: 4px; text-align: left;">Sl No.</th>
                    <th style="border: 1px solid #000; padding: 4px; text-align: left;">Medicine Name</th>
                    <th style="border: 1px solid #000; padding: 4px; text-align: center;">Qty</th>
                    <th style="border: 1px solid #000; padding: 4px; text-align: left;">Batch No</th>
                    <th style="border: 1px solid #000; padding: 4px; text-align: left;">Expiry</th>
                    <th style="border: 1px solid #000; padding: 4px; text-align: right;">MRP</th>
                    <th style="border: 1px solid #000; padding: 4px; text-align: right;">Discount</th>
                    <th style="border: 1px solid #000; padding: 4px; text-align: right;">CGST</th>
                    <th style="border: 1px solid #000; padding: 4px; text-align: right;">SGST</th>
                    <th style="border: 1px solid #000; padding: 4px; text-align: right;">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${data.items.map((item) => {
    const itemGstPercentage = item.gst; // GST percentage for the item
    const itemCgst = calculateGstAmount(item.mrp * item.qty, itemGstPercentage / 2);
    const itemSgst = calculateGstAmount(item.mrp * item.qty, itemGstPercentage / 2);
    const itemAmount = (item.mrp * item.qty);

    return `
                        <tr>
                            <td style="border: 1px solid #000; padding: 4px; text-align: left;">${serialNumber++}</td>
                            <td style="border: 1px solid #000; padding: 4px; text-align: left;">${item.medicineName}</td>
                            <td style="border: 1px solid #000; padding: 4px; text-align: center;">${item.qty}</td>
                            <td style="border: 1px solid #000; padding: 4px; text-align: left;">${item.batchNo}</td>
                            <td style="border: 1px solid #000; padding: 4px; text-align: left;">${item.expiryDate}</td>
                            <td style="border: 1px solid #000; padding: 4px; text-align: right;">${item.mrp}</td>
                            <td style="border: 1px solid #000; padding: 4px; text-align: right;">${item.discount}%</td>
                            <td style="border: 1px solid #000; padding: 4px; text-align: right;">${itemCgst}</td>
                            <td style="border: 1px solid #000; padding: 4px; text-align: right;">${itemSgst}</td>
                            <td style="border: 1px solid #000; padding: 4px; text-align: right;">${itemAmount}</td>
                        </tr>
                    `;
  }).join('')}
            </tbody>
        </table>
        <div style="display: flex; justify-content: space-between; font-family: Arial, sans-serif;">
            <div style="width: 48%;">
                
            </div>
   <div style="width: 48%; text-align: right; font-size: 10px;">
    <span style="display: block;">Sub Total: ₹${totalMrp.toFixed(2)}</span>
    <span style="display: block;">Bill Disc: ₹${totalDiscount.toFixed(2)}</span>
    <span style="display: block;">SGST: ₹${totalSgst.toFixed(2)}</span>
    <span style="display: block;">CGST: ₹${totalCgst.toFixed(2)}</span>
    <span style="display: block;">Round off: ₹${(roundedTotal - totalAmount).toFixed(2)}</span>
    <span style="display: block;"><strong>Grand Total: ₹${roundedTotal}</strong></span>
</div>

        </div>
    </div>
  `;

  return billDetailsHTML;
};

