import Postmark from "postmark";
import nodemailer from "nodemailer";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";

const FROM_EMAIL = "no-reply@soins-plus.com";

/**
 * Récupère la configuration email depuis la base de données
 */
async function getEmailConfig() {
  const configs = await prisma.appConfig.findMany({
    where: {
      key: {
        in: ["POSTMARK_TOKEN", "MAILTRAP_USER", "MAILTRAP_PASS"],
      },
    },
  });

  const configMap = new Map(configs.map((c) => [c.key, c.value || ""]));

  return {
    postmarkToken: configMap.get("POSTMARK_TOKEN") || env.postmarkToken,
    mailtrapUser: configMap.get("MAILTRAP_USER") || process.env.MAILTRAP_USER || "",
    mailtrapPass: configMap.get("MAILTRAP_PASS") || process.env.MAILTRAP_PASS || "",
  };
}

/**
 * Détermine si on utilise Mailtrap (dev) ou Postmark (prod)
 */
function shouldUseMailtrap(emailConfig: { mailtrapUser: string; mailtrapPass: string }): boolean {
  // Utiliser Mailtrap si on est en dev ET que Mailtrap est configuré
  return env.nodeEnv === "development" && !!(emailConfig.mailtrapUser && emailConfig.mailtrapPass);
}

/**
 * Crée un transporteur Mailtrap
 */
function getMailtrapTransporter(user: string, pass: string) {
  return nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Templates HTML simples pour Mailtrap (dev)
 */
const emailTemplates = {
  welcome: (firstName: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4DB5A6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Bienvenue sur SOINS+</h1>
        </div>
        <div class="content">
          <p>Bonjour ${firstName},</p>
          <p>Bienvenue sur SOINS+ ! Nous sommes ravis de vous compter parmi nous.</p>
          <p>Vous pouvez maintenant accéder à toutes nos formations continues accréditées.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} SOINS+ — Formations continues accréditées</p>
        </div>
      </div>
    </body>
    </html>
  `,
  passwordReset: (resetLink: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4DB5A6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #4DB5A6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Réinitialisation de mot de passe</h1>
        </div>
        <div class="content">
          <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
          <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
          <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
          <p>Ce lien est valide pendant 1 heure.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} SOINS+ — Formations continues accréditées</p>
        </div>
      </div>
    </body>
    </html>
  `,
  enrollmentConfirmation: (trainingTitle: string, date?: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4DB5A6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Inscription confirmée</h1>
        </div>
        <div class="content">
          <p>Votre inscription à la formation <strong>${trainingTitle}</strong> a été confirmée.</p>
          <p>Date : ${date || "À planifier"}</p>
          <p>Vous recevrez un rappel avant le début de la formation.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} SOINS+ — Formations continues accréditées</p>
        </div>
      </div>
    </body>
    </html>
  `,
  trainingReminder: (trainingTitle: string, date: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4DB5A6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Rappel de formation</h1>
        </div>
        <div class="content">
          <p>Rappel : votre formation <strong>${trainingTitle}</strong> aura lieu le ${date}.</p>
          <p>Nous vous attendons !</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} SOINS+ — Formations continues accréditées</p>
        </div>
      </div>
    </body>
    </html>
  `,
  certificateIssued: (trainingTitle: string, certificateUrl: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4DB5A6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #4DB5A6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Certificat disponible</h1>
        </div>
        <div class="content">
          <p>Félicitations ! Vous avez complété la formation <strong>${trainingTitle}</strong>.</p>
          <p>Votre certificat est maintenant disponible :</p>
          <a href="${certificateUrl}" class="button">Télécharger mon certificat</a>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} SOINS+ — Formations continues accréditées</p>
        </div>
      </div>
    </body>
    </html>
  `,
  subscriptionRenewed: (firstName: string, amount: number, nextBillingDate: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4DB5A6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Abonnement renouvelé</h1>
        </div>
        <div class="content">
          <p>Bonjour ${firstName},</p>
          <p>Votre abonnement SOINS+ a été renouvelé avec succès.</p>
          <p>Montant : ${amount.toFixed(2)} €</p>
          <p>Prochain paiement : ${nextBillingDate}</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} SOINS+ — Formations continues accréditées</p>
        </div>
      </div>
    </body>
    </html>
  `,
  subscriptionRenewalReminder: (firstName: string, renewalDate: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4DB5A6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Rappel de renouvellement</h1>
        </div>
        <div class="content">
          <p>Bonjour ${firstName},</p>
          <p>Votre abonnement SOINS+ sera renouvelé le ${renewalDate}.</p>
          <p>Si vous souhaitez modifier ou annuler votre abonnement, connectez-vous à votre compte.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} SOINS+ — Formations continues accréditées</p>
        </div>
      </div>
    </body>
    </html>
  `,
  paymentFailed: (firstName: string, retryDate?: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #4DB5A6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Échec du paiement</h1>
        </div>
        <div class="content">
          <p>Bonjour ${firstName},</p>
          <p>Le paiement de votre abonnement SOINS+ a échoué.</p>
          ${retryDate ? `<p>Une nouvelle tentative sera effectuée le ${retryDate}.</p>` : ""}
          <p>Veuillez mettre à jour votre méthode de paiement dans votre compte.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} SOINS+ — Formations continues accréditées</p>
        </div>
      </div>
    </body>
    </html>
  `,
};

/**
 * Envoie un email via Postmark ou Mailtrap selon l'environnement
 */
async function sendEmailViaService(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const emailConfig = await getEmailConfig();

  if (shouldUseMailtrap(emailConfig)) {
    // Utiliser Mailtrap en développement
    const transporter = getMailtrapTransporter(emailConfig.mailtrapUser, emailConfig.mailtrapPass);
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text || params.html.replace(/<[^>]*>/g, ""),
    });
    console.log(`📧 Email envoyé via Mailtrap à ${params.to}`);
  } else if (emailConfig.postmarkToken) {
    // Utiliser Postmark en production
    const postmarkClient = new Postmark.ServerClient(emailConfig.postmarkToken);
    await postmarkClient.sendEmail({
      From: FROM_EMAIL,
      To: params.to,
      Subject: params.subject,
      HtmlBody: params.html,
      TextBody: params.text || params.html.replace(/<[^>]*>/g, ""),
    });
    console.log(`📧 Email envoyé via Postmark à ${params.to}`);
  } else {
    console.warn("Aucun service email configuré, email non envoyé:", params.to);
  }
}

