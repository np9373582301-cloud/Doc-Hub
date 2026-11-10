const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const User = require('../models/User');
const Patient = require('../models/Patient');
const Dentist = require('../models/Dentist');
const Appointment = require('../models/Appointment');
const Treatment = require('../models/Treatment');
const Invoice = require('../models/Invoice');
const Prescription = require('../models/Prescription');

const seed = async () => {
  if (mongoose.connection.readyState !== 1) {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      console.error('❌ MONGO_URI not found in .env file!');
      console.error('Make sure .env exists in the backend folder.');
      process.exit(1);
    }
    console.log('🔗 Connecting to:', MONGO_URI.substring(0, 40) + '...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
  }

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Patient.deleteMany({}),
    Dentist.deleteMany({}),
    Appointment.deleteMany({}),
    Treatment.deleteMany({}),
    Invoice.deleteMany({}),
    Prescription.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // Drop indexes to avoid conflicts
  const collections = ['patients', 'appointments', 'prescriptions', 'invoices'];
  for (const col of collections) {
    try { await mongoose.connection.collection(col).dropIndexes(); } catch (e) {}
  }

  // Create Admin
  const adminUser = await User.create({ name: 'Admin User', email: 'admin@dochub.com', password: 'Admin@123', role: 'admin', phone: '9876543210' });
  console.log('✅ Admin created');

  // Create Doctor Users across multiple specialities
  const d1User = await User.create({ name: 'Dr. Priya Sharma', email: 'priya@dochub.com', password: 'Doctor@123', role: 'dentist', phone: '9876543211' });
  const d2User = await User.create({ name: 'Dr. Rahul Mehta', email: 'rahul@dochub.com', password: 'Doctor@123', role: 'dentist', phone: '9876543212' });
  const d3User = await User.create({ name: 'Dr. Anita Gupta', email: 'anita@dochub.com', password: 'Doctor@123', role: 'dentist', phone: '9876543213' });
  const d4User = await User.create({ name: 'Dr. Vikram Rao', email: 'vikram.rao@dochub.com', password: 'Doctor@123', role: 'dentist', phone: '9876543214' });
  const d5User = await User.create({ name: 'Dr. Neha Kapoor', email: 'neha@dochub.com', password: 'Doctor@123', role: 'dentist', phone: '9876543215' });

  const availability = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => ({ day, startTime: '09:00', endTime: '18:00', isAvailable: true }));

  const d1 = await Dentist.create({ user: d1User._id, name: 'Dr. Priya Sharma', email: 'priya@dochub.com', phone: '9876543211', specialization: 'Cardiology (Heart Specialist)', experience: 12, qualification: 'MD, DM Cardiology', licenseNumber: 'MCI-2012-1089', availability });
  const d2 = await Dentist.create({ user: d2User._id, name: 'Dr. Rahul Mehta', email: 'rahul@dochub.com', phone: '9876543212', specialization: 'General Physician', experience: 14, qualification: 'MBBS, MD Medicine', licenseNumber: 'MCI-2010-4521', availability });
  const d3 = await Dentist.create({ user: d3User._id, name: 'Dr. Anita Gupta', email: 'anita@dochub.com', phone: '9876543213', specialization: 'Dermatology (Skin & Hair)', experience: 9, qualification: 'MD Dermatology', licenseNumber: 'MCI-2015-7834', availability });
  const d4 = await Dentist.create({ user: d4User._id, name: 'Dr. Vikram Rao', email: 'vikram.rao@dochub.com', phone: '9876543214', specialization: 'Orthopedics (Bones & Joints)', experience: 11, qualification: 'MS Orthopedics', licenseNumber: 'MCI-2013-3390', availability });
  const d5 = await Dentist.create({ user: d5User._id, name: 'Dr. Neha Kapoor', email: 'neha@dochub.com', phone: '9876543215', specialization: 'Pediatrics (Child Health)', experience: 8, qualification: 'MD Pediatrics', licenseNumber: 'MCI-2016-9012', availability });

  await User.findByIdAndUpdate(d1User._id, { linkedId: d1._id, linkedModel: 'Dentist' });
  await User.findByIdAndUpdate(d2User._id, { linkedId: d2._id, linkedModel: 'Dentist' });
  await User.findByIdAndUpdate(d3User._id, { linkedId: d3._id, linkedModel: 'Dentist' });
  await User.findByIdAndUpdate(d4User._id, { linkedId: d4._id, linkedModel: 'Dentist' });
  await User.findByIdAndUpdate(d5User._id, { linkedId: d5._id, linkedModel: 'Dentist' });
  console.log('✅ Doctors created');

  // Create Patients one by one so pre-save hook runs
  const p1User = await User.create({ name: 'Arjun Patel', email: 'arjun@example.com', password: 'Patient@123', role: 'patient', phone: '9988776655' });
  const p2User = await User.create({ name: 'Sneha Reddy', email: 'sneha@example.com', password: 'Patient@123', role: 'patient', phone: '9988776644' });
  const p3User = await User.create({ name: 'Vikram Singh', email: 'vikram@example.com', password: 'Patient@123', role: 'patient', phone: '9988776633' });
  const p4User = await User.create({ name: 'Pooja Nair', email: 'pooja@example.com', password: 'Patient@123', role: 'patient', phone: '9988776622' });
  const p5User = await User.create({ name: 'Rohit Kumar', email: 'rohit@example.com', password: 'Patient@123', role: 'patient', phone: '9988776611' });

  const p1 = await Patient.create({ user: p1User._id, name: 'Arjun Patel', email: 'arjun@example.com', phone: '9988776655', dob: new Date('1990-05-15'), gender: 'Male', bloodGroup: 'B+', address: '12 MG Road, Mumbai', allergies: ['Penicillin'], medicalHistory: 'Hypertension', emergencyContact: { name: 'Priya Patel', phone: '9988776600', relation: 'Wife' } });
  const p2 = await Patient.create({ user: p2User._id, name: 'Sneha Reddy', email: 'sneha@example.com', phone: '9988776644', dob: new Date('1995-08-22'), gender: 'Female', bloodGroup: 'O+', address: '45 Park St, Bangalore', allergies: [], medicalHistory: 'None', emergencyContact: { name: 'Ravi Reddy', phone: '9988776601', relation: 'Brother' } });
  const p3 = await Patient.create({ user: p3User._id, name: 'Vikram Singh', email: 'vikram@example.com', phone: '9988776633', dob: new Date('1985-11-10'), gender: 'Male', bloodGroup: 'A+', address: '78 Civil Lines, Delhi', allergies: ['Aspirin'], medicalHistory: 'Diabetes Type 2', emergencyContact: { name: 'Meera Singh', phone: '9988776602', relation: 'Spouse' } });
  const p4 = await Patient.create({ user: p4User._id, name: 'Pooja Nair', email: 'pooja@example.com', phone: '9988776622', dob: new Date('1998-03-28'), gender: 'Female', bloodGroup: 'AB+', address: '23 Koregaon Park, Pune', allergies: [], medicalHistory: 'None', emergencyContact: { name: 'Suresh Nair', phone: '9988776603', relation: 'Father' } });
  const p5 = await Patient.create({ user: p5User._id, name: 'Rohit Kumar', email: 'rohit@example.com', phone: '9988776611', dob: new Date('1992-07-04'), gender: 'Male', bloodGroup: 'O-', address: '56 Anna Nagar, Chennai', allergies: [], medicalHistory: 'None', emergencyContact: { name: 'Sita Kumar', phone: '9988776604', relation: 'Mother' } });

  await User.findByIdAndUpdate(p1User._id, { linkedId: p1._id, linkedModel: 'Patient' });
  await User.findByIdAndUpdate(p2User._id, { linkedId: p2._id, linkedModel: 'Patient' });
  await User.findByIdAndUpdate(p3User._id, { linkedId: p3._id, linkedModel: 'Patient' });
  await User.findByIdAndUpdate(p4User._id, { linkedId: p4._id, linkedModel: 'Patient' });
  await User.findByIdAndUpdate(p5User._id, { linkedId: p5._id, linkedModel: 'Patient' });
  console.log('✅ Patients created');

  // Create Appointments
  const now = new Date();
  const a1 = await Appointment.create({ patient: p1._id, dentist: d1._id, date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0), timeSlot: '10:00', treatmentType: 'Teeth Cleaning', status: 'Confirmed', notes: 'First visit' });
  const a2 = await Appointment.create({ patient: p2._id, dentist: d2._id, date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 30), timeSlot: '11:30', treatmentType: 'Root Canal', status: 'Pending' });
  const a3 = await Appointment.create({ patient: p3._id, dentist: d1._id, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0), timeSlot: '09:00', treatmentType: 'Braces Checkup', status: 'Confirmed' });
  const a4 = await Appointment.create({ patient: p4._id, dentist: d3._id, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 14, 0), timeSlot: '14:00', treatmentType: 'Gum Treatment', status: 'Pending' });
  const a5 = await Appointment.create({ patient: p1._id, dentist: d2._id, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 10, 0), timeSlot: '10:00', treatmentType: 'Filling', status: 'Completed' });
  const a6 = await Appointment.create({ patient: p5._id, dentist: d1._id, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3, 15, 0), timeSlot: '15:00', treatmentType: 'Extraction', status: 'Completed' });
  console.log('✅ Appointments created');

  // Create Treatments
  const t1 = await Treatment.create({ patient: p1._id, dentist: d2._id, appointment: a5._id, diagnosis: 'Cavity in molar', treatmentType: 'Composite Filling', toothNumber: '16', treatmentDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7), description: 'Deep cavity filled with composite resin', cost: 2500, status: 'Completed' });
  const t2 = await Treatment.create({ patient: p5._id, dentist: d1._id, appointment: a6._id, diagnosis: 'Severely damaged tooth', treatmentType: 'Tooth Extraction', toothNumber: '28', treatmentDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3), description: 'Surgical extraction of wisdom tooth', cost: 3000, status: 'Completed' });
  const t3 = await Treatment.create({ patient: p2._id, dentist: d2._id, diagnosis: 'Infected root canal', treatmentType: 'Root Canal Treatment', toothNumber: '36', treatmentDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14), description: 'Multi-session root canal therapy', cost: 8000, status: 'In Progress' });
  console.log('✅ Treatments created');

  // Create Prescriptions
  await Prescription.create({ patient: p1._id, dentist: d2._id, appointment: a5._id, diagnosis: 'Post filling care', medicines: [{ name: 'Ibuprofen', dosage: '400mg', frequency: 'Twice daily', duration: '3 days', instructions: 'Take after food' }, { name: 'Amoxicillin', dosage: '500mg', frequency: 'Thrice daily', duration: '5 days', instructions: 'Complete full course' }], date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7) });
  await Prescription.create({ patient: p5._id, dentist: d1._id, appointment: a6._id, diagnosis: 'Post extraction care', medicines: [{ name: 'Paracetamol', dosage: '500mg', frequency: 'As needed', duration: '3 days', instructions: 'Max 3 times a day' }, { name: 'Chlorhexidine Mouthwash', dosage: '10ml', frequency: 'Twice daily', duration: '7 days', instructions: 'Rinse 30 seconds' }], date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3) });
  console.log('✅ Prescriptions created');

  // Create Invoices
  await Invoice.create({ patient: p1._id, treatment: t1._id, appointment: a5._id, items: [{ description: 'Composite Filling - Tooth 16', amount: 2500 }], subtotal: 2500, discount: 0, tax: 0, total: 2500, paymentMethod: 'UPI', paymentStatus: 'Paid', paidAmount: 2500, paidDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7) });
  await Invoice.create({ patient: p5._id, treatment: t2._id, appointment: a6._id, items: [{ description: 'Tooth Extraction - Wisdom Tooth', amount: 3000 }], subtotal: 3000, discount: 200, tax: 0, total: 2800, paymentMethod: 'Cash', paymentStatus: 'Paid', paidAmount: 2800, paidDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3) });
  await Invoice.create({ patient: p2._id, treatment: t3._id, items: [{ description: 'Root Canal - Session 1', amount: 4000 }, { description: 'X-Ray', amount: 500 }], subtotal: 4500, discount: 0, tax: 0, total: 4500, paymentStatus: 'Pending' });
  await Invoice.create({ patient: p3._id, items: [{ description: 'Dental Consultation', amount: 500 }, { description: 'Scaling and Polishing', amount: 1500 }], subtotal: 2000, discount: 0, tax: 0, total: 2000, paymentStatus: 'Pending' });
  console.log('✅ Invoices created');

  console.log('\n✅ Database seeded successfully!');
  console.log('\n📋 Demo Credentials:');
  console.log('Admin    → admin@dochub.com / Admin@123');
  console.log('Doctor   → priya@dochub.com / Doctor@123');
  console.log('Patient  → arjun@example.com / Patient@123');
  if (require.main === module) {
    process.exit(0);
  }
};

if (require.main === module) {
  seed().catch(err => { console.error('❌ Seed failed:', err.message); process.exit(1); });
}

module.exports = seed;
