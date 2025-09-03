
require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.in', // or 'smtp.zoho.com' if your account is global
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // must be Zoho App Password
    }
});

// Contact form route
app.post('/api/contact', async (req, res) => {
  const { 
    firstName, 
    lastName, 
    email, 
    phone, 
    subject, 
    message, 
    travelType, 
    travelDate, 
    numberOfTravelers 
  } = req.body;

  if (!firstName || !lastName || !email || !phone || !subject || !message) {
    return res.status(400).json({ error: 'Please fill all required fields.' });
  }

  // --- userEmailHtml + adminEmailHtml stay the same ---
    // --- User Confirmation Email Template (with logo) ---
// --- User Confirmation Email Template (simplified, no images/icons) ---
const userEmailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inquiry Received - Holiday Destiny</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0;">
    <h2 style="color: #d32f2f; text-align: center;">Holiday Destiny</h2>
    <p>Dear ${firstName},</p>
    <p>Thank you for contacting <strong>Holiday Destiny</strong>. We have received your inquiry and our team will review your details shortly.</p>
    <p>One of our travel specialists will get in touch with you soon to assist with your request.</p>
    <p style="margin-top: 30px;">Best regards,<br>Holiday Destiny Team</p>
    <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
    <p style="font-size: 12px; color: #777;">This is an automated message. Please do not reply to this email.</p>
  </div>
</body>
</html>
`;

  
  // --- Admin Notification Email Template (with logo) ---
const adminEmailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Website Inquiry</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; margin: 0; padding: 0; background-color: #f5f7fa; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); padding-bottom: 20px; }
        .header { background: #ffffff; text-align: center; padding: 20px 0; }
        .header img { max-width: 150px; height: auto; margin: 0 auto; }
        .content { padding: 30px; color: #333; line-height: 1.6; }
        .content h1 { font-size: 24px; color: #d32f2f; margin: 0 0 20px; text-align: center; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
        .info-table td { padding: 12px; border-bottom: 1px solid #eee; font-size: 15px; }
        .info-table td.label { font-weight: bold; color: #555; width: 35%; }
        .message-box { background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #ddd; margin-bottom: 30px; }
        .message-box h3 { margin-top: 0; color: #d32f2f; }
        .message-box p { margin: 0; line-height: 1.6; }
        .btn { display: block; width: fit-content; padding: 14px 30px; background-color: #d32f2f; color: #fff; text-decoration: none; font-weight: bold; border-radius: 8px; margin: 0 auto; text-align: center; }
        .footer { text-align: center; font-size: 12px; color: #888; padding: 20px; border-top: 1px solid #ddd; }
        @media (max-width: 600px) {
            .container { width: 95%; }
            .content { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://holiday-destiny.vercel.app/static/media/HolidayLogo.2ba0fddd792f7a928dad.png" alt="Holiday Destiny Logo">
        </div>
        <div class="content">
            <h1>New Inquiry from ${firstName} ${lastName}</h1>
            <table class="info-table">
                <tr><td class="label">Email</td><td>${email}</td></tr>
                <tr><td class="label">Phone</td><td>${phone}</td></tr>
                <tr><td class="label">Subject</td><td>${subject}</td></tr>
                <tr><td class="label">Travel Type</td><td>${travelType || 'N/A'}</td></tr>
                <tr><td class="label">Travel Date</td><td>${travelDate || 'N/A'}</td></tr>
                <tr><td class="label">Travelers</td><td>${numberOfTravelers || 'N/A'}</td></tr>
            </table>
            <h3>Message:</h3>
            <div class="message-box">
                <p>${message}</p>
            </div>
            <a href="mailto:${email}" class="btn">Reply to User</a>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Holiday Destiny. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

  const adminMailOptions = {
    from: `Holiday Destiny <${process.env.EMAIL_USER}>`, // ✅ Always your Zoho email
    to: process.env.RECEIVER_EMAIL,
    subject: `New Contact Form Submission: ${subject}`,
    html: adminEmailHtml,
    replyTo: email // ✅ replies go to the user
  };

  const userMailOptions = {
    from: `Holiday Destiny <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `We've Received Your Inquiry!`,
    html: userEmailHtml,
  };

  try {
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);
    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
