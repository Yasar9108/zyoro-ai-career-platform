const pdf = require("pdf-parse");
const fs = require("fs");

const LOG_TAG = "(pdf.service)=>";

async function extractText(filePath) {
    try {
        console.debug(LOG_TAG, "Reading PDF: " + filePath);

        const fileBuffer = fs.readFileSync(filePath);

        const pdfData = await pdf(fileBuffer);

        if (!pdfData.text || pdfData.text.trim().length === 0) {
            throw new Error("No readable text found in PDF");
        }

        console.debug(LOG_TAG, "PDF text extracted successfully");

        return pdfData.text;

    } catch (err) {
        console.error(LOG_TAG, err);
        throw err;
    }
}

module.exports = {
    extractText
};