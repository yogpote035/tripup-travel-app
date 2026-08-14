const nodemailer = require("nodemailer");

function buildTransportOptions() {
    const host = process.env.MAIL_HOST;
    const port = Number(process.env.MAIL_PORT || 587);
    const secure = process.env.MAIL_SECURE === "true";
    const service = process.env.MAIL_SERVICE || undefined;

    const config = {};

    // Only include auth when both user and pass are provided
    if (process.env.MAIL_USER && process.env.MAIL_PASS) {
        config.auth = { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS };
    }

    if (service) config.service = service;
    if (host) {
        config.host = host;
        config.port = port;
        config.secure = secure;
    }

    return config;
}

function createTransporter() {
    const options = buildTransportOptions();
    // If auth not provided, allow unauthenticated SMTP only when explicitly enabled
    if ((!options?.auth || !options.auth.user || !options.auth.pass) && process.env.MAIL_ALLOW_NO_AUTH !== 'true') {
        throw new Error("Missing MAIL_USER or MAIL_PASS environment configuration for email delivery. Set MAIL_ALLOW_NO_AUTH=true for unauthenticated local SMTP (dev only). Or set MAIL_DISABLE=true to skip sending in development.");
    }
    return nodemailer.createTransport(options);
}

async function sendMail({ to, bcc, subject, text, html, from }) {
    if (process.env.MAIL_DISABLE === 'true') {
        console.info('MAIL_DISABLE=true — skipping email send', { to, bcc, subject });
        return Promise.resolve({ skipped: true });
    }
    const transporter = createTransporter();
    const mailOptions = {
        from: from || process.env.MAIL_FROM || process.env.MAIL_USER,
        to,
        bcc,
        subject,
        text,
        html,
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.info('Email sent', { subject, messageId: info.messageId, accepted: info.accepted, rejected: info.rejected });
        return info;
    } catch (err) {
        console.error('sendMail error', err);
        throw err;
    }
}

function buildAnnouncementEmail(title, message) {
    const safeMessage = String(message || "").trim().replace(/\n/g, "<br />");
    return {
        subject: title,
        text: `${title}\n\n${message}`,
        html: `
      <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.6; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden;">
          <div style="background: #fb923c; padding: 20px; color: #ffffff; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">${title}</h1>
          </div>
          <div style="padding: 24px; color: #334155;">
            <p style="margin: 0 0 16px;">${safeMessage}</p>
            <p style="margin: 0; color: #64748b; font-size: 14px;">This announcement was sent by TripUp.</p>
          </div>
        </div>
      </div>
    `,
    };
}

function buildPasswordResetEmail(resetLink) {
    return {
        subject: "TripUp password reset",
        text: `Hello,\n\nWe received a request to reset your TripUp password. Use the link below to continue:\n\n${resetLink}\n\nIf you did not request this, you can safely ignore this email.`,
        html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden;">
          <div style="background: #fb923c; padding: 20px; color: #fff; text-align: center;">
            <h2 style="margin: 0;">TripUp password reset</h2>
          </div>
          <div style="padding: 24px; color: #334155;">
            <p>We received a request to reset your TripUp password.</p>
            <p>
              <a href="${resetLink}" style="display: inline-block; padding: 12px 18px; background: #fb923c; color: white; text-decoration: none; border-radius: 8px;">Reset password</a>
            </p>
            <p>If you did not request this, you can safely ignore this email.</p>
          </div>
        </div>
      </div>
    `,
    };
}

module.exports = {
    sendMail,
    buildAnnouncementEmail,
    buildPasswordResetEmail,
};
