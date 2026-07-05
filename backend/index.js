const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'patients.json');

const getPatientsFromFile = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
            return [];
        }
        const fileData = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(fileData || '[]');
    } catch (error) {
        console.error("File Read Error:", error.message);
        return [];
    }
};

const savePatientsToFile = (data) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("File Write Error:", error.message);
    }
};

app.get('/api/patients', (req, res) => {
    const patients = getPatientsFromFile();
    res.status(200).json(patients);
});

app.post('/api/patients', async (req, res) => {
    const { name, phone, testType, amount } = req.body;
    const orderReference = `ORD-${Date.now()}`;

    try {
        const nombaPayload = {
            order: {
                orderReference,
                amount: amount.toString(),
                currency: "NGN",
                customerEmail: "test@carelink.com"
            }
        };

        const response = await axios.post('https://sandbox.nomba.com/v1/checkout/order', nombaPayload, {
            headers: { 'Content-Type': 'application/json' }
        });

        const checkoutUrl = response.data.data.checkoutLink;

        const newPatient = {
            id: `pat_${Date.now()}`,
            orderReference,
            name,
            phone,
            testType,
            amount,
            status: "pending",
            checkoutUrl
        };

        const patients = getPatientsFromFile();
        patients.push(newPatient);
        savePatientsToFile(patients);

        res.status(201).json(newPatient);
    } catch (error) {
        console.error("Nomba Checkout Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to generate payment link" });
    }
});

app.post('/api/webhook', (req, res) => {
    const nombaSignature = req.headers['nomba-signature'];
    const webhookKey = process.env.NOMBA_WEBHOOK_KEY;

    const hash = crypto.createHmac('sha512', webhookKey)
        .update(JSON.stringify(req.body))
        .digest('hex');

    if (hash !== nombaSignature) {
        console.warn("Unauthorized webhook signature verification failed.");
        return res.status(401).send('Unauthorized request');
    }

    const { orderReference, status } = req.body;
    const patients = getPatientsFromFile();
    const patientIndex = patients.findIndex(p => p.orderReference === orderReference);

    if (patientIndex !== -1 && status === 'SUCCESS') {
        patients[patientIndex].status = "paid";
        savePatientsToFile(patients);
    }

    res.status(200).send('Webhook successfully processed');
});

app.listen(PORT, () => {
    console.log(`CareLink server running on port ${PORT}`);
});