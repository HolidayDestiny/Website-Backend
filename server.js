


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
    host: 'smtp.zoho.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
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

  // Required fields validation
  if (!firstName || !lastName || !email || !phone || !subject || !message) {
    return res.status(400).json({ error: 'Please fill all required fields.' });
  }

  // --- User Confirmation Email Template (with logo) ---
const userEmailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inquiry Received - Holiday Destiny</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; margin: 0; padding: 0; background-color: #f5f7fa; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); padding-bottom: 20px; }
        .header { background: #ffffff; text-align: center; padding: 20px 0; }
        .header img { max-width: 150px; height: auto; margin: 0 auto; }
        .content { padding: 30px; color: #333; line-height: 1.6; }
        .content h1 { font-size: 24px; color: #d32f2f; margin: 0 0 10px; }
        .content p { margin-bottom: 20px; font-size: 16px; }
        .btn { display: inline-block; padding: 12px 25px; background-color: #d32f2f; color: #ffffff !important; text-decoration: none; font-weight: bold; border-radius: 8px; text-align: center; }
        .footer { text-align: center; font-size: 12px; color: #888; padding: 20px; border-top: 1px solid #ddd; }
        .social-icons a { margin: 0 10px; text-decoration: none; color: #d32f2f; }
        .social-icons img { width: 24px; height: 24px; }
        .sub-message { font-size: 14px; color: #555; margin-top: 30px; }
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
            <h1>Thank you for your inquiry, ${firstName}!</h1>
            <p>We've received your message and are thrilled to help you plan your next perfect trip. Our team will review the details you provided and get back to you shortly.</p>
            <p class="sub-message">
                Ready to plan your next adventure? Our travel experts are here to help you find the best destinations and deals.
            </p>
        </div>
        <div class="footer">
            <p>309, Babukhan Mall, Somajiguda, Hyderabad 500016</p>
            <div class="social-icons">
                <a href="#"><img src="https://img.icons8.com/color/48/000000/facebook-new.png" alt="Facebook"></a>
                <a href="#"><img src="https://img.icons8.com/color/48/000000/twitter.png" alt="Twitter"></a>
                <a href="#"><img src="https://img.icons8.com/color/48/000000/linkedin.png" alt="LinkedIn"></a>
                <a href="#"><img src="https://img.icons8.com/color/48/000000/instagram-new.png" alt="Instagram"></a>
            </div>
            <p>&copy; ${new Date().getFullYear()} Holiday Destiny. All rights reserved.</p>
        </div>
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
    from: `"${firstName} ${lastName}" <${email}>`,
    to: process.env.RECEIVER_EMAIL, // Admin's email address
    subject: `New Contact Form Submission: ${subject}`,
    html: adminEmailHtml,
  };

  const userMailOptions = {
    from: `Holiday Destiny <${process.env.EMAIL_USER}>`, // Your company email
    to: email, // User's email address
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