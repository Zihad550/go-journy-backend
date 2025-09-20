import PDFDocument from "pdfkit";

export interface IInvoiceData {
  transactionId: string;
  bookingDate: Date;
  userName: string;
  rideTitle: string;
  price: number;
  downloadLink: string;
}

export const generatePdf = async (
  invoiceData: IInvoiceData,
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const buffer: Uint8Array[] = [];

    doc.on("data", (chunk) => buffer.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffer)));
    doc.on("error", (err) => reject(err));

    // PDF Content
    doc.fontSize(20).text("Invoice", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Transaction ID: ${invoiceData.transactionId}`);
    doc.text(`Booking Date: ${invoiceData.bookingDate}`);
    doc.text(`Customer: ${invoiceData.userName}`);
    doc.moveDown();
    doc.text(`Ride Service: ${invoiceData.rideTitle}`);
    doc.text(`Price: $${invoiceData.price.toFixed(2)}`);
    doc.moveDown();
    doc.text("Thank you for using Go Journey!", { align: "center" });

    doc.end();
  });
};
