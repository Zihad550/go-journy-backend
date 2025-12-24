import path from "node:path";
import ejs from "ejs";
import nodemailer from "nodemailer";
import env from "../../env";
import AppError from "../errors/app-error";

const transporter = nodemailer.createTransport({
	// port: envVars.EMAIL_SENDER.SMTP_PORT,
	secure: true,
	auth: {
		user: env.EMAIL_SENDER.SMTP_USER,
		pass: env.EMAIL_SENDER.SMTP_PASS,
	},
	port: Number(env.EMAIL_SENDER.SMTP_PORT),
	host: env.EMAIL_SENDER.SMTP_HOST,
});

interface SendEmailOptions {
	to: string;
	subject: string;
	templateName: string;
	templateData?: Record<string, any>;
	attachments?: {
		filename: string;
		content: Buffer | string;
		contentType: string;
	}[];
}

export async function sendEmail({
	to,
	subject,
	templateName,
	templateData,
	attachments,
}: SendEmailOptions) {
	try {
		const templatePath = path.join(__dirname, `templates/${templateName}.ejs`);
		const html = await ejs.renderFile(templatePath, templateData);
		const info = await transporter.sendMail({
			from: env.EMAIL_SENDER.SMTP_FROM,
			to: to,
			subject: subject,
			html: html,
			attachments: attachments?.map((attachment) => ({
				filename: attachment.filename,
				content: attachment.content,
				contentType: attachment.contentType,
			})),
		});
		console.log(`\u2709\uFE0F Email sent to ${to}: ${info.messageId}`);
	} catch (error: any) {
		console.log("email sending error", error.message);
		throw new AppError(401, "Email error");
	}
}
