'use client';

import {
    Gauge,
    Target,
    XCircle,
    CheckCircle,
    Lightbulb,
    Sparkles,
    ChevronRight,
    ClipboardList,
  } from "lucide-react";
  import {
    RadialBarChart,
    RadialBar,
    PolarAngleAxis,
    ResponsiveContainer,
  } from "recharts";
  
  import { Button } from "@/components/ui/button";
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from "@/components/ui/tabs";
  import { Badge } from "@/components/ui/badge";
  import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion";
  import { Skeleton } from "@/components/ui/skeleton";
  import type { AnalysisResult } from "@/lib/types";
  import { cn } from "@/lib/utils";

export default function AnalysisReport({ result, onNewAnalysis, showNewAnalysisButton = true }: { result: AnalysisResult | null, onNewAnalysis?: () => void, showNewAnalysisButton?: boolean }) {
    if (!result) {
      return null;
    }
    
    const score = result.atsAnalysis.atsScore;
    const scoreColor = score > 80 ? 'text-green-500' : score > 50 ? 'text-yellow-500' : 'text-red-500';
  
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {showNewAnalysisButton && onNewAnalysis && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h1 className="text-4xl font-bold font-headline tracking-tight text-gradient">Analysis Report</h1>
                <Button onClick={onNewAnalysis} variant="outline" className="rounded-full shadow-sm hover:border-primary/50 transition-colors">
                  <Sparkles className="w-4 h-4 mr-2" /> Start New Analysis
                </Button>
            </div>
        )}
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-muted/50 p-1.5 rounded-2xl mb-8">
            <TabsTrigger value="summary" className="rounded-xl data-[state=active]:shadow-sm">Summary</TabsTrigger>
            <TabsTrigger value="keywords" className="rounded-xl data-[state=active]:shadow-sm">Keyword Match</TabsTrigger>
            <TabsTrigger value="formatting" className="rounded-xl data-[state=active]:shadow-sm">Formatting</TabsTrigger>
            <TabsTrigger value="insights" className="rounded-xl data-[state=active]:shadow-sm">Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <Card className="glass-card rounded-3xl border-0 ring-1 ring-border/50 overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-border/40 px-8 py-6">
                <CardTitle className="font-headline text-2xl flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Gauge className="text-primary w-6 h-6" /> 
                  </div>
                  ATS Compatibility Score
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-8 items-center">
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      innerRadius="70%"
                      outerRadius="100%"
                      data={[{ value: score }]}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <PolarAngleAxis
                        type="number"
                        domain={[0, 100]}
                        angleAxisId={0}
                        tick={false}
                      />
                      <RadialBar
                        background
                        dataKey="value"
                        cornerRadius={10}
                        className="fill-primary"
                      />
                      <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className={cn("text-5xl font-bold font-headline", scoreColor)}
                      >
                        {`${score}%`}
                      </text>
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  <h3 className="font-headline text-xl font-semibold">Overall Assessment</h3>
                  <p className="text-muted-foreground">
                    {result.improvementInsights.overallAssessment}
                  </p>
                  <h3 className="font-headline text-xl font-semibold">ATS Summary</h3>
                  <p className="text-muted-foreground">
                    {result.atsAnalysis.overallAnalysis}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keywords" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
             <Card className="glass-card rounded-3xl border-0 ring-1 ring-border/50 overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-border/40 px-8 py-6">
                  <CardTitle className="font-headline text-2xl flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <Target className="text-primary w-6 h-6"/> 
                      </div>
                      Keyword Analysis
                  </CardTitle>
                  <CardDescription className="text-base">How well your resume's keywords match the job description.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 p-8">
                  <div>
                      <h3 className="font-headline text-lg font-semibold mb-2">Keyword Density</h3>
                      <p className="text-muted-foreground">{result.atsAnalysis.keywordCompliance.keywordDensityAnalysis}</p>
                  </div>
                  <div>
                      <h3 className="font-headline text-lg font-semibold mb-3">Suggested Keywords</h3>
                      <div className="flex flex-wrap gap-2">
                          {result.atsAnalysis.keywordCompliance.suggestedKeywords.map((kw, i) => <Badge key={i} variant="secondary">{kw}</Badge>)}
                      </div>
                  </div>
                  <div>
                      <h3 className="font-headline text-lg font-semibold mb-3">Missing Keywords</h3>
                      <div className="flex flex-wrap gap-2">
                          {result.atsAnalysis.keywordCompliance.missingKeywords.length > 0 ? 
                              result.atsAnalysis.keywordCompliance.missingKeywords.map((kw, i) => <Badge key={i} variant="destructive">{kw}</Badge>) :
                              <p className="text-sm text-green-600">Great job! No critical keywords are missing.</p>
                          }
                      </div>
                  </div>
              </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="formatting" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <Card className="glass-card rounded-3xl border-0 ring-1 ring-border/50 overflow-hidden">
                  <CardHeader className="bg-primary/5 border-b border-border/40 px-8 py-6">
                      <CardTitle className="font-headline text-2xl flex items-center gap-3">
                         <div className="p-2 bg-primary/10 rounded-xl">
                           <ClipboardList className="text-primary w-6 h-6"/>
                         </div>
                         Formatting Compliance
                      </CardTitle>
                      <CardDescription className="text-base">Analysis of your resume's structure for ATS parsability.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8 p-8">
                      <div>
                          <h3 className="font-headline text-lg font-semibold mb-2">Potential Issues</h3>
                          <ul className="space-y-2">
                              {result.atsAnalysis.formattingCompliance.issues.length > 0 ?
                                  result.atsAnalysis.formattingCompliance.issues.map((issue, i) => (
                                      <li key={i} className="flex items-start gap-2 text-destructive-foreground/80"><XCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0"/><span>{issue}</span></li>
                                  )) :
                                  <li className="flex items-center gap-2 text-green-600"><CheckCircle className="w-5 h-5"/><span>No major formatting issues found.</span></li>
                              }
                          </ul>
                      </div>
                      <div>
                          <h3 className="font-headline text-lg font-semibold mb-2">Suggestions</h3>
                          <ul className="space-y-2">
                              {result.atsAnalysis.formattingCompliance.suggestions.map((sugg, i) => (
                                  <li key={i} className="flex items-start gap-2 text-muted-foreground"><Lightbulb className="w-5 h-5 text-accent mt-0.5 shrink-0"/><span>{sugg}</span></li>
                              ))}
                          </ul>
                      </div>
                  </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="insights" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <Card className="glass-card rounded-3xl border-0 ring-1 ring-border/50 overflow-hidden">
                  <CardHeader className="bg-primary/5 border-b border-border/40 px-8 py-6">
                      <CardTitle className="font-headline text-2xl flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-xl">
                            <Sparkles className="text-primary w-6 h-6" /> 
                          </div>
                          AI-Powered Improvement Insights
                      </CardTitle>
                       <CardDescription className="text-base">Specific recommendations to make your resume stand out.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-10 p-8">
                       <div className="bg-destructive/5 rounded-2xl p-6 border border-destructive/10">
                          <h3 className="font-headline text-lg font-semibold mb-3 flex items-center gap-2 text-destructive"><XCircle className="w-5 h-5"/> Weak Areas</h3>
                          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                              {result.improvementInsights.weakAreas.map((area, i) => <li key={i}>{area}</li>)}
                          </ul>
                      </div>
                      <div>
                          <h3 className="font-headline text-lg font-semibold mb-2">Specific Issues & Recommendations</h3>
                          <Accordion type="single" collapsible className="w-full">
                              {result.improvementInsights.issues.map((issue, i) => (
                                  <AccordionItem value={`item-${i}`} key={i}>
                                      <AccordionTrigger className="font-semibold">{issue.category}: {issue.description.substring(0, 80)}{issue.description.length > 80 && '...'}</AccordionTrigger>
                                      <AccordionContent className="space-y-2">
                                          <p><strong className="font-medium">Issue:</strong> {issue.description}</p>
                                          <p className="text-primary"><strong className="font-medium text-foreground">Recommendation:</strong> {issue.recommendation}</p>
                                      </AccordionContent>
                                  </AccordionItem>
                              ))}
                          </Accordion>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-8">
                           <div>
                              <h3 className="font-headline text-lg font-semibold mb-2">Action Verb Suggestions</h3>
                              <ul className="space-y-2">
                                  {result.improvementInsights.suggestions.actionVerbs.map((verb, i) => (
                                      <li key={i} className="flex items-center gap-2 text-muted-foreground"><ChevronRight className="w-4 h-4 text-accent"/>{verb}</li>
                                  ))}
                              </ul>
                          </div>
                           <div>
                              <h3 className="font-headline text-lg font-semibold mb-2">Missing Skills</h3>
                              <ul className="space-y-2">
                                  {result.improvementInsights.suggestions.missingSkills.map((skill, i) => (
                                       <li key={i} className="flex items-center gap-2 text-muted-foreground"><ChevronRight className="w-4 h-4 text-accent"/>{skill}</li>
                                  ))}
                              </ul>
                          </div>
                      </div>
  
                      <div>
                          <h3 className="font-headline text-lg font-semibold mb-2">Bullet Point Improvements</h3>
                          <div className="space-y-3">
                              {result.improvementInsights.suggestions.bulletPointImprovements.map((bp, i) => (
                                  <p key={i} className="p-3 bg-secondary/50 rounded-md border text-sm text-muted-foreground">"{bp}"</p>
                              ))}
                          </div>
                      </div>
                  </CardContent>
              </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

export function AnalysisSkeleton({ onNewAnalysis }: { onNewAnalysis?: () => void }) {
    return (
        <>
            {onNewAnalysis && (
                <div className="flex justify-between items-center mb-6">
                    <Skeleton className="h-9 w-64" />
                    <Skeleton className="h-10 w-44" />
                </div>
            )}
            <div className="w-full">
                <div className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 mb-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-8 items-center">
                        <Skeleton className="w-full h-64 rounded-full" />
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                             <Skeleton className="h-6 w-1/3 mt-4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-4/6" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
