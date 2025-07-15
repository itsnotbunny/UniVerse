const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your_email@gmail.com',       // Replace with your Gmail
    pass: 'your_app_password_here'      // Use App Password if 2FA enabled
  }
});

const sendMail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: '"Event Manager" <your_email@gmail.com>',
      to,
      subject,
      text
    });
    console.log(`📨 Email sent to ${to}`);
  } catch (err) {
    console.error('❌ Email error:', err.message);
  }
};

module.exports = sendMail;
