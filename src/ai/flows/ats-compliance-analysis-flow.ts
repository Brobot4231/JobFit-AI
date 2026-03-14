'use server';
/**
 * @fileOverview This file implements a Genkit flow for analyzing a resume
 * against a job description for ATS (Applicant Tracking System) compliance.
 *
 * - atsComplianceAnalysis - A function that handles the ATS compliance analysis process.
 * - AtsComplianceAnalysisInput - The input type for the atsComplianceAnalysis function.
 * - AtsComplianceAnalysisOutput - The return type for the atsComplianceAnalysis function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AtsComplianceAnalysisInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "The resume content in PDF format, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  jobDescription: z
    .string()
    .describe('The text content of the job description.'),
});
export type AtsComplianceAnalysisInput = z.infer<
  typeof AtsComplianceAnalysisInputSchema
>;

const AtsComplianceAnalysisOutputSchema = z.object({
  atsScore: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe('Overall ATS compatibility score (0-100).'),
  keywordCompliance: z.object({
    missingKeywords: z
      .array(z.string())
      .describe(
        'Important keywords from the job description that are missing or underrepresented in the resume.'
      ),
    suggestedKeywords: z
      .array(z.string())
      .describe('Key skills, responsibilities, and qualifications extracted from the job description.'),
    keywordDensityAnalysis: z
      .string()
      .describe(
        'An analysis of keyword usage, highlighting optimal density and potential overstuffing.'
      ),
  }),
  formattingCompliance: z.object({
    issues: z
      .array(z.string())
      .describe(
        'List of potential formatting issues that might cause problems for ATS parsing (e.g., "Tables detected", "Unusual fonts", "Graphics used").'
      ),
    suggestions: z
      .array(z.string())
      .describe(
        'Actionable suggestions to improve formatting for ATS compatibility (e.g., "Convert tables to plain text", "Use standard sans-serif fonts like Arial or Calibri").'
      ),
  }),
  overallAnalysis: z
    .string()
    .describe(
      'A comprehensive summary of the ATS compliance, highlighting strengths, weaknesses, and actionable advice for improvement.'
    ),
});
export type AtsComplianceAnalysisOutput = z.infer<
  typeof AtsComplianceAnalysisOutputSchema
>;

export async function atsComplianceAnalysis(
  input: AtsComplianceAnalysisInput
): Promise<AtsComplianceAnalysisOutput> {
  return atsComplianceAnalysisFlow(input);
}

const atsComplianceAnalysisPrompt = ai.definePrompt({
  name: 'atsComplianceAnalysisPrompt',
  input: { schema: AtsComplianceAnalysisInputSchema },
  output: { schema: AtsComplianceAnalysisOutputSchema },
  prompt: `You are an expert Applicant Tracking System (ATS) compliance analyzer. Your task is to evaluate a given resume against a job description, focusing on two main areas: formatting compliance and keyword alignment.

1.  **Formatting Compliance**: Analyze the resume (provided as a data URI for a PDF) for elements that commonly cause issues for ATS, such as:
    *   Tables, graphics, images, or non-standard visual elements.
    *   Unusual or embedded fonts.
    *   Complex headers/footers or multi-column layouts that might confuse parsing.
    *   Use of text boxes or other non-standard text containers.
    *   Ensure the resume is easily parsable into plain text without losing critical information.
2.  **Keyword Alignment**: From the 'jobDescription', identify key skills, responsibilities, and qualifications. Then, cross-reference these keywords with the content of the 'resume'. Determine if important keywords are present and used appropriately. Provide an analysis of keyword density, suggesting if keywords are underused or overstuffed. List important keywords from the job description that are missing or poorly represented in the resume in 'missingKeywords'. List the important keywords extracted from the job description in 'suggestedKeywords'.
3.  **Overall ATS Score**: Provide a score between 0 and 100, where 100 is perfectly optimized for ATS.
4.  **Improvement Insights**: Provide actionable suggestions for improving both formatting and keyword usage to maximize ATS compatibility and recruiter impact. Detail formatting issues in 'formattingCompliance.issues' and solutions in 'formattingCompliance.suggestions'. Provide a comprehensive summary in 'overallAnalysis'.

Here is the job description and the resume for analysis:

Job Description:
{{{jobDescription}}}

Resume:
{{media url=resumeDataUri}}`,
});

const atsComplianceAnalysisFlow = ai.defineFlow(
  {
    name: 'atsComplianceAnalysisFlow',
    inputSchema: AtsComplianceAnalysisInputSchema,
    outputSchema: AtsComplianceAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await atsComplianceAnalysisPrompt(input);
    return output!;
  }
);
