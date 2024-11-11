import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import multer from 'multer';
import  helmet from 'helmet'
import morgan from 'morgan';
import path from "path";
import { fileURLToPath } from 'url';
import register from "./controllers/auth.js"
import tests from "./controllers/tests.js"
import createdoctor from './controllers/createdoctor.js';
import { getRef , updateRef, getReferrals} from './controllers/createdoctor.js';
import { getdoctor } from './controllers/createdoctor.js';
import { getDoctorById } from './controllers/createdoctor.js';
import { updateDoctor } from './controllers/createdoctor.js';
import { deleteDoctor } from './controllers/createdoctor.js';
import { getpatients } from './controllers/auth.js';
import { createPatient } from './controllers/auth.js';
import { nextpId } from './controllers/auth.js';
import { getPatientById } from './controllers/auth.js';
import { updatePatient } from './controllers/auth.js';
import { deletePatient } from './controllers/auth.js';
import { nextTestid } from './controllers/tests.js';
import { createMed } from './controllers/tests.js';
import groupTest from './controllers/groupTest.js';
import { getMedicineList } from './controllers/tests.js';
import { fintTestById } from './controllers/tests.js';
import { getgroupTests } from './controllers/groupTest.js';
import { fintGroupTestById } from './controllers/groupTest.js';
import { updateGroupTestById } from './controllers/groupTest.js';
import { testfindType } from './controllers/tests.js';
import createProfile from './controllers/createProfile.js';
import { getProfiles } from './controllers/createProfile.js';
import { deleteGroup } from './controllers/groupTest.js';
import { deleteProfile } from './controllers/createProfile.js';
import { deleteTest } from './controllers/tests.js';
import { findProfilebyId } from './controllers/createProfile.js';
import { updateProfileTestById } from './controllers/createProfile.js';
import { billDetails, deleteBill } from './controllers/bill.js';
import bill from './controllers/bill.js';
import { collectDueAmount } from './controllers/bill.js';
import testDetails from './controllers/labResultentry.js';
import { saveResult } from './controllers/labResultentry.js';
import { getEnteredResult } from './controllers/labResultentry.js';
import dailyCollectionreport, { downloadDailyCollection, downloadTestList, downloadGroupList, downloadMonthlyCollection, dailyRegistration, downloadDailyRegistration, doctorWiseCollection, downloadDoctorWise } from './controllers/reports.js';
import { monthlyCollectionreport } from './controllers/reports.js';
import { monthlydueCollectionreport } from './controllers/reports.js';
import { updatebillTest } from './controllers/bill.js';
import { labReport, sendEmail, sendCultureEmail, sendWhatsapp, sendCultureWhatsapp, WHlabReport, cultureWHlabReport, cultureNHlabReport } from './controllers/labReport.js';
import { CreateUser } from './controllers/login.js';
import { getUser } from './controllers/login.js';
import { getUsers } from './controllers/login.js';
import { updateUser } from './controllers/login.js';
import { deleteUser } from './controllers/login.js';
import { storeAccess } from './controllers/login.js';
import { getAccess } from './controllers/login.js';
import { Login } from './controllers/login.js';
import { billPrint } from './controllers/bill.js';
import { createBill } from './controllers/auth.js';
import { sales, purchases, getDueDistibutors, custDue, expiredMedicines, expiringMedicines } from './controllers/dashboard.js';
import { createSupplier, getSuppliers, getMedicines,returnMedicine,returnPurchase, purchaseOrder, clearDue, findSupplier, updateSupplier,findMedicine,updateMedicine, clearBillDue,getPurchaseOrders, getPurchaseOrderById, getAvailable, saveBill , pharmaBills, getBillDetails, pharmaBillPrint} from './controllers/supplier.js';
import { getPurchaseReport, getMedicineWisePurchaseReport, getMedicineStock,getMedicineWiseSalesReport } from './controllers/purchaseReport.js';

// CONFIGURATIONS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"}))
app.use(morgan("common"));
app.use(bodyParser.json({limit: "30mb", extended: true}));
app.use(bodyParser.urlencoded({limit: "30mb", extended: true}));
// Allow requests from the frontend origin (http://localhost:3000)
app.use(cors({ origin: 'http://localhost:3000' }));
app.use("/assets", express.static(path.join(__dirname, 'public/assets')));


//FILE  STORAGE CONFIG
const storage = multer.diskStorage({
    destination:function(req, file, cb){
        cb(null, "public/assests");
    },
    filename:function(req, file, cb){
        cb(null,file.originalname)
    }
});
const upload = multer({storage});


//Login 
app.post("/auth/createUser", CreateUser);
app.get("/auth/getUser", getUser);
app.get("/auth/getUser/:id", getUsers);
app.put("/auth/updateUser/:id", updateUser);
app.delete("/auth/deleteUser/:id", deleteUser);
app.post("/auth/store-user-access", storeAccess);
app.get("/auth/getAccess/:id", getAccess);
app.post("/auth/login", Login);



// Patients Route
app.post("/auth/create-patient", createPatient);
app.post("/auth/register", register);
app.post("/auth/oldBill", createBill);
app.get("/auth/next-patient-id", nextpId);
app.get("/auth/findPatientByid/:id", getPatientById);
app.put("/auth/update-patient/:id", updatePatient);
app.get("/auth/get-patients", getpatients);
app.delete('/auth/delete-patient/:pId', deletePatient);

//Test Routes
app.get("/auth/tests", tests);
app.get("/auth/getMedicineList", getMedicineList);
app.post("/auth/create-medicine", createMed);
app.get("/auth/next-test-id", nextTestid);
app.get("/auth/editMedicine/:id", fintTestById);
app.get("/auth/testfindType/:id", testfindType);
app.delete('/auth/deleteMedicine/:id', deleteTest);


