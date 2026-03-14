"use server";

import {
  atsComplianceAnalysis,
  type AtsComplianceAnalysisInput,
} from "@/ai/flows/ats-compliance-analysis-flow";
import {
  resumeImprovementInsights,
  type ResumeImprovementInsightsInput,
} from "@/ai/flows/resume-improvement-insights-flow";
import type { AnalysisResult } from "@/lib/types";

type AnalyzeResumeInput = {
  resumeDataUri: string;
  jobDescription: string;
};

export async function analyzeResume(
  input: AnalyzeResumeInput
): Promise<{ result: AnalysisResult | null; error: string | null }> {
  try {
    const [atsResult, insightsResult] = await Promise.all([
      atsComplianceAnalysis({
        resumeDataUri: input.resumeDataUri,
        jobDescription: input.jobDescription,
      } as AtsComplianceAnalysisInput),
      resumeImprovementInsights({
        resumeDataUri: input.resumeDataUri,
        jobDescription: input.jobDescription,
      } as ResumeImprovementInsightsInput),
    ]);

    if (!atsResult || !insightsResult) {
      throw new Error("One or more AI analysis flows failed to return a result.");
    }

    return {
      result: {
        atsAnalysis: atsResult,
        improvementInsights: insightsResult,
      },
      error: null,
    };
  } catch (error: any) {
    console.error("Error during resume analysis:", error);
    return {
      result: null,
      error: error.message || "An unknown error occurred during analysis.",
    };
  }
}
