import Bill from "../models/Bill.js";
import Test from "../models/medicineModel.js";
import GroupTest from "../models/GroupTest.js";
import PatientReg from "../models/PatientReg.js";
import Supplier from "../models/Supplier.js";
import Medicine from "../models/medicineModel.js";
import PurchaseOrder from "../models/purchaseOrder.js";
import PurchaseOrderDetail from "../models/purchaseOrderDetail.js";
import MedicineAvailable from "../models/MedicineAvailable.js";
import pharmaBill from "../models/pharmaBill.js";
import pharmaBillDetail from "../models/pharmaBillDetail.js";
import XLSX from 'xlsx';
import fs from 'fs';// Import the xlsx library


function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

const dailyCollectionreport = async (req, res) => {
    const date = req.params.date;

    try {
        // Convert the date parameter to a JavaScript Date object
        const selectedDate = new Date(date);

        // Set the time range for the selected date (from midnight to midnight)
        const startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);

        // Use the createdAt field in the Bill model to query data
        const dailyCollectionData = await pharmaBill.find({
            createdAt: { $gte: startDate, $lte: endDate },
        })
            // .populate('refId', 'pName pNum pAge pGender pSalutation')
            // .populate('doctorName', 'drName'); // Reference to the Doctor model, selecting only doctorName field

        // Format the createdAt field as "day month year"
        const formattedData = dailyCollectionData.map(item => {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = new Intl.DateTimeFormat('en-US', options).format(item.createdAt);
            return {
                ...item.toObject(),
                createdAt: formattedDate,
            };
        });

        // Respond with the fetched data
        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching daily collection data:', error);
        res.status(500).json({ error: 'An error occurred while fetching data' });
    }

}



export const monthlyCollectionreport = async (req, res) => {
    try {
        const selectedMonth = req.params.month;

        // Parse the selectedMonth into a Date object
        const selectedDate = new Date(selectedMonth);

        // Calculate the start date for the selected month (1st day)
        const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);

        // Calculate the end date for the selected month (last day)
        const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59, 999);

        // Query the database to retrieve daily collection records for the selected month
        const monthlyCollectionData = await pharmaBill.find({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        })
            // .populate('refId', 'pName pNum pAge pGender pSalutation')
            // .populate('doctorName', 'drName');

        // Format the createdAt field as "day month year"
        const formattedData = monthlyCollectionData.map(item => {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = new Intl.DateTimeFormat('en-US', options).format(item.createdAt);
            return {
                ...item.toObject(),
                createdAt: formattedDate,
            };
        });

        // Respond with the fetched data
        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching monthly collection data:', error);
        res.status(500).json({ error: 'An error occurred while fetching monthly collection data' });
    }
}

export const monthlydueCollectionreport = async (req, res) => {

    try {
        const selectedMonth = req.params.month;

        // Parse the selectedMonth into a Date object
        const selectedDate = new Date(selectedMonth);

        // Calculate the start and end dates for the selected month
        const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);

        // const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

        // Calculate the end date for the selected month (last day)
        const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59, 999);

        // Query the database to retrieve daily collection records for the selected month
        const monthlyCollectionData = await pharmaBill.find({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
            amountDue: { $gt: 0 },
        })
            .populate('refId', 'pName pNum pAge pGender pSalutation')
            .populate('doctorName', 'drName'); // Reference to the Doctor model, selecting only doctorName field

             // Format the createdAt field as "day month year"
        const formattedData = monthlyCollectionData.map(item => {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = new Intl.DateTimeFormat('en-US', options).format(item.createdAt);
            return {
                ...item.toObject(),
                createdAt: formattedDate,
            };
        });

        // Respond with the fetched data
        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching monthly collection data:', error);
        res.status(500).json({ error: 'An error occurred while fetching monthly collection data' });
    }

}

