import Mailgun from 'mailgun-js';

const mailGunClient = new Mailgun({
    apiKey: process.env.MAILGUN_API_KEY || '',
    domain: process.env.MAILGUN_DOMAIN || ''
});

const sendEmail = (subject: string, html: string) => {
    const emailData = {
        from: "jorgealejandro2116@gmail.com",
        to: "jorgealejandro2116@gmail.com",
        subject,
        html
    }
    return mailGunClient.messages().send(emailData);
}

export const sendVerificationEmail = (fullName: string, key: string) => {
    const emailSubject = `Hello! ${fullName}, please verify your email`;
    const emailBody = `Verify your email by clicking <a href="https://uber.com/verification/${key}">Here</a>`;

    return sendEmail(emailSubject, emailBody);
}