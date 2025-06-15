const axios = require('axios');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { geminiService } = require('./gemini.service.js');

/**
 * Fetches the file from Cloudinary, parses its text content.
 */
const extractTextFromFile = async (fileObject) => {
    console.log('[DEBUG] 2. Entering extractTextFromFile...');
    try {
        console.log(`[DEBUG] 3. Downloading file from Cloudinary URL: ${fileObject.path}`);
        const response = await axios.get(fileObject.path, {
            responseType: 'arraybuffer'
        });
        console.log(`[DEBUG] 4. File downloaded successfully. MimeType: ${fileObject.mimetype}`);

        if (fileObject.mimetype === 'application/pdf') {
            console.log('[DEBUG] 5a. Parsing PDF file...');
            const data = await pdf(response.data);
            console.log('[DEBUG] 6a. PDF parsed. Extracted text length:', data.text.length);
            return data.text;
        } else if (fileObject.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            console.log('[DEBUG] 5b. Parsing DOCX file...');
            const { value } = await mammoth.extractRawText({ buffer: response.data });
            console.log('[DEBUG] 6b. DOCX parsed. Extracted text length:', value.length);
            return value;
        } else {
            throw new Error(`Unsupported file type: ${fileObject.mimetype}. Please upload a PDF or DOCX file.`);
        }
    } catch (error) {
        console.error('--- DETAILED ERROR in extractTextFromFile ---');
        console.error(error);
        console.error('-------------------------------------------');
        throw new Error('Could not read the content of the uploaded file.');
    }
};

/**
 * Main function to orchestrate the resume analysis.
 */
const analyzeResumeAndGenerateReport = async (fileObject) => {
    console.log('[DEBUG] 1. Entering analyzeResumeAndGenerateReport...');
    const resumeText = await extractTextFromFile(fileObject);

    if (!resumeText || resumeText.trim().length < 50) {
        throw new Error('Could not extract sufficient text from the resume to analyze.');
    }

    console.log('[DEBUG] 7. Calling Gemini service to generate analysis...');
    const report = await geminiService.generateResumeAnalysis(resumeText);
    console.log('[DEBUG] 8. Report received from Gemini.');
    
    return report;
};

module.exports = {
    analyzeResumeAndGenerateReport
};
