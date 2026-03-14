'use server';
/**
 * @fileOverview This file implements a Genkit flow that generates improved or new resume bullet points
 * based on a job description, focusing on strong action verbs and quantifiable achievements.
 *
 * - bulletPointSuggestions - The main function to call for generating bullet point suggestions.
 * - BulletPointSuggestionsInput - The input type for the bulletPointSuggestions function.
 * - BulletPointSuggestionsOutput - The return type for the bulletPointSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BulletPointSuggestionsInputSchema = z.object({
  jobDescription: z.string().describe('The full text of the job description.'),
  resumeContent: z
    .string()
    .describe('The relevant section of the resume (e.g., work experience) for which bullet points need suggestions.'),
});
export type BulletPointSuggestionsInput = z.infer<typeof BulletPointSuggestionsInputSchema>;

const BulletPointSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of suggested bullet points for the resume.'),
});
export type BulletPointSuggestionsOutput = z.infer<typeof BulletPointSuggestionsOutputSchema>;

export async function bulletPointSuggestions(
  input: BulletPointSuggestionsInput
): Promise<BulletPointSuggestionsOutput> {
  return bulletPointSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'bulletPointSuggestionsPrompt',
  input: {schema: BulletPointSuggestionsInputSchema},
  output: {schema: BulletPointSuggestionsOutputSchema},
  prompt: `You are an expert resume writer specializing in optimizing resumes for Applicant Tracking Systems (ATS) and human recruiters. Your task is to generate improved or new bullet points for a resume section based on a provided job description.

Focus on the following key aspects:
- Use strong action verbs at the beginning of each bullet point.
- Quantify achievements whenever possible (e.g., "Increased sales by 15%," "Managed a team of 5").
- Tailor the language and keywords to align with the job description.
- Ensure clarity, conciseness, and impact.

Job Description:
{{jobDescription}}

Existing Resume Content (or context for new points):
{{resumeContent}}

Based on the job description and the resume content, provide an array of 3-5 improved or new bullet points that are highly impactful and ATS-friendly. Each bullet point should be a concise, standalone statement.`,
});

const bulletPointSuggestionsFlow = ai.defineFlow(
  {
    name: 'bulletPointSuggestionsFlow',
    inputSchema: BulletPointSuggestionsInputSchema,
    outputSchema: BulletPointSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
