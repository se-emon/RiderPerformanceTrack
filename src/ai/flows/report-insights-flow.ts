
'use server';
/**
 * @fileOverview AI flows for generating and analyzing performance reports.
 *
 * - generateReport: A function to process raw entry data into a structured report.
 * - getReportInsights: An AI flow to generate qualitative insights from a report.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { Entry, Rider, ReportData, RiderStats } from '@/lib/types';

const RiderStatsSchema = z.object({
  riderId: z.string(),
  riderName: z.string(),
  successful: z.number(),
  failed: z.number(),
  returned: z.number(),
  total: z.number(),
  successRatio: z.number(),
  failRatio: z.number(),
  returnRatio: z.number(),
  activeDays: z.number(),
});

const ReportDataSchema = z.object({
  riderStats: z.array(RiderStatsSchema),
  totalEntries: z.number(),
  month: z.string(),
  year: z.string(),
});

const ReportInputSchema = z.object({
    entries: z.any(),
    riders: z.any(),
    topN: z.number().optional().default(6),
});

export async function generateReport(input: z.infer<typeof ReportInputSchema>): Promise<ReportData> {
    const { entries, riders, topN } = input;
    const totalEntriesCount = entries.reduce((sum: number, entry: Entry) => sum + entry.successful + entry.failed + entry.returned, 0);

    const statsMap = new Map<string, RiderStats>();
    riders.forEach((rider: Rider) => {
      statsMap.set(rider.id, {
        riderId: rider.id,
        riderName: rider.name,
        successful: 0,
        failed: 0,
        returned: 0,
        total: 0,
        successRatio: 0,
        failRatio: 0,
        returnRatio: 0,
        activeDays: 0,
      });
    });

    const riderActivity = new Map<string, Set<string>>();

    entries.forEach((entry: Entry) => {
      const stat = statsMap.get(entry.riderId);
      if (stat) {
        stat.successful += entry.successful;
        stat.failed += entry.failed;
        stat.returned += entry.returned;

        if (!riderActivity.has(entry.riderId)) {
            riderActivity.set(entry.riderId, new Set());
        }
        riderActivity.get(entry.riderId)!.add(new Date(entry.date).toDateString());
      }
    });
    
    const finalStats = Array.from(statsMap.values()).map(stat => {
        const total = stat.successful + stat.failed + stat.returned;
        stat.total = total;
        stat.activeDays = riderActivity.get(stat.riderId)?.size ?? 0;
        if (total > 0) {
            stat.successRatio = stat.successful / total;
            stat.failRatio = stat.failed / total;
            stat.returnRatio = stat.returned / total;
        }
        return stat;
    }).filter(s => s.total > 0)
      .sort((a, b) => b.successRatio - a.successRatio || b.total - a.total);
    
    const reportDate = entries.length > 0 ? new Date(entries[0].date) : new Date();

    return {
        riderStats: finalStats.slice(0, topN),
        totalEntries: totalEntriesCount,
        month: (reportDate.getMonth() + 1).toString(),
        year: reportDate.getFullYear().toString(),
    };
}


const insightsPrompt = ai.definePrompt({
  name: 'getReportInsightsPrompt',
  input: { schema: ReportDataSchema },
  output: { format: 'text' },
  prompt: `
    You are a data analyst for a delivery company. You have been given a performance report for the top riders for {{month}}/{{year}}.
    The report includes the following data for each rider: successful deliveries, failed deliveries, returned items, total deliveries, success ratio, fail ratio, return ratio, and active days.
    The total number of entries for the month was {{totalEntries}}.

    The rider data is as follows:
    {{#each riderStats}}
    - {{riderName}}:
        Success Ratio: {{successRatio}}%
        Total Deliveries: {{total}}
        Active Days: {{activeDays}}
        Successful: {{successful}}, Failed: {{failed}}, Returned: {{returned}}
    {{/each}}

    Please provide a concise, professional, and insightful summary of the report. The summary should be 2-3 short paragraphs.

    Your analysis should highlight:
    1.  The top performer and what makes them stand out (e.g., high success rate, high volume).
    2.  Any general trends you notice (e.g., overall performance, common success rates).
    3.  A positive and encouraging observation or area for potential improvement for the team as a whole. Do not be negative.

    Your response should be formatted as a single block of text, suitable for direct display in a web UI. Do not use markdown headings or lists.
  `,
});

const reportInsightsFlow = ai.defineFlow(
  {
    name: 'reportInsightsFlow',
    inputSchema: ReportDataSchema,
    outputSchema: z.string(),
  },
  async (report) => {
    const processedReport = {
        ...report,
        riderStats: report.riderStats.map(stat => ({
            ...stat,
            successRatio: parseFloat((stat.successRatio * 100).toFixed(2)),
            failRatio: parseFloat((stat.failRatio * 100).toFixed(2)),
            returnRatio: parseFloat((stat.returnRatio * 100).toFixed(2)),
        }))
    };
    const { text } = await insightsPrompt(processedReport);
    return text;
  }
);

export async function getReportInsights(report: ReportData): Promise<string> {
    return reportInsightsFlow(report);
}
