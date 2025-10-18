import Bill from "../models/Bill.js";
import Test from "../models/Tests.js";
import GroupTest from "../models/GroupTest.js";
import BillDetail from '../models/BillDetails.js';
import CreateProfile from "../models/CreateProfile.js";
import labResultDetail from "../models/labResultDetail.js";
import labResult from "../models/labResult.js";
import PatientReg from '../models/PatientReg.js';
import FormData from 'form-data';
import nodemailer from 'nodemailer';
import pkg from 'qrcode';
import fs from 'fs';
import axios from 'axios';
import { PDFDocument, rgb } from 'pdf-lib';
import { promises as fsPromises } from 'fs';
import { convert } from 'html-to-text';

export const labReport = async (req, res) => {
    try {
        const id = req.params.id;
        const { selectedTestsData } = req.body;

        const bill = await Bill.findById(id)
            .populate('refId', 'pName pNum pAge pGender pSalutation')
            .populate('doctorName', 'drName')
            .exec();

        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        function formatDate(dateString) {
            const date = new Date(dateString);
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        }

        const data = {
            data: {
                billId: bill.billId,
                pName: bill.refId.pName,
                pAge: bill.refId.pAge,
                pGender: bill.refId.pGender,
                pSal: bill.refId.pSalutation,
                drName: bill.doctorName.drName,
                billAmount: bill.billAmount,
                amountDue: bill.amountDue,
                amountPaid: bill.amountPaid,
                billDate: formatDate(bill.createdAt),
            },
            feesData: [],
        };

        const feesData = await labResultDetail.find({ objbillId: id });

        for (const fee of feesData) {
            if (selectedTestsData.includes(fee.resultId.toString())) {
                let feesType = await getFeesType(fee.fieldId, fee.type);
                if (feesType) {
                    let feesTypeName;
                    let reference_range = '';
                    let units = '';
                    let category = '';
                    let comments = '';
                    let method = '';
                    let labResultArray = [];

                    if (fee.type === 'Profile') {
                        // Your code for profile type tests
                    } else if (fee.type === 'Group') {
                        feesTypeName = feesType.groupName;
                        if (!data.feesData.some((details) => details.feesType === feesTypeName)) {
                            const group = await GroupTest.findById(fee.fieldId, 'testFields groupCategory');
                            if (group) {
                                const testIds = group.testFields.map(field => field.testId);
                                const testDetails = await Test.find({ _id: { $in: testIds } }, 'reference_range units name category comments method');
                                if (testDetails) {
                                    const orderedTestFields = group.testFields.map(field => {
                                        const testDetail = testDetails.find(detail => detail._id.equals(field.testId));
                                        return {
                                            _id: testDetail._id,
                                            name: testDetail.name,
                                            reference_range: testDetail.reference_range,
                                            units: testDetail.units,
                                            category: testDetail.category,
                                            comments: testDetail.comments,
                                            method: testDetail.method,
                                            testid: fee.testId,
                                            type: fee.type,
                                        };
                                    });

                                    // Fetch lab results based on the test ID
                                    const labResults = await labResultDetail.find({
                                        objbillId: id,
                                        id: { $in: testIds } // Filter by IDs
                                    });

                                    const labResultArray = orderedTestFields.map(test => {
                                        const groupTest = group.testFields.find(field => field.testId.equals(test._id));
                                    
                                        // Assuming that the testName is a property of the groupTest object
                                        const testName = groupTest ? groupTest.subCat : '';
                                    
                                        const resultsForTest = labResults.filter(result => result.id.equals(test._id));
                                    
                                        // Extracting both result and abnormalValue
                                        const testResults = resultsForTest.map(result => ({
                                            testName: testName,
                                            result: result.result,
                                            abnormalValue: result.abnormalValue, // Assuming there's an abnormalValue field in labResultDetail
                                        }));
                                    
                                        return testResults;
                                    }).flat(); // Use flat to flatten the nested arrays
                                    
                                    // console.log(labResultArray);

                                    data.feesData.push({
                                        id: fee._id,
                                        type: fee.type,
                                        testid: fee.testId,
                                        feesType: feesTypeName,
                                        fees: fee.fees,
                                        category: group.groupCategory,
                                        discount: fee.discount,
                                        tests: orderedTestFields,
                                        labResults: labResultArray,
                                    });
                                }
                            }
                        }
                    } else {
                        feesTypeName = feesType.name;
                        reference_range = feesType.reference_range;
                        units = feesType.units;
                        category = feesType.category;
                        comments = feesType.comments;
                        method = feesType.method;

                        const labResults = await labResultDetail.find({ objbillId: id, fieldId: fee.fieldId });

                        const labResultArray = labResults.map(result => ({
                            result: result.result,
                            abnormalValue: result.abnormalValue, 
                        }));
                        
                        // console.log(labResultArray);

                        data.feesData.push({
                            id: fee._id,
                            type: fee.type,
                            testid: fee.testId,
                            feesType: feesTypeName,
                            fees: fee.fees,
                            reference_range: reference_range,
                            units: units,
                            comments: comments,
                            method: method,
                            category: category,
                            discount: fee.discount,
                            labResults: labResultArray,
                        });
                    }
                }
            }
        }

        const pdfBuffer = await generatePDF(data);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=lab-report-${id}.pdf`);
        res.status(200).end(pdfBuffer);
    } catch (error) {
        console.error('Error fetching or generating data:', error);
        res.status(500).json({ error: 'An error occurred while processing the request' });
    }
};

export const WHlabReport = async (req, res) => {
    try {
        const id = req.params.id;
        const { selectedTestsData } = req.body;

        const bill = await Bill.findById(id)
            .populate('refId', 'pName pNum pAge pGender pSalutation')
            .populate('doctorName', 'drName')
            .exec();

        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        function formatDate(dateString) {
            const date = new Date(dateString);
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        }

        const data = {
            data: {
                billId: bill.billId,
                pName: bill.refId.pName,
                pAge: bill.refId.pAge,
                pGender: bill.refId.pGender,
                pSal: bill.refId.pSalutation,
                drName: bill.doctorName.drName,
                billAmount: bill.billAmount,
                amountDue: bill.amountDue,
                amountPaid: bill.amountPaid,
                billDate: formatDate(bill.createdAt),
            },
            feesData: [],
        };

        const feesData = await labResultDetail.find({ objbillId: id });

        for (const fee of feesData) {
            if (selectedTestsData.includes(fee.resultId.toString())) {
                const feesType = await getFeesType(fee.fieldId, fee.type);
                if (feesType) {
                    let feesTypeName;
                    let reference_range = '';
                    let units = '';
                    let category = '';
                    let comments = '';
                    let method = '';
                    let labResultArray = [];

                    if (fee.type === 'Profile') {
                        // Your code for profile type tests
                    } else if (fee.type === 'Group') {
                        feesTypeName = feesType.groupName;
                        if (!data.feesData.some((details) => details.feesType === feesTypeName)) {
                            // const labResults = await labResultDetail.find({ objbillId: id, id: fee.id });

                            // labResultArray = labResults.map(result => ({
                            //     result: result.result,
                            // }));

                            const group = await GroupTest.findById(fee.fieldId, 'testFields groupCategory');
                            if (group) {
                                const testIds = group.testFields.map(field => field.testId);
                                const testDetails = await Test.find({ _id: { $in: testIds } }, 'reference_range units name category comments method');
                                if (testDetails) {
                                    const orderedTestFields = group.testFields.map(field => {
                                        const testDetail = testDetails.find(detail => detail._id.equals(field.testId));
                                        return {
                                            _id: testDetail._id,
                                            name: testDetail.name,
                                            reference_range: testDetail.reference_range,
                                            units: testDetail.units,
                                            category: testDetail.category,
                                            comments: testDetail.comments,
                                            method: testDetail.method,
                                            testid: fee.testId,
                                            type: fee.type,
                                        };
                                    });

                                    // Fetch lab results based on the test ID
                                    const labResults = await labResultDetail.find({
                                        objbillId: id,
                                        id: { $in: testIds } // Filter by IDs
                                    });

                                    // console.log(labResults);


                                    const labResultArray = orderedTestFields.map(test => {
                                        const groupTest = group.testFields.find(field => field.testId.equals(test._id));
                                    
                                        // Assuming that the testName is a property of the groupTest object
                                        const testName = groupTest ? groupTest.subCat : '';
                                    
                                        const resultsForTest = labResults.filter(result => result.id.equals(test._id));
                                    
                                        // Extracting both result and abnormalValue
                                        const testResults = resultsForTest.map(result => ({
                                            testName: testName,
                                            result: result.result,
                                            abnormalValue: result.abnormalValue, // Assuming there's an abnormalValue field in labResultDetail
                                        }));
                                    
                                        return testResults;
                                    }).flat(); // Use flat to flatten the nested arrays

                                    data.feesData.push({
                                        id: fee._id,
                                        type: fee.type,
                                        testid: fee.testId,
                                        feesType: feesTypeName,
                                        fees: fee.fees,
                                        category: group.groupCategory,
                                        discount: fee.discount,
                                        tests: orderedTestFields,
                                        labResults: labResultArray,
                                    });
                                }
                            }
                        }
                    } else {
                        feesTypeName = feesType.name;
                        reference_range = feesType.reference_range;
                        units = feesType.units;
                        category = feesType.category;
                        comments = feesType.comments;
                        method = feesType.method;

                        const labResults = await labResultDetail.find({ objbillId: id, fieldId: fee.fieldId });

                        const labResultArray = labResults.map(result => ({
                            result: result.result,
                            abnormalValue: result.abnormalValue, 
                        }));

                        data.feesData.push({
                            id: fee._id,
                            type: fee.type,
                            testid: fee.testId,
                            feesType: feesTypeName,
                            fees: fee.fees,
                            reference_range: reference_range,
                            units: units,
                            comments: comments,
                            category: category,
                            discount: fee.discount,
                            labResults: labResultArray,
                        });
                    }
                }
            }
        }

        const pdfBuffer = await WHgeneratePDF(data);

        // Define a file path to save the PDF
        const pdfFilePath = `./reports/lab-report-${id}.pdf`;

        // Write the PDF buffer to the file
        fs.writeFileSync(pdfFilePath, pdfBuffer);

        // Send the generated PDF as a response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=lab-report-${id}.pdf`);
        res.status(200).end(pdfBuffer);

        // Return the PDF file path
        return pdfFilePath;

    } catch (error) {
        console.error('Error fetching or generating data:', error);
        res.status(500).json({ error: 'An error occurred while processing the request' });
    }
};


