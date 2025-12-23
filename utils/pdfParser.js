import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

/**
 * Extract text from PDF buffer
 * @param {Buffer} dataBuffer - PDF file buffer
 * @returns {Promise<string>} Extracted text
 */
export async function extractTextFromPDF(dataBuffer) {
  try {
    // pdf-parse is called as a function, not a constructor
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

