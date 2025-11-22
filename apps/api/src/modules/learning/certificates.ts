import PDFDocument from "pdfkit";
import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";

type IssueCertificateParams = {
  userId: string;
  trainingId: string;
  enrollmentId?: string;
  score?: number;
};

export const issueCertificate = async ({ userId, trainingId, enrollmentId, score }: IssueCertificateParams) => {
  const [user, training, existingCertificate] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true, email: true },
    }),
    prisma.training.findUnique({
      where: { id: trainingId },
      select: { id: true, title: true, durationMinutes: true },
    }),
    prisma.certificate.findFirst({
      where: { userId, trainingId },
    }),
  ]);

  if (!user || !training) {
    throw new Error("Impossible de générer l'attestation (utilisateur ou formation introuvable).");
  }

  const trainingWithDetails = await prisma.training.findUnique({
    where: { id: trainingId },
    select: { id: true, title: true, durationMinutes: true, startDate: true, accreditation: true },
  });

  const pdfBuffer = await generateCertificatePdf({
    participant: `${user.firstName} ${user.lastName}`,
    trainingTitle: trainingWithDetails?.title || training.title,
    durationMinutes: trainingWithDetails?.durationMinutes || training.durationMinutes,
    score,
    trainingDate: trainingWithDetails?.startDate || undefined,
    accreditation: trainingWithDetails?.accreditation || false,
  });

  if (existingCertificate) {
    return {
      certificate: existingCertificate,
      pdfBuffer,
      user,
      training,
    };
  }

  const fileKey = `${userId}-${trainingId}-${Date.now()}.pdf`;
  const fileUrl = env.storageUrl ? `${env.storageUrl}/${fileKey}${env.storageSas ?? ""}` : `${env.frontendUrl}/certificates/${fileKey}`;

  const certificate = await prisma.certificate.create({
    data: {
      userId,
      trainingId,
      enrollmentId,
      fileUrl,
    },
  });

  return {
    certificate,
    pdfBuffer,
    user,
    training,
  };
};

const generateCertificatePdf = async ({
  participant,
  trainingTitle,
  durationMinutes,
  score,
  trainingDate,
  accreditation,
}: {
  participant: string;
  trainingTitle: string;
  durationMinutes: number;
  score?: number;
  trainingDate?: Date;
  accreditation?: boolean;
}) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks: Buffer[] = [];

  // En-tête avec logo (si disponible)
  doc.fontSize(24).fillColor("#2563eb").text("SOINS+", { align: "center" });
  doc.fontSize(18).fillColor("#000000").text("Attestation de formation", { align: "center" });
  doc.moveDown(2);

  // Informations principales
  doc.fontSize(16).fillColor("#1e293b").text("Certificat de participation", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).fillColor("#000000");
  doc.text("Nous certifions que", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(18).fillColor("#2563eb").text(participant, { align: "center", underline: true });
  doc.moveDown();
  doc.fontSize(12).fillColor("#000000");
  doc.text("a suivi avec succès la formation", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(16).fillColor("#1e293b").text(trainingTitle, { align: "center" });
  doc.moveDown(2);

  // Détails
  doc.fontSize(11).fillColor("#475569");
  const detailsY = doc.y;
  doc.text("Détails de la formation:", 50, detailsY);
  doc.text(`• Durée : ${durationMinutes} minutes`, 70, detailsY + 20);
  if (trainingDate) {
    doc.text(`• Date : ${new Date(trainingDate).toLocaleDateString("fr-BE", { day: "numeric", month: "long", year: "numeric" })}`, 70, detailsY + 40);
  }
  if (typeof score === "number") {
    doc.text(`• Score obtenu : ${score}%`, 70, detailsY + 60);
  }
  if (accreditation) {
    doc.text("• Formation accréditée", 70, detailsY + (typeof score === "number" ? 80 : 60));
  }

  // Date d'émission
  doc.moveDown(3);
  const issueDate = new Date().toLocaleDateString("fr-BE", { day: "numeric", month: "long", year: "numeric" });
  doc.fontSize(10).fillColor("#64748b").text(`Date d'émission : ${issueDate}`, { align: "center" });

  // Signature
  doc.moveDown(2);
  doc.fontSize(10).fillColor("#64748b").text("Cette attestation est générée automatiquement depuis la plateforme SOINS+.", {
    align: "center",
  });

  doc.end();

  return await new Promise<Buffer>((resolve) => {
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
};