export const downloadDailyCollection = async (req, res) => {
    const date = req.params.date;

    try {
        // Convert the date parameter to a JavaScript Date object
        const selectedDate = new Date(date);

        // Set the time range for the selected date (from midnight to midnight)
        const startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);

        // Use the createdAt field in the Bill model to query data
        const dailyCollectionData = await pharmaBill.find({
            createdAt: { $gte: startDate, $lte: endDate },
        })
            .populate('refId', 'pName pNum pAge pGender pSalutation')
            .populate('doctorName', 'drName');

        // Define custom column names
        const columns = [
            'Date',
            'Bill ID',
            'Patient Name',
            'Doctor Name',
            'Bill Amount',
            'Discount',
            'Revenue',
        ];

        // Map the data to an array of arrays
        const data = dailyCollectionData.map(item => [
            formatDate(item.createdAt),
            item.billId,
            `${item.refId.pSalutation}. ${item.refId.pName}`,
            item.doctorName.drName,
            item.billAmount,
            item.discountAmount,
            item.amountPaid,
        ]);

        // Create a new Excel workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([columns, ...data]);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Collection');

        // Write the workbook to a buffer
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Set the response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="daily-collection.xlsx"');

        // Send the buffer as the response
        res.send(Buffer.from(buffer));
    } catch (error) {
        console.error('Error fetching daily collection data:', error);
        res.status(500).json({ error: 'An error occurred while fetching data' });
    }
}

export const downloadMonthlyCollection = async (req, res) => {

    try {
        const selectedMonth = req.params.month;

        // Parse the selectedMonth into a Date object
        const selectedDate = new Date(selectedMonth);

        // Calculate the start and end dates for the selected month
        const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        // const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

        const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59, 999);


        // Query the database to retrieve daily collection records for the selected month
        const monthlyCollectionData = await pharmaBill.find({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        })
            .populate('refId', 'pName pNum pAge pGender pSalutation')
            .populate('doctorName', 'drName'); // Reference to the Doctor model, selecting only doctorName field

        // // Respond with the fetched data
        // res.json(monthlyCollectionData);

        // Define custom column names
        const columns = [
            'Date',
            'Bill ID',
            'Patient Name',
            'Doctor Name',
            'Bill Amount',
            'Discount',
            'Revenue',
        ];

        // Map the data to an array of arrays
        const data = monthlyCollectionData.map(item => [
            formatDate(item.createdAt),
            item.billId,
            `${item.refId.pSalutation}. ${item.refId.pName}`,
            item.doctorName.drName,
            item.billAmount,
            item.discountAmount,
            item.amountPaid,
        ]);

        // Create a new Excel workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([columns, ...data]);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Monthly Collection');

        // Write the workbook to a buffer
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Set the response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="monthly-collection.xlsx"');

        // Send the buffer as the response
        res.send(Buffer.from(buffer));

    } catch (error) {
        console.error('Error fetching monthly collection data:', error);
        res.status(500).json({ error: 'An error occurred while fetching monthly collection data' });
    }

}


export const downloadTestList = async (req, res) => {
    try {
        // Query the database to retrieve the list of tests
        const testList = await Test.find({});

        // Define custom column names
        const columns = [
            'Category',
            'Name',
            'Method',
            'Sample',
            'Reference Range',
            'Fees',
        ];

        // Map the test data to an array of arrays
        const data = testList.map(test => [
            test.category,
            test.name,
            test.method,
            test.sample,
            test.reference_range,
            test.fees,
        ]);

        // Create a new Excel workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([columns, ...data]);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Test List');

        // Write the workbook to a buffer
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Set the response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="test-list.xlsx"');

        // Send the buffer as the response
        res.send(Buffer.from(buffer));
    } catch (error) {
        console.error('Error fetching test list data:', error);
        res.status(500).json({ error: 'An error occurred while fetching test list data' });
    }
}

export const downloadGroupList = async (req, res) => {
    try {
        // Query the database to retrieve the list of tests
        const testList = await GroupTest.find({});

        // Define custom column names
        const columns = [
            'Category',
            'Name',
            'Fees',
        ];

        // Map the test data to an array of arrays
        const data = testList.map(test => [
            test.groupCategory,
            test.groupName,
            test.groupPrice,
        ]);

        // Create a new Excel workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([columns, ...data]);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Test List');

        // Write the workbook to a buffer
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Set the response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="test-list.xlsx"');

        // Send the buffer as the response
        res.send(Buffer.from(buffer));
    } catch (error) {
        console.error('Error fetching test list data:', error);
        res.status(500).json({ error: 'An error occurred while fetching test list data' });
    }
}

