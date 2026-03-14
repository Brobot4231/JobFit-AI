import type { AtsComplianceAnalysisOutput } from "@/ai/flows/ats-compliance-analysis-flow";
import type { ResumeImprovementInsightsOutput } from "@/ai/flows/resume-improvement-insights-flow";
import type { WithId } from "@/firebase/firestore/use-collection";

export type AnalysisResult = {
  atsAnalysis: AtsComplianceAnalysisOutput;
  improvementInsights: ResumeImprovementInsightsOutput;
};

export type AnalysisReportDocument = {
  userId: string;
  analysisDateTime: string;
  resumeFileName: string;
  jobDescription: string;
  atsAnalysis: AtsComplianceAnalysisOutput;
  improvementInsights: ResumeImprovementInsightsOutput;
};

export type HistoryReport = WithId<AnalysisReportDocument>;
