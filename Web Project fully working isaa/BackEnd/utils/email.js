const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendEmail(to, subject, text, html) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html
    };
    console.log('MailOptions before sending:', mailOptions);
    return transporter.sendMail(mailOptions);
}

module.exports = { sendEmail }; 