export const sendEnrollmentConfirmation = async (params: {
  email: string;
  trainingTitle: string;
  date?: string;
}) => {
  const emailConfig = await getEmailConfig();

  if (shouldUseMailtrap(emailConfig)) {
    // Mailtrap avec template HTML
    await sendEmailViaService({
      to: params.email,
      subject: "Inscription confirmée - SOINS+",
      html: emailTemplates.enrollmentConfirmation(params.trainingTitle, params.date),
    });
  } else if (emailConfig.postmarkToken) {
    // Postmark avec template
    const postmarkClient = new Postmark.ServerClient(emailConfig.postmarkToken);
    await postmarkClient.sendEmailWithTemplate({
      From: FROM_EMAIL,
      To: params.email,
      TemplateAlias: "training-enrollment",
      TemplateModel: {
        training_title: params.trainingTitle,
        training_date: params.date ?? "A planifier",
      },
    } as any);
  } else {
    console.warn("Aucun service email configuré, email non envoyé:", params.email);
  }
};

export const sendReminderEmail = async (params: {
  email: string;
  trainingTitle: string;
  date: string;
}) => {
  const emailConfig = await getEmailConfig();

  if (shouldUseMailtrap(emailConfig)) {
    await sendEmailViaService({
      to: params.email,
      subject: "Rappel de formation - SOINS+",
      html: emailTemplates.trainingReminder(params.trainingTitle, params.date),
    });
  } else if (emailConfig.postmarkToken) {
    const postmarkClient = new Postmark.ServerClient(emailConfig.postmarkToken);
    await postmarkClient.sendEmailWithTemplate({
      From: FROM_EMAIL,
      To: params.email,
      TemplateAlias: "training-reminder",
      TemplateModel: {
        training_title: params.trainingTitle,
        training_date: params.date,
      },
    } as any);
  } else {
    console.warn("Aucun service email configuré, email non envoyé:", params.email);
  }
};

export const sendPasswordResetEmail = async (params: { email: string; resetLink: string }) => {
  const emailConfig = await getEmailConfig();

  if (shouldUseMailtrap(emailConfig)) {
    await sendEmailViaService({
      to: params.email,
      subject: "Réinitialisation de mot de passe - SOINS+",
      html: emailTemplates.passwordReset(params.resetLink),
    });
  } else if (emailConfig.postmarkToken) {
    const postmarkClient = new Postmark.ServerClient(emailConfig.postmarkToken);
    await postmarkClient.sendEmailWithTemplate({
      From: FROM_EMAIL,
      To: params.email,
      TemplateAlias: "password-reset",
      TemplateModel: {
        reset_link: params.resetLink,
      },
    } as any);
  } else {
    console.warn("Aucun service email configuré, email non envoyé:", params.email);
  }
};