export const dailyRegistration = async (req, res) => {
    const { startDate, endDate } = req.params;

    try {
        // Convert the date parameter to a JavaScript Date object
        // const selectedDate = new Date(date);

        // Set the time range for the selected date (from midnight to midnight)
        const startOfDay = new Date(startDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Use the createdAt field in the Bill model to query data
        const dailyCollectionData = await PatientReg.find({
            createdAt: { $gte: startOfDay, $lte: endOfDay },
        })

        // Format the createdAt field as "day month year"
        const formattedData = dailyCollectionData.map(item => {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = new Intl.DateTimeFormat('en-US', options).format(item.createdAt);
            return {
                ...item.toObject(),
                createdAt: formattedDate,
            };
        });

        // Respond with the fetched data
        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching daily collection data:', error);
        res.status(500).json({ error: 'An error occurred while fetching data' });
    }

}

export const downloadDailyRegistration = async (req, res) => {
    const { startDate, endDate } = req.params;
    try {
       
        // Set the time range for the selected date (from midnight to midnight)
        const startOfDay = new Date(startDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Use the createdAt field in the Bill model to query data
        const dailyCollectionData = await PatientReg.find({
            createdAt: { $gte: startOfDay, $lte: endOfDay },
        })
       
        // Define custom column names
        const columns = [
            'Date',
            'Patient Name',
            'Gender',
            'Age',
            'Contact No.',
            'Email',
        ];

        // Map the data to an array of arrays
        const data = dailyCollectionData.map(item => [
            formatDate(item.createdAt),
            `${item.pSalutation}. ${item.pName}`,
            item.pGender,
            item.pAge,
            item.pNum,
            item.pEmail,
        ]);

        // Create a new Excel workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([columns, ...data]);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Registration Report');

        // Write the workbook to a buffer
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Set the response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="daily-collection.xlsx"');

        // Send the buffer as the response
        res.send(Buffer.from(buffer));
    } catch (error) {
        console.error('Error fetching daily collection data:', error);
        res.status(500).json({ error: 'An error occurred while fetching data' });
    }
}

export const doctorWiseCollection = async (req, res) => {
    const { doctorId, startDate, endDate } = req.params;

    try {
        const startOfDay = new Date(startDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);

        const doctorWiseCollection = await pharmaBill.find({
            doctorName: doctorId,
            createdAt: { $gte: startOfDay, $lte: endOfDay },
        })
            .populate('refId', 'pName pNum pAge pGender pSalutation')
            .populate('doctorName', 'drName'); // Reference to the Doctor model, selecting only doctorName field

        // Format the createdAt field as "day month year"
        const formattedData = doctorWiseCollection.map(item => {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = new Intl.DateTimeFormat('en-US', options).format(item.createdAt);
            return {
                ...item.toObject(),
                createdAt: formattedDate,
            };
        });

        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching doctor-wise collection:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const downloadDoctorWise = async (req, res) => {

    const { doctorId, startDate, endDate } = req.params;

    try {
       
        // Set the time range for the selected date (from midnight to midnight)
        const startDates = new Date(startDate);
        startDates.setHours(0, 0, 0, 0);

        const endDates = new Date(endDate);
        endDates.setHours(23, 59, 59, 999);

        // Use the createdAt field in the Bill model to query data
        const doctorWiseCollectionData = await pharmaBill.find({
            doctorName: doctorId,
            createdAt: { $gte: startDates, $lte: endDates },
        })
            .populate('refId', 'pName pNum pAge pGender pSalutation')
            .populate('doctorName', 'drName');

        // Define custom column names for doctor-wise report
        const columns = [
            'Date',
            'Bill ID',
            'Patient Name',
            'Bill Amount',
            'Discount',
            'Revenue',
        ];

        // Map the data to an array of arrays
        const data = doctorWiseCollectionData.map((item) => [
            formatDate(item.createdAt),
            item.billId,
            `${item.refId.pSalutation}. ${item.refId.pName}`,
            item.billAmount,
            item.discountAmount,
            item.amountPaid,
        ]);

        // Create a new Excel workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([columns, ...data]);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Doctor Wise Collection');

        // Write the workbook to a buffer
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Set the response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="doctor-wise-collection-${formatDate(startDates)}.xlsx"`);

        // Send the buffer as the response
        res.send(Buffer.from(buffer));
    } catch (error) {
        console.error('Error fetching doctor-wise collection data:', error);
        res.status(500).json({ error: 'An error occurred while fetching data' });
    }

}


export default dailyCollectionreport