import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

/**
 * Extract text from PDF buffer
 * @param {Buffer} dataBuffer - PDF file buffer
 * @returns {Promise<string>} Extracted text
 */
export async function extractTextFromPDF(dataBuffer) {
  try {
    // Create parser instance with options
    const parser = new PDFParse({
      data: dataBuffer,
      verbosity: 0 // Suppress console output
    });
    
    // Get text content
    const textResult = await parser.getText();
    return textResult.text;
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