export const sendCertificateIssuedEmail = async (params: {
  email: string;
  trainingTitle: string;
  certificateUrl: string;
}) => {
  const emailConfig = await getEmailConfig();

  if (shouldUseMailtrap(emailConfig)) {
    await sendEmailViaService({
      to: params.email,
      subject: "Certificat disponible - SOINS+",
      html: emailTemplates.certificateIssued(params.trainingTitle, params.certificateUrl),
    });
  } else if (emailConfig.postmarkToken) {
    const postmarkClient = new Postmark.ServerClient(emailConfig.postmarkToken);
    await postmarkClient.sendEmailWithTemplate({
      From: FROM_EMAIL,
      To: params.email,
      TemplateAlias: "certificate-issued",
      TemplateModel: {
        training_title: params.trainingTitle,
        certificate_url: params.certificateUrl,
      },
    } as any);
  } else {
    console.warn("Aucun service email configuré, email non envoyé:", params.email);
  }
};

export const sendWelcomeEmail = async (params: { email: string; firstName: string }) => {
  const emailConfig = await getEmailConfig();

  if (shouldUseMailtrap(emailConfig)) {
    await sendEmailViaService({
      to: params.email,
      subject: "Bienvenue sur SOINS+",
      html: emailTemplates.welcome(params.firstName),
    });
  } else if (emailConfig.postmarkToken) {
    const postmarkClient = new Postmark.ServerClient(emailConfig.postmarkToken);
    await postmarkClient.sendEmailWithTemplate({
      From: FROM_EMAIL,
      To: params.email,
      TemplateAlias: "welcome",
      TemplateModel: {
        first_name: params.firstName,
      },
    } as any);
  } else {
    console.warn("Aucun service email configuré, email non envoyé:", params.email);
  }
};

export const sendSubscriptionRenewalReminder = async (params: {
  email: string;
  firstName: string;
  renewalDate: string;
}) => {
  const emailConfig = await getEmailConfig();

  if (shouldUseMailtrap(emailConfig)) {
    await sendEmailViaService({
      to: params.email,
      subject: "Rappel de renouvellement - SOINS+",
      html: emailTemplates.subscriptionRenewalReminder(params.firstName, params.renewalDate),
    });
  } else if (emailConfig.postmarkToken) {
    const postmarkClient = new Postmark.ServerClient(emailConfig.postmarkToken);
    await postmarkClient.sendEmailWithTemplate({
      From: FROM_EMAIL,
      To: params.email,
      TemplateAlias: "subscription-renewal-reminder",
      TemplateModel: {
        first_name: params.firstName,
        renewal_date: params.renewalDate,
      },
    } as any);
  } else {
    console.warn("Aucun service email configuré, email non envoyé:", params.email);
  }
};

export const sendSubscriptionRenewed = async (params: {
  email: string;
  firstName: string;
  amount: number;
  nextBillingDate: string;
}) => {
  const emailConfig = await getEmailConfig();

  if (shouldUseMailtrap(emailConfig)) {
    await sendEmailViaService({
      to: params.email,
      subject: "Abonnement renouvelé - SOINS+",
      html: emailTemplates.subscriptionRenewed(params.firstName, params.amount, params.nextBillingDate),
    });
  } else if (emailConfig.postmarkToken) {
    const postmarkClient = new Postmark.ServerClient(emailConfig.postmarkToken);
    await postmarkClient.sendEmailWithTemplate({
      From: FROM_EMAIL,
      To: params.email,
      TemplateAlias: "subscription-renewed",
      TemplateModel: {
        first_name: params.firstName,
        amount: params.amount,
        next_billing_date: params.nextBillingDate,
      },
    } as any);
  } else {
    console.warn("Aucun service email configuré, email non envoyé:", params.email);
  }
};

export const sendPaymentFailed = async (params: {
  email: string;
  firstName: string;
  retryDate?: string;
}) => {
  const emailConfig = await getEmailConfig();

  if (shouldUseMailtrap(emailConfig)) {
    await sendEmailViaService({
      to: params.email,
      subject: "Échec du paiement - SOINS+",
      html: emailTemplates.paymentFailed(params.firstName, params.retryDate),
    });
  } else if (emailConfig.postmarkToken) {
    const postmarkClient = new Postmark.ServerClient(emailConfig.postmarkToken);
    await postmarkClient.sendEmailWithTemplate({
      From: FROM_EMAIL,
      To: params.email,
      TemplateAlias: "payment-failed",
      TemplateModel: {
        first_name: params.firstName,
        retry_date: params.retryDate,
      },
    } as any);
  } else {
    console.warn("Aucun service email configuré, email non envoyé:", params.email);
  }
};
