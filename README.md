<p align="center">
  <img src="./assets/banner.png" alt="CareLink Banner" width="100%">
</p>

# 🏥 CareLink

> A lightweight payment verification system for diagnostic centers, powered by Nomba Checkout.

Built for the **DevCareer × Nomba Hackathon**.

## 🔗 Live Demo

Frontend: https://care-link-nine.vercel.app

Backend: https://carelink-backend-5iet.onrender.com

## The Problem

Payment verification in many clinics is still manual. Receptionists often have to wait for transfer confirmations before patients can proceed for consultation or laboratory tests, leading to unnecessary delays.

## The Solution

CareLink streamlines this process by allowing receptionists to:

- Generate secure Nomba payment links
- Send payment requests directly to patients via WhatsApp
- Automatically verify successful payments via webhooks
- Track payment status from a simple dashboard

## Features

- 💳 Nomba Checkout integration
- 📲 WhatsApp payment link sharing
- ⚡ Real-time payment verification
- 🔐 Secure webhook validation (HMAC SHA-512)
- 📋 Patient verification dashboard
- 🧾 Dynamic billing based on test type

## Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS
- Axios

**Backend**
- Node.js
- Express.js
- Nomba Checkout API
- Nomba Webhooks
- Crypto (HMAC)
- JSON File Storage

## Architecture

```mermaid
flowchart LR
    A[Receptionist] --> B[React Frontend]
    B --> C[Express Backend]
    C --> D[Nomba Checkout]
    D --> E[Patient Pays]
    D --> F[Webhook]
    F --> C
    C --> G[Update Payment Status]
    G --> B
```

## 🚀 Workflow Preview

| Dashboard | Register Patient |
|-----------|------------------|
| ![](./screenshots/dashboard0.png) | ![](./screenshots/register.png) |

| Payment Link Generated | Payment Verified |
|-------------------------|------------------|
| ![](./screenshots/payment-link.png) | ![](./screenshots/payment.png) |

| Updated Dashboard |
|-----------|
| ![](./screenshots/dashboard.png) | 



## Run Locally

```bash
git clone https://github.com/Yusufabdulmuiz/CareLink.git

cd frontend
npm install
npm run dev

cd ../backend
npm install
npm start
```

## Environment Variables

```env
NOMBA_CLIENT_ID=your_key
NOMBA_CLIENT_SECRET=your_secret_key
NOMBA_PARENT_ACCOUNT_ID=your_ID
NOMBA_SUB_ACCOUNT_ID=your_ID
NOMBA_WEBHOOK_KEY=your_webhook_secret
PORT=3000
```

## Future Improvements

- PostgreSQL + Prisma
- Authentication
- Multi-clinic support
- SMS notifications
- EMR integration

## Author

**Yusuf Abdulmuiz Olasunkanmi**

Built for the **DevCareer × Nomba Hackathon**.
