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
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8') || '[]');
    } catch (error) {
        return [];
    }
};

const savePatientsToFile = (data) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {}
};

app.get('/api/patients', (req, res) => {
    res.status(200).json(getPatientsFromFile());
});

app.post('/api/patients', async (req, res) => {
    const { name, phone, testType, amount } = req.body;
    const orderReference = `ORD-${Date.now()}`;

    try {
        const response = await axios.post('https://sandbox.nomba.com/v1/checkout/order', {
            order: {
                orderReference,
                amount: amount.toString(),
                currency: "NGN",
                customerEmail: "test@carelink.com",
                accountId: process.env.NOMBA_SUB_ACCOUNT_ID,
                callbackUrl:`${process.env.BASE_URL}/api/webhook`
            }
        }, {
            headers: { 'Content-Type': 'application/json', 'accountId': process.env.NOMBA_PARENT_ACCOUNT_ID }
        });

        const newPatient = {
            id: `pat_${Date.now()}`,
            orderReference,
            name,
            phone,
            testType,
            amount,
            status: "pending",
            checkoutUrl: response.data.data.checkoutLink
        };

        const patients = getPatientsFromFile();
        patients.push(newPatient);
        savePatientsToFile(patients);

        res.status(201).json(newPatient);
    } catch (error) {
        res.status(500).json({ error: "Failed to generate payment link" });
    }
});

app.post('/api/webhook', (req, res) => {
    const nombaSignature = req.headers['nomba-signature'];
    const webhookKey = process.env.NOMBA_WEBHOOK_KEY;

    if (webhookKey && nombaSignature) {
        const hash = crypto.createHmac('sha512', webhookKey)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (hash !== nombaSignature) return res.status(401).send('Unauthorized');
    }

    const ref = req.body.data?.transaction?.merchantTxRef || req.body.data?.orderReference || req.body.orderReference;
    const eventType = req.body.event_type || req.body.status;

    if (ref && (eventType === 'payment_success' || eventType === 'SUCCESS')) {
        const patients = getPatientsFromFile();
        const patientIndex = patients.findIndex(p => p.orderReference === ref);

        if (patientIndex !== -1 && patients[patientIndex].status !== 'paid') {
            patients[patientIndex].status = "paid";
            savePatientsToFile(patients);
        }
    }
    res.status(200).send('OK');
});

app.get('/api/webhook', (req, res) => {
    const ref = req.query.orderReference || req.query.merchantTxRef || req.query.txref;

    if (ref) {
        const patients = getPatientsFromFile();
        const patientIndex = patients.findIndex(p => p.orderReference === ref);

        if (patientIndex !== -1 && patients[patientIndex].status !== 'paid') {
            patients[patientIndex].status = "paid";
            savePatientsToFile(patients);
        }
    }
    res.send(`
<!DOCTYPE html>
<html>
<head>
<title>CareLink</title>
<style>
body{
font-family:Arial;
display:flex;
justify-content:center;
align-items:center;
height:100vh;
background:#f5fffc;
}
.card{
padding:40px;
border-radius:12px;
box-shadow:0 5px 20px rgba(0,0,0,.08);
text-align:center;
}
h2{
color:#0d9488;
}
</style>
</head>
<body>
<div class="card">
<h2>✅ Payment Verified</h2>
<p>Your payment has been received successfully.</p>
<p>You may now close this page.</p>
</div>
</body>
</html>
`);
});

app.listen(PORT);