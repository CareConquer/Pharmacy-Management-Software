import Medicine from "../models/medicineModel.js";
import GroupTest from "../models/GroupTest.js";

export const tests = async (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    try {
        const tests = await Test.find();
        // console.log('Fetched tests:', tests);
        res.json(tests);
    } catch (error) {
        console.error('Error fetching tests:', error);
        res.status(500).json({ error: 'Failed to fetch tests' });
    }
}

export const testfindType = async (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    // const { testID } = req.query;
    const testID = req.params.id;
    // console.log(testID);
    // Assuming you have a function getTestType to determine the type based on the ID
    const testType = await getTestType(testID);

    if (!testType) {
        return res.status(400).json({ error: 'Invalid test ID or type' });
    }

    res.json({ type: testType });
}


const getTestType = async (id) => {
    try {
        const test = await Test.findById(id);

        if (test) {
        // console.log(test);
            return { type: 'Test'};
        }

        const groupTest = await GroupTest.findById(id);
        if (groupTest) {
            return { type: 'Group' };
        }

        return null; // No matching type found
    } catch (error) {
        console.error('Error fetching test type:', error);
        return null;
    }
}



export const getMedicineList = async (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    try {
        const tests = await Medicine.find();
        // console.log('Fetched tests:', tests);
        res.json(tests);
    } catch (error) {
        console.error('Error fetching tests:', error);
        res.status(500).json({ error: 'Failed to fetch tests' });
    }
}

export const createMed = async (req, res) => {
    try {
        const { MedicineName, MedicineCompany, Composition,  MedicineType, HSNCode, Schedule, ReOrderLevel } = req.body;
        const medicine = new Medicine({ MedicineName, MedicineCompany, Composition, MedicineType, HSNCode, Schedule, ReOrderLevel });
        const medicineSaved = await medicine.save();
        res.status(201).json(medicineSaved);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export const nextTestid = async (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    try {
        // Find the highest patient ID in the database
        const highesttestID = await Test.findOne().sort({ id: -1 });

        // Calculate the next patient ID
        const nextTestId = highesttestID ? highesttestID.id + 1 : 1;

        res.json({ nextTestId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const fintTestById = async (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    try {
        const testId = req.params.id; // Get the patient id from the route parameter
        const test = await Test.findById(testId); // Use findById to fetch a patient by id
        // console.log('Fetched Test:', test);
        
        if (!test) {
            return res.status(404).json({ error: 'Test not found' });
        }
        
        res.json(test);
    } catch (error) {
        console.error('Error fetching patient:', error);
        res.status(500).json({ error: 'Failed to fetch Test' });
    }
 }




export const deleteTest = async (req, res) => {

    const TestId  = req.params.id;
  
    try {
      const deletedTest = await Test.findByIdAndDelete(TestId);
  
      if (!deletedTest) {
        return res.status(404).json({ message: 'Test not found' });
      }
  
      res.json({ message: 'Test deleted successfully' });
    } catch (error) {
      console.error('Error deleting Test:', error);
      res.status(500).json({ error: 'An error occurred while deleting the test' });
    }
  }

export default tests