//Group Test Routes
app.post("/auth/create-groupTest", groupTest);
app.get("/auth/getGroupTestList", getgroupTests);
app.get("/auth/groupfindByidTest/:id", fintGroupTestById);
app.put("/auth/update-groupTest/:id", updateGroupTestById);
app.delete('/auth/deleteGroup/:id', deleteGroup);


//Profile Test Routes
app.post("/auth/create-Profile", createProfile);
app.get("/auth/getProfileList", getProfiles);
app.delete('/auth/deleteProfile/:id', deleteProfile);
app.get("/auth/findProfilebyId/:id", findProfilebyId);
app.put("/auth/updateProfileTest/:id", updateProfileTestById);


//Doctor Routes
app.post("/auth/create-doctor", createdoctor);
app.get("/auth/get-doctors", getdoctor);
app.get("/auth/findDoctorByid/:id", getDoctorById);
app.put("/auth/update-doctor/:id", updateDoctor);
app.delete('/auth/delete-doctor/:doctorId', deleteDoctor);

//Bill Routs
app.get("/auth/bills", bill);
app.get("/auth/billDetails/:id", billDetails);
app.put("/auth/updateDueAmount/:id", collectDueAmount);
app.put("/auth/updateTest/:id", updatebillTest);
app.delete('/auth/deleteBill/:id', deleteBill);
app.post("/auth/print-bill/:id", billPrint);


//Lab Result Entry
app.get("/auth/labResultDetails/:id", testDetails);
app.post("/auth/saveResults/:id", saveResult);
app.get("/auth/fetchResult/:id", getEnteredResult);
app.post("/auth/print-pdf/:id", labReport);
app.post("/auth/wh-print-pdf/:id", WHlabReport);
app.post("/auth/wh-culture-pdf/:id", cultureWHlabReport);
app.post("/auth/nh-culture-pdf/:id", cultureNHlabReport);
app.post("/auth/send-whatsapp/:id", sendWhatsapp);
app.post("/auth/send-culture-whatsapp/:id", sendCultureWhatsapp);
app.post("/auth/send-email/:id", sendEmail);
app.post("/auth/send-culture-email/:id", sendCultureEmail);

//Reports
app.get("/auth/dailyCollection/:date", dailyCollectionreport);
app.get("/auth/monthlyCollection/:month", monthlyCollectionreport);
app.get("/auth/monthlydueCollection/:month", monthlydueCollectionreport);
app.get("/auth/dailyRegistration/:startDate/:endDate", dailyRegistration);
app.get("/auth/doctorWiseCollection/:doctorId/:startDate/:endDate", doctorWiseCollection);
app.post("/auth/getReferrals", getReferrals);



//Download Excel Report
app.get("/auth/downloadDailyCollection/:date", downloadDailyCollection);
app.get("/auth/downloadMonthlyCollection/:month", downloadMonthlyCollection);
app.get("/auth/downloadRegistration/:startDate/:endDate", downloadDailyRegistration);
app.get("/auth/downloadDoctorWiseCollection/:doctorId/:startDate/:endDate", downloadDoctorWise);



//Download Tests
app.get("/auth/export-to-excel", downloadTestList);
app.get("/auth/export-groupTest", downloadGroupList);


//Backup
app.get("/auth/backup", bill);

//REF
app.get("/auth/get-test-details/:id", getRef);
app.post("/auth/updateRef", updateRef);


//Supplier
app.post("/auth/suppliers/create", createSupplier);
app.get("/auth/suppliers", getSuppliers);
app.get("/auth/findSupplier/:supplierId", findSupplier);
app.put("/auth/updateSupplier/:supplierId", updateSupplier);

// app.get("/auth/companies", getCompanies);
// app.get("/auth/medicine-types", getmedicinetype);

app.get('/auth/medicines', getMedicines);
app.get("/auth/findMedicineById/:medicineId", findMedicine);
app.put("/auth/updateMedicineById/:medicineId", updateMedicine);


//Purchase Order
app.post("/auth/purchaseOrder", purchaseOrder);
app.get('/auth/getPurchaseOrders', getPurchaseOrders);
app.get('/auth/available', getAvailable);
app.get('/auth/getPurchaseOrder/:id', getPurchaseOrderById);


//billing
app.post("/auth/billing", saveBill);
app.get('/auth/pharmaBills', pharmaBills);
app.get('/auth/pharmaBills/:billId', getBillDetails);

//print pharma bill
app.post("/auth/PrintPharmaBill/:id", pharmaBillPrint);


//Return Purchase
app.post('/auth/returnPurchase/:id', returnPurchase);


//Return Sales
app.post('/auth/returnMedicine/:billId', returnMedicine);



//Clear Purchase Due 
app.post('/auth/clearDue/:id', clearDue);
app.post('/auth/clearBillDue/:id', clearBillDue);



// Dash
app.get('/auth/sales', sales);
app.get('/auth/purchases', purchases);
app.get('/auth/expiring-items', expiringMedicines);
app.get('/auth/expired-items', expiredMedicines);
app.get('/auth/collect-from-customers', custDue);
app.get('/auth/pay-to-distributors', getDueDistibutors);

//Reports
app.get('/auth/purchasedReport', getPurchaseReport);
app.get('/auth/getMedicineStock', getMedicineStock);
app.get('/auth/medicineWisePurchaseReport', getMedicineWisePurchaseReport);
app.get('/auth/medicineWiseSalesReport', getMedicineWiseSalesReport);


// MONGOOSE SETUP
const PORT = process.env.PORT || 6001;
mongoose.connect(process.env.MONGO_URL,{
useNewUrlParser: true,
useUnifiedTopology: true,
})
.then(()=>{
app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
})
.catch((error)=> console.log(`${error} did not connect`))