export const cultureWHlabReport = async (req, res) => {
    try {
        const id = req.params.id;
        const { selectedTestsData } = req.body;

        const bill = await Bill.findById(id)
            .populate('refId', 'pName pNum pAge pGender pSalutation')
            .populate('doctorName', 'drName')
            .exec();

        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        function formatDate(dateString) {
            const date = new Date(dateString);
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        }

        const data = {
            data: {
                billId: bill.billId,
                pName: bill.refId.pName,
                pAge: bill.refId.pAge,
                pGender: bill.refId.pGender,
                pSal: bill.refId.pSalutation,
                drName: bill.doctorName.drName,
                billAmount: bill.billAmount,
                amountDue: bill.amountDue,
                amountPaid: bill.amountPaid,
                billDate: formatDate(bill.createdAt),
            },
            feesData: [],
        };

        const feesData = await labResultDetail.find({ objbillId: id });

        for (const fee of feesData) {
            if (selectedTestsData.includes(fee.resultId.toString())) {
                const feesType = await getFeesType(fee.fieldId, fee.type);
                if (feesType) {
                    let feesTypeName;
                    let reference_range = '';
                    let units = '';
                    let category = '';
                    let comments = '';
                    let labResultArray = [];

                    if (fee.type === 'Profile') {
                        // Your code for profile type tests
                    } else if (fee.type === 'Group') {
                        feesTypeName = feesType.groupName;
                        if (!data.feesData.some((details) => details.feesType === feesTypeName)) {
                            // const labResults = await labResultDetail.find({ objbillId: id, fieldId: fee.fieldId });
                            // labResultArray = labResults.map(result => ({
                            //     result: result.result,
                            // }));

                            const group = await GroupTest.findById(fee.fieldId, 'testFields groupCategory');
                            if (group) {
                                const testIds = group.testFields.map(field => field.testId);
                                const testDetails = await Test.find({ _id: { $in: testIds } }, 'reference_range units name category comments');
                                if (testDetails) {
                                    const orderedTestFields = group.testFields.map(field => {
                                        const testDetail = testDetails.find(detail => detail._id.equals(field.testId));
                                        return {
                                            _id: testDetail._id,
                                            name: testDetail.name,
                                            reference_range: testDetail.reference_range,
                                            units: testDetail.units,
                                            category: testDetail.category,
                                            comments: testDetail.comments,
                                            testid: fee.testId,
                                            type: fee.type,
                                        };
                                    });

                                    // Fetch lab results based on the test ID
                                    const labResults = await labResultDetail.find({
                                        objbillId: id,
                                        id: { $in: testIds } // Filter by IDs
                                    });

                                    // console.log(labResults);


                                    // Map lab results for each test
                                    // const labResultArray = orderedTestFields.map(test => {
                                    //     const resultsForTest = labResults.filter(result => result.id.equals(test._id));
                                    //     return {
                                    //         result: resultsForTest.map(result => result.result),
                                    //     };
                                    // });

                                    const labResultArray = orderedTestFields.map(test => {
                                        const groupTest = group.testFields.find(field => field.testId.equals(test._id));

                                        // Assuming that the testName is a property of the groupTest object
                                        const testName = groupTest ? groupTest.subCat : '';

                                        const resultsForTest = labResults.filter(result => result.id.equals(test._id));

                                        return {
                                            testName: testName,
                                            result: resultsForTest.map(result => result.result),
                                        };
                                    });


                                    data.feesData.push({
                                        id: fee._id,
                                        type: fee.type,
                                        testid: fee.testId,
                                        feesType: feesTypeName,
                                        fees: fee.fees,
                                        category: group.groupCategory,
                                        discount: fee.discount,
                                        tests: orderedTestFields,
                                        labResults: labResultArray,
                                    });
                                }
                            }
                        }
                    } else {
                        feesTypeName = feesType.name;
                        reference_range = feesType.reference_range;
                        units = feesType.units;
                        category = feesType.category;
                        comments = feesType.comments;

                        const labResults = await labResultDetail.find({ objbillId: id, fieldId: fee.fieldId });
                        labResultArray = labResults.map(result => ({
                            result: result.result,
                        }));

                        data.feesData.push({
                            id: fee._id,
                            type: fee.type,
                            testid: fee.testId,
                            feesType: feesTypeName,
                            fees: fee.fees,
                            reference_range: reference_range,
                            units: units,
                            comments: comments,
                            category: category,
                            discount: fee.discount,
                            labResults: labResultArray,
                        });
                    }
                }
            }
        }

        const pdfBuffer = await CulturegeneratePDF(data);

        // Define a file path to save the PDF
        const pdfFilePath = `./reports/lab-report-${id}.pdf`;

        // Write the PDF buffer to the file
        fs.writeFileSync(pdfFilePath, pdfBuffer);

        // Send the generated PDF as a response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=lab-report-${id}.pdf`);
        res.status(200).end(pdfBuffer);

        // Return the PDF file path
        return pdfFilePath;

    } catch (error) {
        console.error('Error fetching or generating data:', error);
        res.status(500).json({ error: 'An error occurred while processing the request' });
    }
};


