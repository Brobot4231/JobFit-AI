'use server';
/**
 * @fileOverview An AI agent that analyzes resumes against job descriptions to provide improvement insights.
 *
 * - resumeImprovementInsights - A function that handles the resume analysis process.
 * - ResumeImprovementInsightsInput - The input type for the resumeImprovementInsights function.
 * - ResumeImprovementInsightsOutput - The return type for the resumeImprovementInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResumeImprovementInsightsInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "The resume content, as a data URI that must include a MIME type (e.g., 'application/pdf') and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  jobDescription: z
    .string()
    .describe('The full text of the job description for which the resume is being tailored.'),
});
export type ResumeImprovementInsightsInput = z.infer<
  typeof ResumeImprovementInsightsInputSchema
>;

const ResumeImprovementInsightsOutputSchema = z.object({
  overallAssessment: z
    .string()
    .describe('A brief overall assessment of the resume against the job description.'),
  weakAreas: z
    .array(z.string())
    .describe('A list of general weak areas identified in the resume (e.g., conciseness, clarity, keyword usage).'),
  issues: z
    .array(
      z.object({
        category: z
          .string()
          .describe(
            'The category of the issue (e.g., "Formatting", "Keywords", "Content", "Completeness").'
          ),
        description: z.string().describe('A detailed description of the specific issue.'),
        recommendation: z.string().describe('A concrete suggestion to address the issue.'),
      })
    )
    .describe('Specific issues found in the resume, categorized with descriptions and recommendations.'),
  suggestions: z
    .object({
      actionVerbs: z
        .array(z.string())
        .describe('Suggestions for stronger action verbs to replace weaker phrases.'),
      missingSkills: z
        .array(z.string())
        .describe('Skills mentioned in the job description that are missing or underrepresented in the resume.'),
      bulletPointImprovements: z
        .array(z.string())
        .describe('Examples of how existing bullet points could be improved for impact and clarity.'),
      overallTailoring: z
        .string()
        .describe('General advice on how to better tailor the resume to the specific job description.'),
    })
    .describe('Detailed suggestions for optimizing the resume content.'),
});
export type ResumeImprovementInsightsOutput = z.infer<
  typeof ResumeImprovementInsightsOutputSchema
>;

export async function resumeImprovementInsights(
  input: ResumeImprovementInsightsInput
): Promise<ResumeImprovementInsightsOutput> {
  return resumeImprovementInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'resumeImprovementInsightsPrompt',
  input: { schema: ResumeImprovementInsightsInputSchema },
  output: { schema: ResumeImprovementInsightsOutputSchema },
  prompt: `You are an expert ATS and HR professional. Your task is to analyze a given resume against a specific job description and provide comprehensive, actionable improvement insights.

Critique the resume for ATS compatibility, keyword optimization, formatting, content, and overall impact for a recruiter.

Focus on identifying weak areas, specific issues, and providing concrete suggestions to optimize the resume for both ATS and recruiter impact.

Resume: {{media url=resumeDataUri}}

Job Description:
{{{jobDescription}}}

Carefully analyze the resume based on the job description. Provide:
1. An overall assessment.
2. A list of general weak areas.
3. Specific issues with detailed descriptions and concrete recommendations, categorized by type (e.g., Formatting, Keywords, Content, Completeness).
4. Detailed suggestions, including stronger action verbs, missing skills from the job description, bullet point improvement examples, and overall tailoring advice.

Ensure your output is structured according to the provided JSON schema. Your recommendations should be highly actionable and specific.`,
});

const resumeImprovementInsightsFlow = ai.defineFlow(
  {
    name: 'resumeImprovementInsightsFlow',
    inputSchema: ResumeImprovementInsightsInputSchema,
    outputSchema: ResumeImprovementInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate resume improvement insights.');
    }
    return output;
  }
);
