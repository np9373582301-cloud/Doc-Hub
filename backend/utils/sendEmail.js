const { Resend } = require('resend');
const nodemailer = require('nodemailer');

const baseTemplate = (content) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px; border-radius: 12px;">
    <div style="background: #2563eb; padding: 24px; border-radius: 10px 10px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">🩺 DocHub</h1>
      <p style="color: #bfdbfe; margin: 4px 0 0;">Doctor & Multi-Speciality Clinic Management System</p>
    </div>
    <div style="background: white; padding: 32px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
      ${content}
    </div>
    <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 16px;">
      This is an automated message from DocHub. Please do not reply.
    </p>
  </div>
`;

const sendEmail = async ({ to, subject, html, text }) => {
  // 1. Try Gmail/Nodemailer if configured (preferred for sending to any address without custom domain)
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER.trim(),
          pass: process.env.EMAIL_PASS.replace(/\s+/g, ''),
        },
      });
      await transporter.sendMail({
        from: `"DocHub 🩺" <${process.env.EMAIL_USER.trim()}>`,
        to,
        subject,
        html,
        text,
      });
      console.log(`✉️  [Gmail SMTP] Email delivered to ${to}`);
      return { success: true, provider: 'gmail' };
    } catch (err) {
      console.error('Gmail SMTP error:', err.message);
    }
  }

  // 2. Try Resend if configured
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your_resend_api_key_here') {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const from = process.env.RESEND_FROM || 'DocHub <onboarding@resend.dev>';
      const result = await resend.emails.send({
        from,
        to,
        subject,
        html,
        text,
      });
      if (result.error) {
        console.warn('Resend send warning:', result.error.message);
      } else {
        console.log(`✉️  [Resend] Email delivered to ${to}`);
        return { success: true, provider: 'resend', id: result.data?.id };
      }
    } catch (err) {
      console.error('Resend email error:', err.message);
    }
  }

  // 3. Fallback: Log email to console for development
  console.log(`\n================== ✉️  SIMULATED EMAIL ✉️  ==================`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Content:\n${text || 'HTML Template'}`);
  console.log(`============================================================\n`);
  return { success: true, provider: 'simulated' };
};

// ─── Email Templates ───────────────────────────────────────────────

sendEmail.sendOtp = (user, otp) => sendEmail({
  to: user.email,
  subject: `🔑 Your DocHub Verification Code: ${otp}`,
  text: `Hello ${user.name},\n\nYour 6-digit password reset verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`,
  html: baseTemplate(`
    <h2 style="color: #1e40af; margin-top: 0;">Password Reset Code</h2>
    <p style="color: #475569;">Hello <strong>${user.name}</strong>,</p>
    <p style="color: #475569;">We received a request to reset your password. Use the verification code below to proceed:</p>
    <div style="text-align: center; margin: 28px 0;">
      <div style="display: inline-block; background: #eff6ff; border: 2px dashed #2563eb; color: #1e40af; font-size: 32px; font-weight: 800; letter-spacing: 8px; padding: 16px 32px; border-radius: 12px; font-family: monospace;">
        ${otp}
      </div>
    </div>
    <p style="color: #64748b; font-size: 13px; text-align: center;">This code will expire in <strong>10 minutes</strong>.</p>
    <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">If you didn't ask to reset your password, you can safely ignore this email.</p>
    <p style="color: #94a3b8; font-size: 13px;">– DocHub Healthcare Team</p>
  `),
});

sendEmail.appointmentBooked = (patient, dentist, appointment) => sendEmail({
  to: patient.email,
  subject: '✅ Appointment Confirmed – DocHub',
  html: baseTemplate(`
    <h2 style="color: #1e40af; margin-top: 0;">Appointment Confirmed!</h2>
    <p style="color: #475569;">Dear <strong>${patient.name}</strong>,</p>
    <p style="color: #475569;">Your appointment has been successfully booked. Here are the details:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr style="background: #f1f5f9;"><td style="padding: 10px 14px; font-weight: bold; color: #334155;">Doctor</td><td style="padding: 10px 14px; color: #475569;">Dr. ${dentist.name}</td></tr>
      <tr><td style="padding: 10px 14px; font-weight: bold; color: #334155;">Specialization</td><td style="padding: 10px 14px; color: #475569;">${dentist.specialization || 'General'}</td></tr>
      <tr style="background: #f1f5f9;"><td style="padding: 10px 14px; font-weight: bold; color: #334155;">Date</td><td style="padding: 10px 14px; color: #475569;">${new Date(appointment.date).toDateString()}</td></tr>
      <tr><td style="padding: 10px 14px; font-weight: bold; color: #334155;">Time</td><td style="padding: 10px 14px; color: #475569;">${appointment.timeSlot}</td></tr>
      <tr style="background: #f1f5f9;"><td style="padding: 10px 14px; font-weight: bold; color: #334155;">Treatment / Service</td><td style="padding: 10px 14px; color: #475569;">${appointment.treatmentType || 'Consultation'}</td></tr>
      <tr><td style="padding: 10px 14px; font-weight: bold; color: #334155;">Status</td><td style="padding: 10px 14px;"><span style="background: #dcfce7; color: #16a34a; padding: 3px 10px; border-radius: 999px; font-size: 13px;">Confirmed</span></td></tr>
    </table>
    <p style="color: #475569;">Please arrive 10 minutes early. For cancellations, log in to DocHub.</p>
    <p style="color: #94a3b8; font-size: 13px;">– DocHub Healthcare Team</p>
  `),
});

