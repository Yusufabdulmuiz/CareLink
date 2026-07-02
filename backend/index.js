const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const crypto = require('crypto'); 

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'patients.json');

// ==========================================
// HELPER FUNCTIONS (File System Database)
// ==========================================

// Helper function to safely read patients from the JSON file
const getPatientsFromFile = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            // If the file doesn't exist yet, create it with an empty array
            fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
            return [];
        }
        const fileData = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(fileData || '[]');
    } catch (error) {
        console.error("Error reading data file, resetting to empty array:", error.message);
        return [];
    }
};

// Helper function to safely write patients to the JSON file
const savePatientsToFile = (data) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error writing to data file:", error.message);
    }
};

// ==========================================
// ROUTES
// ==========================================

// Route A: Get all patients (Reads directly from the JSON file)
app.get('/api/patients', (req, res) => {
    const patients = getPatientsFromFile();
    res.status(200).json(patients);
});


// Route B: Create Bill & Get Nomba Checkout Link
app.post('/api/patients', async (req, res) => {
    const { name, phone, testType, amount } = req.body;
    const orderReference = `ORD-${Date.now()}`;

    try {
        // Nomba requires the payload to be wrapped inside an 'order' object
        const nombaPayload = {
            order: {
                orderReference: orderReference,
                amount: amount.toString(),
                currency: "NGN",
                customerEmail: "test@carelink.com"
            }
        };

        // The correct sandbox URL. No complex OAuth headers needed for testing!
        const response = await axios.post('https://sandbox.nomba.com/v1/checkout/order', nombaPayload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Extract the generated link from Nomba's response
        const checkoutUrl = response.data.data.checkoutLink;

        const newPatient = {
            id: `pat_${Date.now()}`,
            orderReference: orderReference,
            name: name,
            phone: phone,
            testType: testType,
            amount: amount,
            status: "pending",
            checkoutUrl: checkoutUrl
        };

        // Load existing database array, add the new item, and save it back to disk
        const patients = getPatientsFromFile();
        patients.push(newPatient);
        savePatientsToFile(patients);

        res.status(201).json(newPatient);

    } catch (error) {
        // Upgraded error logging so we can see exact Nomba API rejections
        console.error("Nomba Error Details:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to generate payment link" });
    }
});

// Route C: SECURE Webhook for Nomba Payment Reconciliation
app.post('/api/webhook', (req, res) => {
    const nombaSignature = req.headers['nomba-signature'];
    const webhookKey = process.env.NOMBA_WEBHOOK_KEY;

    // 1. Re-create the hash using your secret key and the incoming data
    const hash = crypto.createHmac('sha512', webhookKey)
                       .update(JSON.stringify(req.body))
                       .digest('hex');

    // 2. Compare your hash to Nomba's signature
    if (hash !== nombaSignature) {
        console.error(" SECURITY ALERT: Fake webhook intercepted!");
        return res.status(401).send('Unauthorized request');
    }

    // 3. If it matches, process the payment safely!
    const { orderReference, status } = req.body;
    const patients = getPatientsFromFile();
    const patientIndex = patients.findIndex(p => p.orderReference === orderReference);

    if (patientIndex !== -1 && status === 'SUCCESS') {
        patients[patientIndex].status = "paid";
        savePatientsToFile(patients);
        console.log(`Secure Payment confirmed for: ${patients[patientIndex].name}`);
    }

    res.status(200).send('Webhook securely received');
});

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
    console.log(` CareLink Persistent Backend engine running on http://localhost:${PORT}`);
});