export const cultureNHlabReport = async (req, res) => {
    try {
        const id = req.params.id;
        const { selectedTestsData } = req.body;

        const bill = await Bill.findById(id)
            .populate('refId', 'pName pNum pAge pGender pSalutation')
            .populate('doctorName', 'drName')
            .exec();

        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        function formatDate(dateString) {
            const date = new Date(dateString);
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        }

        const data = {
            data: {
                billId: bill.billId,
                pName: bill.refId.pName,
                pAge: bill.refId.pAge,
                pGender: bill.refId.pGender,
                pSal: bill.refId.pSalutation,
                drName: bill.doctorName.drName,
                billAmount: bill.billAmount,
                amountDue: bill.amountDue,
                amountPaid: bill.amountPaid,
                billDate: formatDate(bill.createdAt),
            },
            feesData: [],
        };

        const feesData = await labResultDetail.find({ objbillId: id });

        for (const fee of feesData) {
            if (selectedTestsData.includes(fee.resultId.toString())) {
                const feesType = await getFeesType(fee.fieldId, fee.type);
                if (feesType) {
                    let feesTypeName;
                    let reference_range = '';
                    let units = '';
                    let category = '';
                    let comments = '';
                    let labResultArray = [];

                    if (fee.type === 'Profile') {
                        // Your code for profile type tests
                    } else if (fee.type === 'Group') {
                        feesTypeName = feesType.groupName;
                        if (!data.feesData.some((details) => details.feesType === feesTypeName)) {
                            // const labResults = await labResultDetail.find({ objbillId: id, id: fee.id });
                            // labResultArray = labResults.map(result => ({
                            //     result: result.result,
                            // }));

                            const group = await GroupTest.findById(fee.fieldId, 'testFields groupCategory');
                            if (group) {
                                const testIds = group.testFields.map(field => field.testId);
                                const testDetails = await Test.find({ _id: { $in: testIds } }, 'reference_range units name category comments');
                                if (testDetails) {
                                    const orderedTestFields = group.testFields.map(field => {
                                        const testDetail = testDetails.find(detail => detail._id.equals(field.testId));
                                        return {
                                            _id: testDetail._id,
                                            name: testDetail.name,
                                            reference_range: testDetail.reference_range,
                                            units: testDetail.units,
                                            category: testDetail.category,
                                            comments: testDetail.comments,
                                            testid: fee.testId,
                                            type: fee.type,
                                        };
                                    });

                                    // Fetch lab results based on the test ID
                                    const labResults = await labResultDetail.find({
                                        objbillId: id,
                                        id: { $in: testIds } // Filter by IDs
                                    });

                                    // console.log(labResults);


                                    // Map lab results for each test
                                    // const labResultArray = orderedTestFields.map(test => {
                                    //     const resultsForTest = labResults.filter(result => result.id.equals(test._id));
                                    //     return {
                                    //         result: resultsForTest.map(result => result.result),
                                    //     };
                                    // });

                                    const labResultArray = orderedTestFields.map(test => {
                                        const groupTest = group.testFields.find(field => field.testId.equals(test._id));

                                        // Assuming that the testName is a property of the groupTest object
                                        const testName = groupTest ? groupTest.subCat : '';

                                        const resultsForTest = labResults.filter(result => result.id.equals(test._id));

                                        return {
                                            testName: testName,
                                            result: resultsForTest.map(result => result.result),
                                        };
                                    });



                                    data.feesData.push({
                                        id: fee._id,
                                        type: fee.type,
                                        testid: fee.testId,
                                        feesType: feesTypeName,
                                        fees: fee.fees,
                                        category: group.groupCategory,
                                        discount: fee.discount,
                                        tests: orderedTestFields,
                                        labResults: labResultArray,
                                    });
                                }
                            }
                        }
                    } else {
                        feesTypeName = feesType.name;
                        reference_range = feesType.reference_range;
                        units = feesType.units;
                        category = feesType.category;
                        comments = feesType.comments;

                        const labResults = await labResultDetail.find({ objbillId: id, fieldId: fee.fieldId });
                        labResultArray = labResults.map(result => ({
                            result: result.result,
                        }));

                        data.feesData.push({
                            id: fee._id,
                            type: fee.type,
                            testid: fee.testId,
                            feesType: feesTypeName,
                            fees: fee.fees,
                            reference_range: reference_range,
                            units: units,
                            comments: comments,
                            category: category,
                            discount: fee.discount,
                            labResults: labResultArray,
                        });
                    }
                }
            }
        }

        const pdfBuffer = await NHculturegeneratePDF(data);

        // Define a file path to save the PDF
        const pdfFilePath = `./reports/lab-report-${id}.pdf`;

        // Write the PDF buffer to the file
        fs.writeFileSync(pdfFilePath, pdfBuffer);

        // Send the generated PDF as a response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=lab-report-${id}.pdf`);
        res.status(200).end(pdfBuffer);

        // Return the PDF file path
        return pdfFilePath;

    } catch (error) {
        console.error('Error fetching or generating data:', error);
        res.status(500).json({ error: 'An error occurred while processing the request' });
    }
};

async function getFeesType(id, type) {
    try {
        switch (type) {
            case 'Test':
                return await Test.findById(id, 'name category units refrence_range comments');
            case 'Group':
                return await GroupTest.findById(id, 'groupName groupCategory');
            case 'Profile':
                return await CreateProfile.findById(id, 'profileName');
            default:
                return null;
        }
    } catch (error) {
        console.error('Error fetching fees type:', error);
        return null;
    }
}

// const generatePDF = async (data) => {
//     const browser = await puppeteer.launch({
//         executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/Chrome.exe',
//     });

//     const page = await browser.newPage();

//     // Set the page size to A4 (210mm x 297mm)
//     await page.pdf({
//         format: 'A4',
//     });

//     // Read the header image file
//     const headerImagePath = './images/hm_header.PNG'; // Replace with the actual header image path
//     const headerImageBase64 = fs.readFileSync(headerImagePath, 'base64');

//     // Read the images for doctor and lab technician
//     const doctorImagePath = './images/doctorSign.png'; // Replace with the actual doctor image path
//     const doctorImageBase64 = fs.readFileSync(doctorImagePath, 'base64');

//     const labImagePath = './images/labSign.png'; // Replace with the actual lab technician image path
//     const labImageBase64 = fs.readFileSync(labImagePath, 'base64');

//     // ...

