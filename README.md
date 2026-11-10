# 🩺 DocHub – Doctor & Clinic Management System

A complete, production-ready full-stack clinic and hospital management system built with **React.js 18**, **Vite**, **Tailwind CSS**, **Node.js**, **Express.js**, **MongoDB**, and integrated with **Razorpay Payment Gateway**.

---

## ✨ Key Features

### 👨‍⚕️ Multi-Speciality Doctor Portal
- Dedicated Doctor Dashboard with live schedule, patient queue, and today's appointments
- Customizable **Doctor Profile** (`/dentist/profile`):
  - Photo upload with client-side canvas optimization
  - Medical specialization selection (Cardiology, Dermatology, General Medicine, Pediatrics, Orthopedics, Neurology, Ophthalmology, ENT, Dentistry, Psychiatry, Gynecology, Oncology, Radiology, Urology, General Surgery)
  - Qualifications, license number, experience, bio, and weekly consultation availability toggles (Mon–Sun)
- Digital prescriptions with multi-medicine support + printable Rx sheets
- Clinical treatment notes and medical record updates

### 🧑‍💼 Admin & Receptionist Portal
- Comprehensive clinic dashboard with live statistics, appointment trends, and revenue metrics
- Full Patient Management (CRUD, search, filtering, medical history)
- Doctor onboarding and credential assignment
- Appointment scheduling, rescheduling, and status management (Pending, Confirmed, Completed, Cancelled)
- Billing & Invoicing system with ₹ INR currency support
- Receipt printing and tracking across payment modes (Razorpay, UPI, Card, Cash, Net Banking, Insurance)

### 🏥 Patient Portal
- Patient health dashboard with upcoming consultations and past treatments
- Online appointment booking with available doctor and slot selection
- **Razorpay Online Bill Payment** (`/patient/bills`):
  - Pay medical bills instantly via UPI, Credit/Debit Cards, and Net Banking
  - Real-time HMAC-SHA256 signature verification for fraud-proof transactions
  - Instant digital receipts with transaction ID and payment timestamp
- View and print digital prescriptions and medical history
- Patient profile and contact management

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js 18, Vite, Tailwind CSS 3, Heroicons |
| **Charts** | Recharts |
| **Routing & Auth** | React Router v6, JWT Authentication, bcryptjs |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas + Mongoose ODM |
| **Payment Gateway** | Razorpay SDK + Razorpay Checkout.js |
| **Email Service** | Resend API & Nodemailer (Gmail SMTP fallback) |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB Atlas](https://www.mongodb.com/atlas) connection string
- [Razorpay](https://razorpay.com/) Account (Test Key ID & Secret)

---

### 1. Clone the Repository
```bash
git clone https://github.com/np9373582301-cloud/Doc-Hub.git
cd Doc-Hub
```

---

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory (see `backend/.env.example`):
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
NODE_ENV=development

# Email service
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
RESEND_API_KEY=your_resend_api_key
RESEND_FROM=DocHub <onboarding@resend.dev>

# Razorpay credentials
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Start the backend server:
```bash
node server.js
# API runs on http://localhost:5000
```

---

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

Or on Windows, simply double-click `run.bat` to launch both backend and frontend servers simultaneously!

---

## 🔒 Security & Best Practices
- Never commit the `.env` file containing database credentials, email secrets, or Razorpay API keys.
- All Razorpay payments are validated using HMAC-SHA256 server-side signature verification before marking invoices as paid.
- Passwords are encrypted using salted bcrypt hashes.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
