const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const LOG_TAG = "(interviewPdf.service)=>";

async function generateInterviewPdf(
  interviewData,
  targetRole,
  companyType,
  experienceLevel,
  companyName
) {
  try {
    console.debug(
      LOG_TAG,
      "Entered into generateInterviewPdf: " + new Date().toISOString()
    );

    // Create folder if not exists
    const folderPath = path.join(__dirname, "../../uploads/interviews");

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Unique file name
    const fileName = `InterviewGuide-${Date.now()}.pdf`;
    const filePath = path.join(folderPath, fileName);

    // Create PDF
    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ==========================
    // Heading
    // ==========================

    doc
      .fontSize(22)
      .text("ZYORO AI", {
        align: "center",
      });

    doc.moveDown();

    doc
      .fontSize(18)
      .text("AI Interview Preparation Guide", {
        align: "center",
      });

    doc.moveDown(2);

    // ==========================
    // Candidate Details
    // ==========================

    doc.fontSize(12);

    doc.text(`Target Role : ${targetRole}`);
    doc.text(`Experience : ${experienceLevel}`);
    doc.text(`Company Type : ${companyType}`);
    doc.text(`Company : ${companyName || "Not Provided"}`);

    doc.moveDown();

    doc.text(
      "------------------------------------------------------------"
    );

    doc.moveDown();

    // ==========================
    // Questions
    // ==========================

    interviewData.questions.forEach((item) => {
      doc
        .fontSize(14)
        .text(`Question ${item.questionNumber}`, {
          underline: true,
        });

      doc.moveDown(0.5);

      doc.fontSize(12).text(item.question);

      doc.moveDown();

      doc
        .fontSize(12)
        .text("Expected Answer:", {
          underline: true,
        });

      doc.moveDown(0.5);

      doc.fontSize(11).text(item.expectedAnswer);

      doc.moveDown();

      doc.text(
        "------------------------------------------------------------"
      );

      doc.moveDown();
    });

    // Finish PDF
    doc.end();

    // Wait until PDF is fully written
    return new Promise((resolve, reject) => {
      stream.on("finish", () => {
        console.debug(LOG_TAG, "PDF generated successfully");
        resolve(filePath);
      });

      stream.on("error", (err) => {
        reject(err);
      });
    });

  } catch (err) {
    console.error(LOG_TAG, err);
    throw err;
  }
}

module.exports = {
  generateInterviewPdf,
};