//     // Create an HTML template with the lab report data
//     const htmlContent = `
//         <html>
//         <head>
//             <!-- Include Bootstrap CSS via CDN or provide the URL to your own Bootstrap CSS file -->
//             <link
//                 rel="stylesheet"
//                 href="https://cdn.jsdelivr.net/npm/bootstrap@5.5.0/dist/css/bootstrap.min.css"
//                 integrity="..."
//                 crossorigin="anonymous"
//             >
//             <style>
//                 /* Add CSS styles for page breaks */
//                 .group-header {
//                     page-break-before: always;
//                 }
//                 .no-page-break {
//                     page-break-inside: avoid;
//                 }
//             </style>
//         </head>
//         <body>
//             <table >
//                 <thead>
//                     <tr>
//                         <th style="width: 45%; text-align: left; font-size: 15px">Test Name</th>
//                         <th style="width: 25%; text-align: center; font-size: 15px">Result</th>
//                         <th style="width: 30%; text-align: left; font-size: 15px">Reference Range</th>
//                         <th style="width: 10%; text-align: left; font-size: 15px">Unit</th>
//                     </tr>
//                     <tr>
//                         <td colspan="4">
//                             <hr style="border: 1px solid #000;">
//                         </td>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     ${data.feesData.map((details, index, array) => {
//                         if (details.type === 'Group') {
//                             return `<tr class="group-header">
//                                 <td style="text-align:left" colspan="1"><strong>${details.feesType}</strong></td>
//                                 <td style="text-align:center" colspan="1"><strong>${details.category}</strong></td>
//                             </tr>
//                             ${details.tests.map((test, testIndex) => {
//                                 const labResult = details.labResults[testIndex];
//                                 const testName = details.labResults[testIndex]?.testName || '';
//                                 return `<tr class="no-page-break"> <td style="text-align:left"><strong>${testName}</strong></td> </tr>
//                                     <tr class="no-page-break">
//                                         <td style="text-align:left">${test.name} ${test.method ? `<br>(${test.method})` : ''}</td>
//                                         <td style="text-align:center">${labResult ? labResult.result : ''}</td>
//                                         <td style="text-align:left">${test.reference_range !== undefined ? test.reference_range : ''}</td>
//                                         <td style="text-align:left">${test.units !== undefined ? test.units : ''}</td>
//                                     </tr>
//                                     <tr style="height: 10px;"></tr> <!-- Add space between rows -->
//                                 `;
//                             }).join('')}`;
//                         } else if ((index === 0 || details.category !== array[index - 1].category) || array[index - 1].type === 'Group') {
//                             // Display the category for the first single test in a new category or if the previous detail was of type 'Group'
//                             return `<tr class="group-header">
//                                 <td style="text-align:left"></td>
//                                 <td style="text-align:center"><strong>${details.category}</strong></td>
//                             </tr>
//                             <tr class="no-page-break">
//                                 <td style="text-align:left">${details.feesType} ${details.method ? `<br>(${details.method})` : ''}</td>
//                                 <td style="text-align:center">${details.labResults[0] ? details.labResults[0].result : ''}</td>
//                                 <td style="text-align:left">${details.reference_range !== undefined ? details.reference_range : ''}</td>
//                                 <td style="text-align:left">${details.units !== undefined ? details.units : ''}</td>
//                             </tr>
//                             <tr style="height: 10px;"></tr> <!-- Add space between rows -->
//                             ${details.comments ? `
//                                 <tr class="no-page-break">
//                                     <td colspan="4" style="text-align: left; padding-left: 15px; word-wrap: break-word;">
//                                         ${details.comments}
//                                     </td>
//                                 </tr>` : ''
//                             }`;
//                         } else {
//                             // Skip category for subsequent single tests with the same category
//                             return `
//                                 <tr class="no-page-break">
//                                     <td style="text-align:left"></td>
//                                     <td style="text-align:center"></td>
//                                 </tr>
//                                 <tr class="no-page-break">
//                                     <td style="text-align:left">${details.feesType} ${details.method ? `<br>(${details.method})` : ''}</td>
//                                     <td style="text-align:center">${details.labResults[0] ? details.labResults[0].result : ''}</td>
//                                     <td style="text-align:left">${details.reference_range !== undefined ? details.reference_range : ''}</td>
//                                     <td style="text-align:left">${details.units !== undefined ? details.units : ''}</td>
//                                 </tr>
//                                 <tr style="height: 10px;"></tr> <!-- Add space between rows -->
//                                 ${details.comments ? `
//                                     <tr class="no-page-break">
//                                         <td colspan="4" style="text-align: left; padding-left: 15px; word-wrap: break-word;">
//                                             ${details.comments}
//                                         </td>
//                                     </tr>` : ''
//                             }`;
//                         }
//                     }).join('')}
//                 </tbody>
//             </table>

//             <!-- Add content to display at the end of the report -->
//             <div style="margin-top: 20px;">
//                 <p style="text-align: center; font-size: 16px;">End of the Report</p>
//                 <div style="text-align: left; float: left;">
//                     <img src="data:image/jpeg;base64,${doctorImageBase64}" alt="Doctor Image" style="width: 55%; height: 15%; margin-bottom: -25px;" />
//                     <p><strong>Doctor</strong></p>
//                 </div>
//                 <div style="text-align: right; float: right;">
//                     <img src="data:image/jpeg;base64,${labImageBase64}" alt="Lab Technician Image" style="width: 55%; height: 15%; margin-bottom: -25px;" />
//                     <p><strong>Lab Technician</strong></p>
//                 </div>
//             </div>
//         </body>
//         </html>
//     `;

//     await page.setContent(htmlContent);

//     // Generate a PDF with the specified page size (A4) and headers/footers
//     const pdfBuffer = await page.pdf({
//         format: 'A4',
//         displayHeaderFooter: true,
//          headerTemplate: `
//       <table style="width: 100%; border-collapse: collapse; font-size: 12px;margin-top:90px">
//              <tr>
//                  <td style="width: 55%; text-align: left;padding-left: 10mm">
//                     Patient Name: <strong> ${data.data.pSal}. ${data.data.pName}</strong><br>
//                      <div style="margin-bottom: 5px;"></div> 
//                      Sex / Age: <strong> ${data.data.pGender} / ${data.data.pAge} </strong>
//                      <div style="margin-bottom: 5px;"></div> 
//                      Referred By: <strong> ${data.data.drName} </strong>
//                 </td>
//                  <td style="width: 35%; text-align: left;">
//                      Report ID: <strong> ${data.data.billId} </strong>
//                      <div style="margin-bottom: 5px;"></div> 
//                      Sampling Date: <strong> ${data.data.billDate}</strong>
//                      <div style="margin-bottom: 5px;"></div> 
//                      Report Date: <strong> ${data.data.billDate}</strong>
//                  </td>
//             </tr>
//          </table>`,
//         footerTemplate: `
//             <div style="height: 100px;"></div>
//         `,
//         margin: {
//             top: '60mm',    // Adjust top margin as needed
//             bottom: '30mm', // Adjust bottom margin as needed
//             left: '10mm',   // Adjust left margin as needed
//             right: '10mm',  // Adjust right margin as needed
//         },
//     });

//     // Close the browser
//     await browser.close();

//     return pdfBuffer;
// };



