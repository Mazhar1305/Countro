import nodemailer from "nodemailer"
import config from "../configs/config.js";

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: config.EMAIL_USER,
        clientId: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        refreshToken: config.GOOGLE_REFRESH_TOKEN,
    },
});

// Verify the connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Error connecting to email server:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});


// Function to send email
const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Countro" <${config.EMAIL_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            text, // plain text body
            html, // html body
        });

        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending email:', error);
    }
};


export default async function sendRegistrationEmail(userEmail, name,otp) {
    const subject = 'Welcome To Countro!';
    const text = `Hello ${name},\n\nThank you for registering at Countro. We're excited to have you on board!\n\nBest regards,\nThe Countro Team`;
    const html = `<p>Hello ${name},<br>Use This OTP For Verfication <b>${otp}</b><br></p></p><p>Thank you for registering at Countro. We're excited to have you on board!</p><p>Best regards,<br>TheCountro Team</p>`;

    await sendEmail(userEmail, subject, text, html);
}