sendEmail.appointmentStatusChanged = (patient, appointment, newStatus) => sendEmail({
  to: patient.email,
  subject: `📋 Appointment ${newStatus} – DocHub`,
  html: baseTemplate(`
    <h2 style="color: #1e40af; margin-top: 0;">Appointment Update</h2>
    <p style="color: #475569;">Dear <strong>${patient.name}</strong>,</p>
    <p style="color: #475569;">Your appointment status has been updated:</p>
    <div style="background: #f1f5f9; border-left: 4px solid #2563eb; padding: 16px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0; color: #334155;"><strong>Date:</strong> ${new Date(appointment.date).toDateString()} at ${appointment.timeSlot}</p>
      <p style="margin: 8px 0 0; color: #334155;"><strong>Treatment / Service:</strong> ${appointment.treatmentType || 'Consultation'}</p>
      <p style="margin: 8px 0 0; color: #334155;"><strong>New Status:</strong>
        <span style="background: ${newStatus === 'Cancelled' ? '#fee2e2' : '#dcfce7'}; color: ${newStatus === 'Cancelled' ? '#dc2626' : '#16a34a'}; padding: 3px 10px; border-radius: 999px; font-size: 13px;">${newStatus}</span>
      </p>
    </div>
    <p style="color: #475569;">Log in to DocHub to view full details.</p>
    <p style="color: #94a3b8; font-size: 13px;">– DocHub Healthcare Team</p>
  `),
});

