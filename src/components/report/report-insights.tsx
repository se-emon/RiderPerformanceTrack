
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot } from 'lucide-react';

type ReportInsightsProps = {
  insights: string;
  isLoading: boolean;
};

export function ReportInsights({ insights, isLoading }: ReportInsightsProps) {
  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <CardTitle>AI-Generated Insights</CardTitle>
        </div>
        <CardDescription>An automated analysis of this month's performance.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{insights}</p>
        )}
      </CardContent>
    </Card>
  );
}


    