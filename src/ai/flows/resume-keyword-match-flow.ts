'use server';
/**
 * @fileOverview This file implements a Genkit flow for analyzing keyword matching between a resume and a job description.
 *
 * - resumeKeywordMatch - A function that compares keywords in a resume against a job description.
 * - ResumeKeywordMatchInput - The input type for the resumeKeywordMatch function.
 * - ResumeKeywordMatchOutput - The return type for the resumeKeywordMatch function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ResumeKeywordMatchInputSchema = z.object({
  resumeText: z.string().describe('The plain text content of the resume.'),
  jobDescriptionText: z.string().describe('The plain text content of the job description.'),
});
export type ResumeKeywordMatchInput = z.infer<typeof ResumeKeywordMatchInputSchema>;

const ResumeKeywordMatchOutputSchema = z.object({
  keywordMatchScore: z
    .number()
    .describe('A numerical score (0-100) indicating the overall keyword relevance.'),
  missingKeywords: z
    .array(z.string())
    .describe('A list of important keywords from the job description not found in the resume.'),
  foundKeywords: z
    .array(z.string())
    .describe('A list of important keywords found in both the resume and the job description.'),
  keywordDensityAnalysis: z
    .string()
    .describe('A text analysis of keyword density, identifying optimal usage and overstuffing.'),
  suggestions: z
    .array(z.string())
    .describe('Actionable suggestions to improve keyword matching and relevance.'),
});
export type ResumeKeywordMatchOutput = z.infer<typeof ResumeKeywordMatchOutputSchema>;

export async function resumeKeywordMatch(
  input: ResumeKeywordMatchInput
): Promise<ResumeKeywordMatchOutput> {
  return resumeKeywordMatchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'resumeKeywordMatchPrompt',
  input: { schema: ResumeKeywordMatchInputSchema },
  output: { schema: ResumeKeywordMatchOutputSchema },
  prompt: `You are an expert ATS (Applicant Tracking System) and resume analyst.
Your task is to analyze a given resume text against a job description text to assess keyword matching and density.

First, carefully extract important keywords and phrases from the job description that an ATS would look for.
Then, compare these keywords against the provided resume text.

Provide the following output in JSON format:
1.  **keywordMatchScore**: An integer score from 0-100, where 100 indicates perfect keyword alignment.
2.  **missingKeywords**: A list of crucial keywords from the job description that are either absent or underrepresented in the resume.
3.  **foundKeywords**: A list of important keywords that are present in both the resume and the job description.
4.  **keywordDensityAnalysis**: A detailed analysis of how well the resume utilizes the keywords from the job description. Comment on optimal usage, under-usage, or overstuffing.
5.  **suggestions**: A list of actionable suggestions to improve the resume's keyword matching and overall relevance to the job description.

---
Job Description:
{{{jobDescriptionText}}}

---
Resume Text:
{{{resumeText}}}`,
});

const resumeKeywordMatchFlow = ai.defineFlow(
  {
    name: 'resumeKeywordMatchFlow',
    inputSchema: ResumeKeywordMatchInputSchema,
    outputSchema: ResumeKeywordMatchOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
