'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Loader2, Trash2, History as HistoryIcon, FileText, Clock, Trophy, ListFilter, Briefcase } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import Header from '@/components/Header';
import type { HistoryReport } from '@/lib/types';
import AnalysisReport from '@/components/AnalysisReport';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


export default function HistoryPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const historyQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, `users/${user.uid}/analysisReports`),
      orderBy('analysisDateTime', 'desc')
    );
  }, [user, firestore]);

  const { data: reports, isLoading: isLoadingReports } = useCollection<HistoryReport>(historyQuery);

  const groupedReports = useMemo(() => {
    if (!reports) return [];

    const groups: Record<string, HistoryReport[]> = {};

    reports.forEach((report) => {
      const jd = report.jobDescription || 'Unknown Job Description';
      if (!groups[jd]) {
        groups[jd] = [];
      }
      groups[jd].push(report);
    });

    return Object.entries(groups).map(([jobDescription, groupReports]) => {
      // Sort reports by ATS score descending
      const sortedReports = [...groupReports].sort((a, b) => {
        const scoreA = a.atsAnalysis?.atsScore ?? 0;
        const scoreB = b.atsAnalysis?.atsScore ?? 0;
        return scoreB - scoreA;
      });

      return {
        jobDescription,
        reports: sortedReports,
      };
    });
  }, [reports]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleDelete = (reportId: string) => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, `users/${user.uid}/analysisReports`, reportId);
    deleteDocumentNonBlocking(docRef);
    toast({
        title: "Deleted",
        description: "The analysis report has been deleted.",
    });
  };

  if (isUserLoading || isLoadingReports) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // or a login prompt
  }

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Decorative Blob Background */}
      <div className="blob-bg bg-primary w-[600px] h-[600px] top-[-200px] left-[-200px]" />
      
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl relative z-10">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold font-headline flex items-center gap-3">
              <HistoryIcon className="w-8 h-8 text-primary" /> 
              Analysis History
            </h1>
        </div>

        {reports && reports.length > 0 ? (
          <Tabs defaultValue="recent" className="w-full">
            <div className="flex justify-start mb-6">
                <TabsList className="bg-muted/50 p-1 rounded-full border border-border/50">
                  <TabsTrigger value="recent" className="rounded-full px-6 py-2 flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground">
                    <ListFilter className="w-4 h-4" /> Recent
                  </TabsTrigger>
                  <TabsTrigger value="ranking" className="rounded-full px-6 py-2 flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground">
                    <Trophy className="w-4 h-4" /> Rankings
                  </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="recent" className="mt-0 outline-none">
              <Accordion type="single" collapsible className="w-full space-y-6">
            {reports.map((report) => (
              <AccordionItem value={report.id} key={report.id} className="border-b-0">
                 <Card className="glass-card rounded-2xl border-0 ring-1 ring-border/50 hover:shadow-lg transition-shadow overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between p-0">
                        <AccordionTrigger className="flex-1 font-semibold text-left px-6 py-6 hover:no-underline hover:bg-muted/30 transition-colors">
                            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                                      <FileText className="w-5 h-5"/>
                                    </div>
                                    <span className="font-medium text-lg">{report.resumeFileName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                                    <Clock className="w-4 h-4" />
                                    <span>{format(new Date(report.analysisDateTime), 'PPP p')}</span>
                                </div>
                            </div>
                        </AccordionTrigger>
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="mr-6 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-full shrink-0">
                                <Trash2 className="w-5 h-5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-3xl border-0 ring-1 ring-border/50">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-headline text-xl">Delete this report?</AlertDialogTitle>
                              <AlertDialogDescription className="text-base">
                                This action cannot be undone. This will permanently remove the analysis report from your history.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-4">
                              <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(report.id)} className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </CardHeader>
                    <AccordionContent className="px-6 pb-6 pt-2 bg-background/50 border-t border-border/40">
                        <AnalysisReport result={{ atsAnalysis: report.atsAnalysis, improvementInsights: report.improvementInsights }} showNewAnalysisButton={false} />
                    </AccordionContent>
                 </Card>
              </AccordionItem>
            ))}
          </Accordion>
            </TabsContent>

            <TabsContent value="ranking" className="mt-0 outline-none space-y-12">
               {groupedReports.map((group, groupIdx) => (
                 <div key={groupIdx} className="space-y-6">
                    <div className="flex items-start gap-4 px-2">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0 mt-1">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg md:text-xl text-foreground line-clamp-2" title={group.jobDescription}>
                                {group.jobDescription}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 font-medium">{group.reports.length} Resume{group.reports.length !== 1 ? 's' : ''} Analyzed</p>
                        </div>
                    </div>
                    
                    <Accordion type="single" collapsible className="w-full space-y-4 pl-4 md:pl-16 relative before:absolute before:left-8 before:top-2 before:bottom-2 before:w-px before:bg-border/60">
                      {group.reports.map((report, idx) => (
                        <AccordionItem value={`rank-${groupIdx}-${report.id}`} key={report.id} className="border-b-0 relative">
                          {/* Rank Marker */}
                          <div className="absolute -left-12 md:-left-16 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-background border-2 border-primary text-primary flex items-center justify-center font-bold text-sm md:text-base z-10 shadow-sm">
                            #{idx + 1}
                          </div>

                          <Card className="glass-card rounded-2xl border-0 ring-1 ring-border/50 hover:shadow-md transition-all overflow-hidden ml-4">
                              <CardHeader className="flex flex-row items-center justify-between p-0">
                                  <AccordionTrigger className="flex-1 font-semibold text-left px-4 py-4 md:px-6 md:py-5 hover:no-underline hover:bg-muted/30 transition-colors">
                                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 w-full pr-4">
                                          <div className="flex items-center gap-3 min-w-0 flex-1">
                                              <div className="p-2 bg-primary/10 rounded-full text-primary shrink-0">
                                                <FileText className="w-4 h-4 md:w-5 md:h-5"/>
                                              </div>
                                              <span className="font-medium text-base md:text-lg truncate">{report.resumeFileName}</span>
                                          </div>
                                          
                                          <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end w-full md:w-auto mt-2 md:mt-0">
                                              <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                                                  <Clock className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
                                                  <span className="truncate max-w-[120px] md:max-w-none">{format(new Date(report.analysisDateTime), 'MMM d, yyyy')}</span>
                                              </div>
                                              <Badge variant={report.atsAnalysis.atsScore >= 80 ? 'default' : report.atsAnalysis.atsScore >= 60 ? 'secondary' : 'destructive'} className="px-3 py-1 shadow-sm text-sm">
                                                {report.atsAnalysis.atsScore} / 100
                                              </Badge>
                                          </div>
                                      </div>
                                  </AccordionTrigger>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="mr-4 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-full shrink-0 h-8 w-8 md:h-10 md:w-10">
                                          <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="rounded-3xl border-0 ring-1 ring-border/50">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="font-headline text-xl">Delete this report?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-base">
                                          This action cannot be undone. This will permanently remove the analysis report from your history.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter className="mt-4">
                                        <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(report.id)} className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                              </CardHeader>
                              <AccordionContent className="px-4 pb-4 pt-2 md:px-6 md:pb-6 bg-background/50 border-t border-border/40">
                                  <AnalysisReport result={{ atsAnalysis: report.atsAnalysis, improvementInsights: report.improvementInsights }} showNewAnalysisButton={false} />
                              </AccordionContent>
                          </Card>
                        </AccordionItem>
                      ))}
                    </Accordion>
                 </div>
               ))}
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="glass-card text-center py-24 rounded-3xl border-0 ring-1 ring-border/50 mt-12">
            <CardHeader className="space-y-4">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-10 h-10 text-primary opacity-50" />
              </div>
              <CardTitle className="text-3xl font-headline font-bold">No History Found</CardTitle>
              <CardDescription className="text-lg">You haven't analyzed any resumes yet. Start your journey below.</CardDescription>
            </CardHeader>
            <CardContent className="mt-4">
              <Button asChild size="lg" className="rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                <a href="/">Start Your First Analysis</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