const generatePDF = async (data) => {
    const browser = await puppeteer.launch({
        executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/Chrome.exe',
    });

    const page = await browser.newPage();

    // Set the page size to A4 (210mm x 297mm)
    await page.pdf({
        format: 'A4',
    });

    // Read the header image file
    const headerImagePath = './images/hm_header.PNG'; // Replace with the actual header image path
    const headerImageBase64 = fs.readFileSync(headerImagePath, 'base64');

    // Read the images for doctor and lab technician
    const doctorImagePath = './images/doctorSign.png'; // Replace with the actual doctor image path
    const doctorImageBase64 = fs.readFileSync(doctorImagePath, 'base64');

    const labImagePath = './images/labSign.png'; // Replace with the actual lab technician image path
    const labImageBase64 = fs.readFileSync(labImagePath, 'base64');

    // ...

    // Create an HTML template with the lab report data
    const htmlContent = `
        <html>
        <head>
            <!-- Include Bootstrap CSS via CDN or provide the URL to your own Bootstrap CSS file -->
            <link
                rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/bootstrap@5.5.0/dist/css/bootstrap.min.css"
                integrity="..."
                crossorigin="anonymous"
            >
            <style>
                /* Add CSS styles for page breaks */
                .group-header {
                    page-break-before: always;
                }
                .no-page-break {
                    page-break-inside: avoid;
                }
            </style>
        </head>
        <body>
            <table >
                <thead>
                    <tr>
                        <th style="width: 45%; text-align: left; font-size: 15px">Test Name</th>
                        <th style="width: 25%; text-align: center; font-size: 15px">Result</th>
                        <th style="width: 30%; text-align: left; font-size: 15px">Reference Range</th>
                        <th style="width: 10%; text-align: left; font-size: 15px">Unit</th>
                    </tr>
                    <tr>
                        <td colspan="4">
                            <hr style="border: 1px solid #000;">
                        </td>
                    </tr>
                </thead>
                <tbody>
                    ${data.feesData.map((details, index, array) => {
                        if (details.type === 'Group') {
                            return `<tr class="group-header">
                                <td style="text-align:left" colspan="1"><strong>${details.feesType}</strong></td>
                                <td style="text-align:center" colspan="1"><strong>${details.category}</strong></td>
                            </tr>
                            ${details.tests.map((test, testIndex) => {
                                const labResult = details.labResults[testIndex];
                                const testName = details.labResults[testIndex]?.testName || '';
                                const abnormalValue = labResult ? labResult.abnormalValue : '';
                                const formattedResult = abnormalValue === 'L' || abnormalValue === 'H' ?
                                `<strong style="color: red;">${labResult.result}</strong>` : labResult.result;

                                return `<tr class="no-page-break"> <td style="text-align:left"><strong>${testName}</strong></td> </tr>
                                    <tr class="no-page-break">
                                        <td style="text-align:left">${test.name} ${test.method ? `<br>(${test.method})` : ''}</td>
                                        <td style="text-align:center">${formattedResult}</td>
                                        <td style="text-align:left">${test.reference_range !== undefined ? test.reference_range : ''}</td>
                                        <td style="text-align:left">${test.units !== undefined ? test.units : ''}</td>
                                    </tr>
                                    <tr style="height: 10px;"></tr> <!-- Add space between rows -->
                                `;
                            }).join('')}`;
                        } else if ((index === 0 || details.category !== array[index - 1].category) || array[index - 1].type === 'Group') {
                            // Display the category for the first single test in a new category or if the previous detail was of type 'Group'
                            return `<tr class="group-header">
                                <td style="text-align:left"></td>
                                <td style="text-align:center"><strong>${details.category}</strong></td>
                            </tr>
                            <tr class="no-page-break">
                                <td style="text-align:left">${details.feesType} ${details.method ? `<br>(${details.method})` : ''}</td>
                                <td style="text-align:center">${details.labResults[0] ? 
                                    (details.labResults[0].abnormalValue === 'L' || details.labResults[0].abnormalValue === 'H' ?
                                        `<strong style="color: red;">${details.labResults[0].result}</strong>` :
                                        details.labResults[0].result) : ''}</td>                                
                                <td style="text-align:left">${details.reference_range !== undefined ? details.reference_range : ''}</td>
                                <td style="text-align:left">${details.units !== undefined ? details.units : ''}</td>
                            </tr>
                            <tr style="height: 10px;"></tr> <!-- Add space between rows -->
                            ${details.comments ? `
                                <tr class="no-page-break">
                                    <td colspan="4" style="text-align: left; padding-left: 15px; word-wrap: break-word;">
                                        ${details.comments}
                                    </td>
                                </tr>` : ''
                            }`;
                        } else {
                            // Skip category for subsequent single tests with the same category
                            return `
                                <tr class="no-page-break">
                                    <td style="text-align:left"></td>
                                    <td style="text-align:center"></td>
                                </tr>
                                <tr class="no-page-break">
                                    <td style="text-align:left">${details.feesType} ${details.method ? `<br>(${details.method})` : ''}</td>
                                    <td style="text-align:center">${details.labResults[0] ? 
                                        (details.labResults[0].abnormalValue === 'L' || details.labResults[0].abnormalValue === 'H' ?
                                            `<strong style="color: red;">${details.labResults[0].result}</strong>` :
                                            details.labResults[0].result) : ''}</td>
                                    <td style="text-align:left">${details.reference_range !== undefined ? details.reference_range : ''}</td>
                                    <td style="text-align:left">${details.units !== undefined ? details.units : ''}</td>
                                </tr>
                                <tr style="height: 10px;"></tr> <!-- Add space between rows -->
                                ${details.comments ? `
                                    <tr class="no-page-break">
                                        <td colspan="4" style="text-align: left; padding-left: 15px; word-wrap: break-word;">
                                            ${details.comments}
                                        </td>
                                    </tr>` : ''
                            }`;
                        }
                    }).join('')}
                </tbody>
            </table>

            <!-- Add content to display at the end of the report -->
            <div style="margin-top: 20px;">
                <p style="text-align: center; font-size: 16px;">End of the Report</p>
                <div style="text-align: left; float: left;">
                    <img src="data:image/jpeg;base64,${doctorImageBase64}" alt="Doctor Image" style="width: 55%; height: 15%; margin-bottom: -25px;" />
                    <p><strong>Doctor</strong></p>
                </div>
                <div style="text-align: right; float: right;">
                    <img src="data:image/jpeg;base64,${labImageBase64}" alt="Lab Technician Image" style="width: 55%; height: 15%; margin-bottom: -25px;" />
                    <p><strong>Lab Technician</strong></p>
                </div>
            </div>
        </body>
        </html>
    `;

    await page.setContent(htmlContent);

    // Generate a PDF with the specified page size (A4) and headers/footers
    const pdfBuffer = await page.pdf({
        format: 'A4',
        displayHeaderFooter: true,
         headerTemplate: `
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;margin-top:90px">
             <tr>
                 <td style="width: 55%; text-align: left;padding-left: 10mm">
                    Patient Name: <strong> ${data.data.pSal}. ${data.data.pName}</strong><br>
                     <div style="margin-bottom: 5px;"></div> 
                     Sex / Age: <strong> ${data.data.pGender} / ${data.data.pAge} </strong>
                     <div style="margin-bottom: 5px;"></div> 
                     Referred By: <strong> ${data.data.drName} </strong>
                </td>
                 <td style="width: 35%; text-align: left;">
                     Report ID: <strong> ${data.data.billId} </strong>
                     <div style="margin-bottom: 5px;"></div> 
                     Sampling Date: <strong> ${data.data.billDate}</strong>
                     <div style="margin-bottom: 5px;"></div> 
                     Report Date: <strong> ${data.data.billDate}</strong>
                 </td>
            </tr>
         </table>`,
        footerTemplate: `
            <div style="height: 100px;"></div>
        `,
        margin: {
            top: '60mm',    // Adjust top margin as needed
            bottom: '30mm', // Adjust bottom margin as needed
            left: '10mm',   // Adjust left margin as needed
            right: '10mm',  // Adjust right margin as needed
        },
    });

    // Close the browser
    await browser.close();

    return pdfBuffer;
};



