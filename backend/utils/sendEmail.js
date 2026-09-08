const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        // Ek 'transporter' banate hain jo Gmail ka use karega
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Email ka format tayyar karna
        const mailOptions = {
            from: `"Neuralite Platform" <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message
        };

        // Email bhej dena
        await transporter.sendMail(mailOptions);
        console.log("Email successfully sent to:", options.email);
    } catch (error) {
        console.error("Email bhejne mein error aayi:", error);
    }
};

module.exports = sendEmail;