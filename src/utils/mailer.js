const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  },
  tls: { rejectUnauthorized: false }
});


// Verify connection when server starts
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Mailer connection failed:", error.message);
  } else {
    console.log("📧 Mailer ready — connected to Gmail SMTP");
  }
});

module.exports = transporter;
