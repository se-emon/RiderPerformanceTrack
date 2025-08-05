
'use server';
/**
 * @fileOverview AI flows for generating and analyzing performance reports.
 *
 * - generateReport: A function to process raw entry data into a structured report.
 * - getReportInsights: An AI flow to generate qualitative insights from a report.
 */

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
