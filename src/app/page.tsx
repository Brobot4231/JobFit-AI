"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Upload,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  collection,
} from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { analyzeResume } from "@/app/actions";
import type { AnalysisResult } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Header from "@/components/Header";
import AnalysisReport, { AnalysisSkeleton } from "@/components/AnalysisReport";
import { useFirestore, useUser } from "@/firebase";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

const formSchema = z.object({
  resume:
    typeof window === "undefined"
      ? z.any()
      : z
          .instanceof(FileList)
          .refine((files) => files?.length === 1, "Resume is required.")
          .refine(
            (files) => files?.[0]?.type === "application/pdf",
            "Only PDF files are accepted."
          )
          .refine(
            (files) => files?.[0]?.size <= 5 * 1024 * 1024,
            "File size must be less than 5MB."
          ),
  jobDescription: z
    .string()
    .min(100, "Job description must be at least 100 characters long."),
});

type FormValues = z.infer<typeof formSchema>;

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const heroImage = PlaceHolderImages.find((img) => img.id === "hero");

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobDescription: "",
    },
  });

  const selectedFile = form.watch("resume");

  const handleAnalysis: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const resumeFile = data.resume[0];
      const resumeDataUri = await fileToDataUri(resumeFile);
      const result = await analyzeResume({
        resumeDataUri,
        jobDescription: data.jobDescription,
      });

      if (result.error) {
        throw new Error(result.error);
      }
      
      setAnalysisResult(result.result);

      if (user && firestore && result.result) {
        const reportCollectionRef = collection(firestore, `users/${user.uid}/analysisReports`);
        const reportData = {
          userId: user.uid,
          analysisDateTime: new Date().toISOString(),
          resumeFileName: resumeFile.name,
          jobDescription: data.jobDescription,
          atsAnalysis: result.result.atsAnalysis,
          improvementInsights: result.result.improvementInsights,
        };
        addDocumentNonBlocking(reportCollectionRef, reportData);
        toast({
          title: "Analysis Saved",
          description: "Your analysis report has been saved to your history.",
        });
      }

    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: err.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setAnalysisResult(null);
    form.reset();
  };

  return (
    <div className="flex flex-col min-h-dvh bg-background font-body relative overflow-hidden">
      {/* Decorative Blob Background */}
      <div className="blob-bg bg-primary w-[500px] h-[500px] top-[-100px] left-[-200px]" />
      <div className="blob-bg bg-blue-500 w-[600px] h-[600px] bottom-[-200px] right-[-100px] animation-delay-2000" />
      
      <Header />
      <main className="flex-1 w-full relative z-10">
        {!analysisResult && !isLoading ? (
          <AnalysisFormSection form={form} onSubmit={handleAnalysis} selectedFile={selectedFile} />
        ) : (
          <div className="container mx-auto px-4 py-8 max-w-5xl">
            {isLoading && !analysisResult ? (
              <AnalysisSkeleton onNewAnalysis={handleNewAnalysis} />
            ) : (
              <AnalysisReport result={analysisResult} onNewAnalysis={handleNewAnalysis} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function AnalysisFormSection({ form, onSubmit, selectedFile }: { form: any; onSubmit: SubmitHandler<FormValues>, selectedFile: FileList | undefined }) {
  const { formState: { isSubmitting } } = form;
  return (
    <div className="container mx-auto px-4 py-12 md:py-24 max-w-6xl">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" /> AI-Powered Analysis
          </div>
          <h1 className="text-5xl md:text-6xl font-bold font-headline tracking-tighter leading-tight">
            Optimize Your Resume with <span className="text-gradient">JobFit AI</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
            JobFit AI analyzes your resume against job descriptions to boost your
            chances of passing through Applicant Tracking Systems (ATS) and
            landing your dream job.
          </p>
          <div className="relative aspect-video rounded-3xl overflow-hidden mt-8 shadow-2xl border border-border/50 ring-1 ring-black/5 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 flex items-center justify-center group">
            <div className="absolute inset-0 bg-grid-white/10" style={{ backgroundImage: 'radial-gradient(circle at center, transparent 0%, var(--background) 100%)' }} />
            
            {/* Abstract Resume Document */}
            <div className="relative w-48 h-64 bg-background rounded-xl shadow-xl border border-border/50 p-4 flex flex-col gap-3 transform group-hover:scale-105 transition-transform duration-500 overflow-hidden z-10">
              {/* Header */}
              <div className="flex gap-3 items-center border-b border-border/50 pb-3">
                 <div className="w-10 h-10 rounded-full bg-primary/20 animate-pulse" />
                 <div className="space-y-1.5 flex-1">
                   <div className="h-2.5 bg-primary/40 rounded w-full" />
                   <div className="h-2 bg-muted-foreground/30 rounded w-2/3" />
                 </div>
              </div>
              
              {/* Body Lines */}
              <div className="space-y-2 mt-2">
                <div className="h-2 bg-muted-foreground/20 rounded w-full" />
                <div className="h-2 bg-muted-foreground/20 rounded w-5/6" />
                <div className="h-2 bg-muted-foreground/20 rounded w-4/6" />
              </div>
              
               <div className="space-y-2 mt-4">
                <div className="h-2 bg-muted-foreground/20 rounded w-full" />
                <div className="h-2 bg-primary/30 rounded w-3/4 animate-pulse delay-75" />
                <div className="h-2 bg-muted-foreground/20 rounded w-5/6" />
              </div>

              {/* Animated Scanner Line */}
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80 animate-[scan_3s_ease-in-out_infinite]" style={{
                animation: 'scan 3s ease-in-out infinite',
                top: '0%'
              }} />
            </div>

            {/* Sparkles Floating around */}
            <div className="absolute top-1/4 left-1/4 animate-bounce delay-100">
              <Sparkles className="w-6 h-6 text-yellow-400 opacity-60" />
            </div>
            <div className="absolute bottom-1/4 right-1/4 animate-bounce delay-300">
               <Sparkles className="w-8 h-8 text-primary opacity-40" />
            </div>
          </div>
        </div>
        
        <div className="relative">
          {/* Subtle glow behind card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-500 rounded-3xl blur opacity-20" />
          
          <Card className="glass-card relative rounded-3xl border-0 ring-1 ring-border/50 overflow-hidden">
            <CardHeader className="space-y-3 pb-8 pt-8 px-8">
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                Start Your Analysis
              </CardTitle>
              <CardDescription className="text-base">
                Upload your resume and paste the job description below.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="resume"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">Resume (PDF, max 5MB)</FormLabel>
                        <div className="relative group cursor-pointer">
                          <div className="border-2 border-dashed border-border/60 group-hover:border-primary/50 transition-colors rounded-2xl bg-muted/30 p-8 flex flex-col items-center justify-center gap-3 text-center">
                            <div className="p-3 bg-background rounded-full shadow-sm group-hover:scale-110 transition-transform">
                              <Upload className="h-6 w-6 text-primary" />
                            </div>
                            <div className="text-sm font-medium">Click to upload or drag and drop</div>
                            <div className="text-xs text-muted-foreground">PDF only (max. 5MB)</div>
                          </div>
                          <FormControl>
                            <Input
                              type="file"
                              accept="application/pdf"
                              className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                              onChange={(e) => field.onChange(e.target.files)}
                            />
                          </FormControl>
                        </div>
                        {selectedFile && selectedFile.length > 0 && (
                            <div className="flex items-center gap-3 mt-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
                              <FileText className="w-5 h-5 text-primary"/>
                              <div className="text-sm font-medium truncate flex-1">{selectedFile[0].name}</div>
                            </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jobDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">Job Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Paste the full job description here..."
                            className="min-h-[220px] resize-y rounded-2xl focus-visible:ring-primary/20 bg-muted/30 border-border/60"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" size="lg" className="w-full rounded-full text-md py-6 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-5 w-5" />
                    )}
                    {isSubmitting ? "Analyzing..." : "Analyze Match"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