export const sendWhatsapp = async (req, res) => {
    const billId = req.params.id;

    try {
        const bill = await Bill.findById(billId);

        if (!bill) {
            return res.status(404).json({ error: 'Bill not found' });
        }

        // Find the associated PatientReg document by _id from the refId field in Bill
        const patientRegId = bill.refId;

        if (!patientRegId) {
            return res.status(404).json({ error: 'PatientReg ID not found in the Bill document' });
        }

        // Fetch the PatientReg document by _id
        const patientReg = await PatientReg.findById(patientRegId);

        if (!patientReg) {
            return res.status(404).json({ error: 'PatientReg not found' });
        }

        // Get the phone number from the patientReg document
        const phoneNumber = patientReg.pNum;

        // Generate and save the PDF report
        // const pdfFilePath = await WHgeneratePDF(data); // Make sure 'data' contains the report data
        const pdfFilePath = await WHlabReport(req, res);

        const apiUrl = 'https://api.whatsdesk.in/v4/filefromdisk.php';
        const apiKey = 'cbEMMQdLJqBjBAikPT';

        // Create a FormData object
        const formData = new FormData();
        formData.append('data', fs.createReadStream(pdfFilePath)); // Attach the file
        formData.append('key', apiKey);
        formData.append('number', '91' + phoneNumber); // Assuming you need to prepend '91' to the contact number
        formData.append('caption', 'This is a test caption');

        // Make a POST request using axios with the FormData
        const response = await axios.post(apiUrl, formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        // Handle the response here
        console.log('WhatsApp report sent successfully');
        return {
            status: true,
            message: 'success',
        };

    } catch (error) {
        console.error('Error sending WhatsApp report:', error);
        // Handle the error here
        return {
            status: false,
            message: 'error',
        };
    }
};

export const sendCultureWhatsapp = async (req, res) => {
    const billId = req.params.id;

    try {
        const bill = await Bill.findById(billId);

        if (!bill) {
            return res.status(404).json({ error: 'Bill not found' });
        }

        // Find the associated PatientReg document by _id from the refId field in Bill
        const patientRegId = bill.refId;

        if (!patientRegId) {
            return res.status(404).json({ error: 'PatientReg ID not found in the Bill document' });
        }

        // Fetch the PatientReg document by _id
        const patientReg = await PatientReg.findById(patientRegId);

        if (!patientReg) {
            return res.status(404).json({ error: 'PatientReg not found' });
        }

        // Get the phone number from the patientReg document
        const phoneNumber = patientReg.pNum;

        // Generate and save the PDF report
        // const pdfFilePath = await WHgeneratePDF(data); // Make sure 'data' contains the report data
        const pdfFilePath = await cultureWHlabReport(req, res);

        const apiUrl = 'https://api.whatsdesk.in/v4/filefromdisk.php';
        const apiKey = 'cbEMMQdLJqBjBAikPT';

        // Create a FormData object
        const formData = new FormData();
        formData.append('data', fs.createReadStream(pdfFilePath)); // Attach the file
        formData.append('key', apiKey);
        formData.append('number', '91' + phoneNumber); // Assuming you need to prepend '91' to the contact number
        formData.append('caption', 'This is a test caption');

        // Make a POST request using axios with the FormData
        const response = await axios.post(apiUrl, formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        // Handle the response here
        console.log('WhatsApp report sent successfully');
        return {
            status: true,
            message: 'success',
        };

    } catch (error) {
        console.error('Error sending WhatsApp report:', error);
        // Handle the error here
        return {
            status: false,
            message: 'error',
        };
    }
};


export const sendEmail = async (req, res) => {

    const billId = req.params.id;

    try {

        const bill = await Bill.findById(billId);

        if (!bill) {
            return res.status(404).json({ error: 'Bill not found' });
        }

        // Find the associated PatientReg document by _id from the refId field in Bill
        const patientRegId = bill.refId;

        if (!patientRegId) {
            return res.status(404).json({ error: 'PatientReg ID not found in the Bill document' });
        }

        // Fetch the PatientReg document by _id
        const patientReg = await PatientReg.findById(patientRegId);

        if (!patientReg) {
            return res.status(404).json({ error: 'PatientReg not found' });
        }

        // Get the phone number from the patientReg document
        const toEmail = patientReg.pEmail;

        const pdfFilePath = await WHlabReport(req, res);

        // Create a transporter using your email service or SMTP server details
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // Change this to your email service (e.g., 'Gmail', 'Outlook', 'Yahoo', etc.)
            auth: {
                user: 'aqibmulla456@gmail.com', // Your email address
                pass: 'tlgyurwmmrcgjanq', // Your email password or an app-specific password
            },
        });

        // Verify the transporter configuration
        await transporter.verify();

        // Define email data
        const mailOptions = {
            from: 'aqibmulla456@gmail.com', // Sender email address
            to: toEmail, // Recipient email address
            subject: 'Hi', // Email subject
            text: 'Hello', // Plain text message
            attachments: pdfFilePath
                ? [{ path: pdfFilePath }] // Attachments, if any
                : [],
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export const sendCultureEmail = async (req, res) => {

    const billId = req.params.id;

    try {

        const bill = await Bill.findById(billId);

        if (!bill) {
            return res.status(404).json({ error: 'Bill not found' });
        }

        // Find the associated PatientReg document by _id from the refId field in Bill
        const patientRegId = bill.refId;

        if (!patientRegId) {
            return res.status(404).json({ error: 'PatientReg ID not found in the Bill document' });
        }

        // Fetch the PatientReg document by _id
        const patientReg = await PatientReg.findById(patientRegId);

        if (!patientReg) {
            return res.status(404).json({ error: 'PatientReg not found' });
        }

        // Get the phone number from the patientReg document
        const toEmail = patientReg.pEmail;

        const pdfFilePath = await cultureWHlabReport(req, res);

        // Create a transporter using your email service or SMTP server details
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // Change this to your email service (e.g., 'Gmail', 'Outlook', 'Yahoo', etc.)
            auth: {
                user: 'aqibmulla456@gmail.com', // Your email address
                pass: 'tlgyurwmmrcgjanq', // Your email password or an app-specific password
            },
        });

        // Verify the transporter configuration
        await transporter.verify();

        // Define email data
        const mailOptions = {
            from: 'aqibmulla456@gmail.com', // Sender email address
            to: toEmail, // Recipient email address
            subject: 'Hi', // Email subject
            text: 'Hello', // Plain text message
            attachments: pdfFilePath
                ? [{ path: pdfFilePath }] // Attachments, if any
                : [],
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};




const WHgeneratePDF = async (data) => {
    const browser = await puppeteer.launch({
        executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/Chrome.exe',
    });

    const page = await browser.newPage();

    // Set the page size to A4 (210mm x 297mm)
    await page.pdf({
        format: 'A4',
    });

    // Read the header and footer image files
    const headerImagePath = './images/hm_header.PNG'; // Replace with the actual header image path
    const headerImageBase64 = fs.readFileSync(headerImagePath, 'base64');

    const footerImagePath = './images/hm_header.PNG'; // Replace with the actual footer image path
    const footerImageBase64 = fs.readFileSync(footerImagePath, 'base64');

    const doctorImagePath = './images/doctorSign.png'; // Replace with the actual footer image path
    const doctorImageBase64 = fs.readFileSync(doctorImagePath, 'base64');

    const labImagePath = './images/labSign.png'; // Replace with the actual footer image path
    const labImageBase64 = fs.readFileSync(labImagePath, 'base64');

   // ...

// Create an HTML template with the lab report data
const htmlContent = `
<html>
  <head>
  <!-- Include Bootstrap CSS via CDN or provide the URL to your own Bootstrap CSS file -->
  <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.5.0/dist/css/bootstrap.min.css"
      integrity="..."
      crossorigin="anonymous"
  >
  <style>
     /* Add CSS styles for page breaks */
     .group-header {
         page-break-before: always;
     }
     .no-page-break {
         page-break-inside: avoid;
     }
  </style>
  </head>
  <body>

    <table>
     <thead>
     <tr>
     <th style="width: 45%; text-align: left; font-size: 15px">Test Name</th>
     <th style="width: 25%; text-align: center;  font-size: 15px">Result</th>
     <th style="width: 30%; text-align: left;  font-size: 15px">Reference Range</th>
     <th style="width: 10%; text-align: left; font-size: 15px">Unit</th>
     </tr>        
     <tr>
     <td colspan="4">
         <hr style="border: 1px solid #000;">
     </td>
 </tr>
     </thead>
     <tbody>
     ${data.feesData.map((details, index, array) => {
 if (details.type === 'Group') {
     return `<tr class="group-header">
     <td style="text-align:left" colspan="1"><strong>${details.feesType}</strong></td>
     <td style="text-align:center" colspan="1"><strong>${details.category}</strong></td>            
             </tr>
             ${details.tests.map((test, testIndex) => {
             const labResult = details.labResults[testIndex];
             const testName = details.labResults[testIndex]?.testName || '';
             const abnormalValue = labResult ? labResult.abnormalValue : '';
             const formattedResult = abnormalValue === 'L' || abnormalValue === 'H' ?
             `<strong style="color: red;">${labResult.result}</strong>` : labResult.result;
         return `<tr class="no-page-break"> <td style="text-align:left"><strong>${testName}</strong></td> </tr>
                     <tr class="no-page-break">
                         <td style="text-align:left">${test.name} ${test.method ? `<br>(${test.method})` : ''}</td>
                         <td style="text-align:center">${formattedResult}</td>
                         <td style="text-align:left">${test.reference_range !== undefined ? test.reference_range : ''}</td>
                         <td style="text-align:left">${test.units !== undefined ? test.units : ''}</td>
                     </tr>
                     <tr style="height: 10px;"></tr> <!-- Add space between rows -->
                 `;
     }).join('')}`;
 } else if ((index === 0 || details.category !== array[index - 1].category) || array[index - 1].type === 'Group') {
     // Display the category for the first single test in a new category or if the previous detail was of type 'Group'
     return `<tr class="group-header">
                 <td style="text-align:left"></td>
                 <td style="text-align:center"><strong>${details.category}</strong></td>            
                 </tr>
             <tr class="no-page-break">
                 <td style="text-align:left">${details.feesType} ${details.method ? `<br>(${details.method})` : ''}</td>
                 <td style="text-align:center">${details.labResults[0] ? 
                    (details.labResults[0].abnormalValue === 'L' || details.labResults[0].abnormalValue === 'H' ?
                        `<strong style="color: red;">${details.labResults[0].result}</strong>` :
                        details.labResults[0].result) : ''}</td>
                 <td style="text-align:left">${details.reference_range !== undefined ? details.reference_range : ''}</td>
                 <td style="text-align:left">${details.units !== undefined ? details.units : ''}</td>
             </tr>
             <tr style="height: 10px;"></tr> <!-- Add space between rows -->
             ${details.comments ? `
                 <tr class="no-page-break">
                     <td colspan="4" style="text-align: left; padding-left: 15px; word-wrap: break-word;">
                         ${details.comments}
                     </td>
                 </tr>` : ''
         }`;
 } else {
     // Skip category for subsequent single tests with the same category
     return `
             <tr class="no-page-break">
                 <td style="text-align:left"></td>
                 <td style="text-align:center"></td>
                 </tr>
             <tr class="no-page-break">
                 <td style="text-align:left">${details.feesType} ${details.method ? `<br>(${details.method})` : ''}</td>
                 <td style="text-align:center">${details.labResults[0] ? 
                    (details.labResults[0].abnormalValue === 'L' || details.labResults[0].abnormalValue === 'H' ?
                        `<strong style="color: red;">${details.labResults[0].result}</strong>` :
                        details.labResults[0].result) : ''}</td>
                 <td style="text-align:left">${details.reference_range !== undefined ? details.reference_range : ''}</td>
                 <td style="text-align:left">${details.units !== undefined ? details.units : ''}</td>
             </tr>
             <tr style="height: 10px;"></tr> <!-- Add space between rows -->
             ${details.comments ? `
                 <tr class="no-page-break">
                     <td colspan="4" style="text-align: left; padding-left: 15px; word-wrap: break-word;">
                         ${details.comments}
                     </td>
                 </tr>` : ''
         }`;
 }
}).join('')}

   </tbody>
   </table>

   <!-- Add content to display at the end of the report -->
   <div style="margin-top: 20px;">
     <p style="text-align: center; font-size: 16px;">End of the Report</p>
     <div style="text-align: left; float: left;">
     <img src="data:image/jpeg;base64,${doctorImageBase64}" alt="Header Image" style="width: 55%; height: 15%;  margin-bottom: -25px;" />
         <p><strong>Doctor</strong></p>
     </div>
     <div style="text-align: right; float: right;">
     <img src="data:image/jpeg;base64,${labImageBase64}" alt="Header Image" style="width: 55%; height: 15%; margin-bottom: -25px;"" />
         <p><strong>Lab Technician</strong></p>
     </div>
   </div>
  </body>
</html>
`;

// ...


    await page.setContent(htmlContent);

    // Generate a PDF with the specified page size (A4) and headers/footers
    const pdfBuffer = await page.pdf({
        format: 'A4',
        displayHeaderFooter: true,
        headerTemplate: `
        <div style="position: relative; top: -20px; text-align: center;">
        <div style="width: 100%; ">
        <img src="data:image/jpeg;base64,${headerImageBase64}" alt="Header Image" style="width: 100%; height: 100%;" />
        </div>
            <div style="font-size: 12px;max-width: 100%;">
                <table style="width: 100%;">
                    <tr>
                        <td style="width: 64%;text-align: left;padding-left: 10mm;">
                            Patient Name:<strong> ${data.data.pSal}. ${data.data.pName}</strong>
                            <div style="margin-bottom: 5px;"></div> 
                            Sex / Age: <strong>${data.data.pGender} / ${data.data.pAge}</strong>
                            <div style="margin-bottom: 5px;"></div> 
                            Referred By:<strong> ${data.data.drName} </strong><br />
                        </td>
                        <td style="width: 30%;text-align: left;">
                            Report ID: <strong>${data.data.billId}</strong>
                            <div style="margin-bottom: 5px;"></div> 
                            Sampling Date: <strong> ${data.data.billDate}</strong>
                            <div style="margin-bottom: 5px;"></div> 
                            Report Date: <strong> ${data.data.billDate} </strong><br />
                        </td>
                        <td style="text-align: left;">
                            <!-- Add your QR code here -->
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    `,
        footerTemplate: `<img src="data:image/jpeg;base64,${footerImageBase64}" alt="Footer Image" style="width: 100%;height:100%" />`,

        margin: {
            top: '60mm',    // Adjust top margin as needed
            bottom: '33mm', // Adjust bottom margin as needed
            left: '10mm',   // Adjust left margin as needed
            right: '10mm',  // Adjust right margin as needed
        },
    });

    // Close the browser
    await browser.close();

    return pdfBuffer;
}



const CulturegeneratePDF = async (data) => {
    const browser = await puppeteer.launch({
        executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/Chrome.exe',
    });

    const page = await browser.newPage();

    // Set the page size to A4 (210mm x 297mm)
    await page.pdf({
        format: 'A4',
    });

    // Read the header and footer image files
    const headerImagePath = './images/hm_header.PNG'; // Replace with the actual header image path
    const headerImageBase64 = fs.readFileSync(headerImagePath, 'base64');

    const footerImagePath = './images/hm_header.PNG'; // Replace with the actual footer image path
    const footerImageBase64 = fs.readFileSync(footerImagePath, 'base64');

    const doctorImagePath = './images/doctorSign.png'; // Replace with the actual footer image path
    const doctorImageBase64 = fs.readFileSync(doctorImagePath, 'base64');

    const labImagePath = './images/labSign.png'; // Replace with the actual footer image path
    const labImageBase64 = fs.readFileSync(labImagePath, 'base64');

    // Create a simplified HTML template with the lab report data
    const htmlContent = `
       <html>
         <head>
         <!-- Include Bootstrap CSS via CDN or provide the URL to your own Bootstrap CSS file -->
         <link
             rel="stylesheet"
             href="https://cdn.jsdelivr.net/npm/bootstrap@5.5.0/dist/css/bootstrap.min.css"
             integrity="..."
             crossorigin="anonymous"
         >
        
         </head>
         <body>
         
            ${data.feesData.map((details, index, array) => {
        if (details.type === 'Group') {
            return `
                    ${details.tests.map((test, testIndex) => {
                const labResult = details.labResults[testIndex];
                return `
                        ${labResult ? `<div>${labResult.result}</div>` : ''}
                        

                        `;
            }).join('')}`;
        } else if ((index === 0 || details.category !== array[index - 1].category) || array[index - 1].type === 'Group') {
            return ` ${details.labResults[0] ? `<div>${details.labResults[0].result}</div>` : ''}

                `;
        } else {
            return `
                    ${details.labResults[0] ? `<div>${details.labResults[0].result}</div>` : ''}

                `;
        }
    }).join('')}
          
          <!-- Add content to display at the end of the report -->
          <div style="margin-top: 20px;">
            <p style="text-align: center; font-size: 16px;">End of the Report</p>
            <div style="text-align: left; float: left;">
            <img src="data:image/jpeg;base64,${doctorImageBase64}" alt="Header Image" style="width: 55%; height: 15%;  margin-bottom: -25px;" />
                <p><strong>Doctor</strong></p>
            </div>
            <div style="text-align: right; float: right;">
            <img src="data:image/jpeg;base64,${labImageBase64}" alt="Header Image" style="width: 55%; height: 15%; margin-bottom: -25px;"" />
                <p><strong>Lab Technician</strong></p>
            </div>
          </div>
         </body>
       </html>
     `;

    await page.setContent(htmlContent);

    // Generate a PDF with the specified page size (A4) and headers/footers
    const pdfBuffer = await page.pdf({
        format: 'A4',
        displayHeaderFooter: true,
        headerTemplate: `
        <div style="position: relative; top: -20px; text-align: center;">
        <div style="width: 100%; ">
        <img src="data:image/jpeg;base64,${headerImageBase64}" alt="Header Image" style="width: 100%; height: 100%;" />
        </div>
            <div style="margin-top: 5px; font-size: 12px;max-width: 100%;">
                <table style="width: 100%;">
                    <tr>
                        <td style="text-align: left;padding-left: 10mm;">
                            Patient Name: <strong> ${data.data.pSal}. ${data.data.pName} </strong>
                            <div style="margin-bottom: 5px;"></div> 
                            Sex / Age: <strong> ${data.data.pGender} / ${data.data.pAge}</strong>
                            <div style="margin-bottom: 5px;"></div> 
                            Referred By: <strong> ${data.data.drName}</strong><br />
                        </td>
                        <td style="text-align: left;">
                            Report ID: <strong> ${data.data.billId}</strong>
                            <div style="margin-bottom: 5px;"></div> 
                            Sampling Date: <strong> ${data.data.billDate}</strong>
                            <div style="margin-bottom: 5px;"></div> 
                            Report Date: <strong> ${data.data.billDate}</strong><br />
                        </td>
                        <td style="text-align: left;">
                            <!-- Add your QR code here -->
                        </td>
                    </tr>
                    <tr>
                     <td colspan="4">
                     <hr style="border: 1px solid #000;">
                     </td>
                    </tr>
                </table>
            </div>
        </div>
    `,
        footerTemplate: `<img src="data:image/jpeg;base64,${footerImageBase64}" alt="Footer Image" style="width: 100%;height:100%" />`,

        margin: {
            top: '65mm',    // Adjust top margin as needed
            bottom: '33mm', // Adjust bottom margin as needed
            left: '10mm',   // Adjust left margin as needed
            right: '10mm',  // Adjust right margin as needed
        },
    });

    // Close the browser
    await browser.close();

    return pdfBuffer;
}



const NHculturegeneratePDF = async (data) => {
    const browser = await puppeteer.launch({
        executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/Chrome.exe',
    });

    const page = await browser.newPage();

    // Set the page size to A4 (210mm x 297mm)
    await page.pdf({
        format: 'A4',
    });


    const doctorImagePath = './images/doctorSign.png'; // Replace with the actual footer image path
    const doctorImageBase64 = fs.readFileSync(doctorImagePath, 'base64');

    const labImagePath = './images/labSign.png'; // Replace with the actual footer image path
    const labImageBase64 = fs.readFileSync(labImagePath, 'base64');

    // Create a simplified HTML template with the lab report data
    const htmlContent = `
       <html>
         <head>
         <!-- Include Bootstrap CSS via CDN or provide the URL to your own Bootstrap CSS file -->
         <link
             rel="stylesheet"
             href="https://cdn.jsdelivr.net/npm/bootstrap@5.5.0/dist/css/bootstrap.min.css"
             integrity="..."
             crossorigin="anonymous"
         > 
        
         </head>
         <body>
         
            ${data.feesData.map((details, index, array) => {
        if (details.type === 'Group') {
            return `
                        ${details.tests.map((test, testIndex) => {
                const labResult = details.labResults[testIndex];
                return `
                                ${labResult ? `${labResult.result}` : ''}
                            `;
            }).join('')}`;
        } else if ((index === 0 || details.category !== array[index - 1].category) || array[index - 1].type === 'Group') {
            return ` ${details.labResults[0] ? `${details.labResults[0].result}` : ''}
                    `;
        } else {
            return `
                        ${details.labResults[0] ? `${details.labResults[0].result}` : ''}
                    `;
        }
    }).join('')}
          
          <!-- Add content to display at the end of the report -->
          <div style="margin-top: 20px;">
            <p style="text-align: center; font-size: 16px;">End of the Report</p>
            <div style="text-align: left; float: left;">
            <img src="data:image/jpeg;base64,${doctorImageBase64}" alt="Header Image" style="width: 55%; height: 15%;  margin-bottom: -25px;" />
                <p><strong>Doctor</strong></p>
            </div>
            <div style="text-align: right; float: right;">
            <img src="data:image/jpeg;base64,${labImageBase64}" alt="Header Image" style="width: 55%; height: 15%; margin-bottom: -25px;"" />
                <p><strong>Lab Technician</strong></p>
            </div>
          </div>
         </body>
       </html>
     `;

    await page.setContent(htmlContent);

    // Generate a PDF with patient details in the header of every page
    const pdfBuffer = await page.pdf({
        format: 'A4',
        displayHeaderFooter: true,
        headerTemplate: `
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;margin-top: 60px;">
                <tr>
                    <td style="width: 60%; text-align: left;padding-left: 10mm;">
                        Patient Name: <strong> ${data.data.pSal}. ${data.data.pName} </strong>
                        <div style="margin-bottom: 5px;"></div> 
                        Sex / Age: <strong> ${data.data.pGender} / ${data.data.pAge} </strong>
                        <div style="margin-bottom: 5px;"></div> 
                        Referred By: <strong> ${data.data.drName} </strong>
                    </td>
                    <td style="width: 40%; text-align: left;">
                        Report ID: <strong> ${data.data.billId} </strong>
                        <div style="margin-bottom: 5px;"></div> 
                        Sampling Date: <strong> ${data.data.billDate} </strong>
                        <div style="margin-bottom: 5px;"></div> 
                        Report Date: <strong> ${data.data.billDate} </strong>
                    </td>
                </tr>
                <tr>
                <td colspan="4">
                <hr style="border: 1px solid #000;">
                </td>
                </tr>
            </table>
        `,
        footerTemplate: `<div style="text-align: center; font-size: 12px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>`,
        margin: {
            top: '50mm',    // Adjust top margin as needed
            bottom: '30mm', // Adjust bottom margin as needed
            left: '10mm',   // Adjust left margin as needed
            right: '10mm',  // Adjust right margin as needed
        },
    });

    // Close the browser
    await browser.close();

    return pdfBuffer;
}