sendEmail.prescriptionCreated = (patient, dentist, prescription) => sendEmail({
  to: patient.email,
  subject: '💊 New Prescription – DocHub',
  html: baseTemplate(`
    <h2 style="color: #1e40af; margin-top: 0;">New Prescription Issued</h2>
    <p style="color: #475569;">Dear <strong>${patient.name}</strong>,</p>
    <p style="color: #475569;">Dr. <strong>${dentist.name}</strong> has issued you a new prescription.</p>
    <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <p style="margin: 0; color: #334155;"><strong>Diagnosis:</strong> ${prescription.diagnosis || 'N/A'}</p>
      <p style="margin: 8px 0 0; color: #334155;"><strong>Date:</strong> ${new Date(prescription.date || Date.now()).toDateString()}</p>
    </div>
    <h3 style="color: #334155;">Prescribed Medicines:</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr style="background: #2563eb; color: white;">
          <th style="padding: 8px 12px; text-align: left;">Medicine</th>
          <th style="padding: 8px 12px; text-align: left;">Dosage</th>
          <th style="padding: 8px 12px; text-align: left;">Frequency</th>
          <th style="padding: 8px 12px; text-align: left;">Duration</th>
        </tr>
      </thead>
      <tbody>
        ${(prescription.medicines || []).map((m, i) => `
          <tr style="background: ${i % 2 === 0 ? '#f8fafc' : 'white'};">
            <td style="padding: 8px 12px; color: #334155;">${m.name}</td>
            <td style="padding: 8px 12px; color: #475569;">${m.dosage}</td>
            <td style="padding: 8px 12px; color: #475569;">${m.frequency}</td>
            <td style="padding: 8px 12px; color: #475569;">${m.duration}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <p style="color: #475569; margin-top: 16px;">Log in to DocHub to view and print your full prescription.</p>
    <p style="color: #94a3b8; font-size: 13px;">– DocHub Healthcare Team</p>
  `),
});

sendEmail.inquiryReplied = (inquiry, replyMessage, adminName = 'DocHub Clinic Desk') => sendEmail({
  to: inquiry.email,
  subject: `💬 DocHub Clinic Response: Re: ${inquiry.subject || 'Your Inquiry'} [Ref: ${inquiry.referenceId}]`,
  text: `Dear ${inquiry.name},\n\nThank you for reaching out to DocHub Clinic. Here is our response regarding your inquiry (${inquiry.referenceId}):\n\n"${replyMessage}"\n\nOriginal Inquiry: "${inquiry.message}"\n\nIf you have any questions or would like to schedule a visit, feel free to contact us at +91 98765 43210.\n\nWarm regards,\n${adminName}\nDocHub Medical Clinic Mumbai`,
  html: baseTemplate(`
    <div style="margin-bottom: 20px;">
      <span style="background: #eff6ff; color: #1d4ed8; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #bfdbfe;">
        Inquiry Ref: ${inquiry.referenceId}
      </span>
      <h2 style="color: #0f172a; margin: 12px 0 4px; font-size: 20px;">Response to Your Medical Inquiry</h2>
      <p style="color: #64748b; font-size: 13px; margin: 0;">Topic: <strong style="color: #334155;">${inquiry.subject || 'General Consultation'}</strong></p>
    </div>

    <p style="color: #334155; font-size: 14px;">Dear <strong>${inquiry.name}</strong>,</p>
    <p style="color: #475569; font-size: 14px; line-height: 1.6;">
      Thank you for contacting <strong>DocHub Clinic</strong>. Our medical staff has reviewed your message:
    </p>

    <!-- Clinic Response Card -->
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 5px solid #16a34a; padding: 18px 20px; border-radius: 8px; margin: 20px 0;">
      <p style="color: #166534; font-size: 12px; font-weight: bold; text-transform: uppercase; margin: 0 0 6px;">
        Clinic Doctor & Staff Response
      </p>
      <p style="color: #14532d; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap;">
        ${replyMessage}
      </p>
    </div>

    <!-- Original Message Snippet -->
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
      <p style="color: #64748b; font-size: 11px; font-weight: bold; text-transform: uppercase; margin: 0 0 4px;">
        Your Original Message:
      </p>
      <p style="color: #475569; font-size: 13px; font-style: italic; margin: 0; line-height: 1.5;">
        "${inquiry.message}"
      </p>
    </div>

    <!-- Next Steps CTA -->
    <div style="text-align: center; margin: 28px 0 16px;">
      <p style="color: #475569; font-size: 13px; margin-bottom: 12px;">Need to book a confirmed doctor appointment?</p>
      <a href="http://localhost:5173/register" style="display: inline-block; background: #2563eb; color: white; text-decoration: none; font-size: 14px; font-weight: bold; padding: 10px 24px; border-radius: 8px;">
        Book Appointment Online
      </a>
    </div>

    <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px; font-size: 12px; color: #64748b; line-height: 1.5;">
      <p style="margin: 0;"><strong>DocHub Multi-Speciality Clinic</strong> • 102 Healthcare Plaza, Central Avenue, Mumbai</p>
      <p style="margin: 4px 0 0;">Appointments & Helpline: <strong>+91 98765 43210</strong> | Mon–Sat: 9 AM – 8 PM</p>
    </div>
  `),
});

sendEmail.inquiryResolved = (inquiry, resolutionNote = '', adminName = 'DocHub Clinic Desk') => sendEmail({
  to: inquiry.email,
  subject: `✅ Your Inquiry Has Been Resolved – DocHub [Ref: ${inquiry.referenceId}]`,
  text: `Dear ${inquiry.name},\n\nYour inquiry with DocHub Clinic (Ref: ${inquiry.referenceId} - ${inquiry.subject}) has been marked as Resolved.\n\n${resolutionNote ? `Resolution Note: ${resolutionNote}\n\n` : ''}If you have any further questions or would like to book an appointment, please feel free to reach out to us at +91 98765 43210.\n\nWarm regards,\n${adminName}\nDocHub Clinic`,
  html: baseTemplate(`
    <div style="margin-bottom: 20px;">
      <span style="background: #ecfdf5; color: #047857; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #a7f3d0;">
        Resolved • Ref: ${inquiry.referenceId}
      </span>
      <h2 style="color: #0f172a; margin: 12px 0 4px; font-size: 20px;">Inquiry Status: Resolved</h2>
      <p style="color: #64748b; font-size: 13px; margin: 0;">Topic: <strong style="color: #334155;">${inquiry.subject || 'General Consultation'}</strong></p>
    </div>

    <p style="color: #334155; font-size: 14px;">Dear <strong>${inquiry.name}</strong>,</p>
    <p style="color: #475569; font-size: 14px; line-height: 1.6;">
      This email is to confirm that your inquiry (<strong>${inquiry.referenceId}</strong>) has been processed and marked as <strong>Resolved</strong> by our clinic team.
    </p>

    ${resolutionNote ? `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 5px solid #2563eb; padding: 16px 18px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #1e40af; font-size: 12px; font-weight: bold; text-transform: uppercase; margin: 0 0 6px;">
          Resolution Note
        </p>
        <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0;">
          ${resolutionNote}
        </p>
      </div>
    ` : ''}

    <p style="color: #475569; font-size: 13px; line-height: 1.6;">
      If you need any further medical assistance, prescriptions, or want to consult with one of our specialists, our team is always ready to assist you.
    </p>

    <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px; font-size: 12px; color: #64748b; line-height: 1.5;">
      <p style="margin: 0;"><strong>DocHub Multi-Speciality Clinic</strong> • 102 Healthcare Plaza, Central Avenue, Mumbai</p>
      <p style="margin: 4px 0 0;">Appointments & Helpline: <strong>+91 98765 43210</strong></p>
    </div>
  `),
});

module.exports = sendEmail;

module.exports = sendEmail;
