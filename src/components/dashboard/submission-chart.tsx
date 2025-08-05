"use client";

import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Entry } from '@/lib/types';
import { ChartTooltipContent } from '@/components/ui/chart';

type SubmissionChartProps = {
  entries: Entry[];
};

export function SubmissionChart({ entries }: SubmissionChartProps) {
  const chartData = useMemo(() => {
    const submissionDaysByMonth: { [key: string]: Set<string> } = {};

    entries.forEach(entry => {
      const month = entry.date.toLocaleString('default', { month: 'short', year: '2-digit' });
      const day = entry.date.toISOString().split('T')[0];
      if (!submissionDaysByMonth[month]) {
        submissionDaysByMonth[month] = new Set();
      }
      submissionDaysByMonth[month].add(day);
    });

    const data = Object.entries(submissionDaysByMonth).map(([month, days]) => ({
      month,
      days: days.size,
    }));
    
    // Sort by date to ensure correct order
    const sortedData = data.sort((a,b) => {
        const dateA = new Date(`01 ${a.month.replace(" '", ", '")}`);
        const dateB = new Date(`01 ${b.month.replace(" '", ", '")}`);
        return dateA.getTime() - dateB.getTime();
    }).slice(-6); // Show last 6 months

    return sortedData;
  }, [entries]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entry Submissions</CardTitle>
        <CardDescription>Number of days with entries per month.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              cursorClassName="fill-muted"
              content={<ChartTooltipContent
                formatter={(value) => `${value} days`}
                labelClassName="font-bold"
                indicator="dot"
              />}
            />
            <Bar dataKey="days" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
