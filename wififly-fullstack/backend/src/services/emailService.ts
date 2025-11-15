import nodemailer from 'nodemailer';

let transporter: any;

async function initTransporter() {
  // If SMTP configured, use it; otherwise use test account
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Dev mode - create test account
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
}

export async function sendPersonalizedPlan(email: string, name: string) {
  try {
    if (!transporter) {
      await initTransporter();
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@wififly.local',
      to: email,
      subject: 'Your Personalized WiFi Improvement Plan',
      html: `
        <h1>Hello ${name},</h1>
        <p>Thank you for testing your WiFi with WiFiFly!</p>
        <p>Based on your results, here's your personalized improvement plan:</p>
        <ul>
          <li>Check for interference from nearby devices</li>
          <li>Consider your modem placement in central locations</li>
          <li>Update your router firmware for better performance</li>
          <li>Review your ISP plan for speed optimization options</li>
        </ul>
        <p>Best regards,<br/>The WiFiFly Team</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}
