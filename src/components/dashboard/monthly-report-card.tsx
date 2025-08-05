"use client";

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Crown, ThumbsDown, PackageOpen, Award } from 'lucide-react';
import type { Rider, Entry } from '@/lib/types';

type MonthlyReportCardProps = {
  entries: Entry[];
  riders: Rider[];
};

type RiderStats = {
  riderId: string;
  riderName: string;
  successful: number;
  failed: number;
  returned: number;
  total: number;
  successRatio: number;
  failRatio: number;
  returnRatio: number;
};

export function MonthlyReportCard({ entries, riders }: MonthlyReportCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const riderMap = useMemo(() => new Map(riders.map(r => [r.id, r.name])), [riders]);

  const monthlyStats = useMemo(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthEntries = entries.filter(entry => entry.date >= firstDayOfMonth);
    
    const statsMap = new Map<string, RiderStats>();

    riders.forEach(rider => {
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
      });
    });

    monthEntries.forEach(entry => {
      const stat = statsMap.get(entry.riderId);
      if (stat) {
        stat.successful += entry.successful;
        stat.failed += entry.failed;
        stat.returned += entry.returned;
      }
    });

    const finalStats = Array.from(statsMap.values()).map(stat => {
      const total = stat.successful + stat.failed + stat.returned;
      stat.total = total;
      if (total > 0) {
        stat.successRatio = stat.successful / total;
        stat.failRatio = stat.failed / total;
        stat.returnRatio = stat.returned / total;
      }
      return stat;
    }).filter(s => s.total > 0);

    const topSuccess = [...finalStats].sort((a, b) => b.successRatio - a.successRatio || b.total - a.total).slice(0, 3);
    const topFailed = [...finalStats].sort((a, b) => a.failRatio - b.failRatio || b.total - a.total).slice(0, 3);
    const topReturned = [...finalStats].sort((a, b) => a.returnRatio - b.returnRatio || b.total - a.total).slice(0, 3);

    return { topSuccess, topFailed, topReturned };
  }, [entries, riders]);

  const StatList = ({ title, icon: Icon, stats, statKey, unit, order }: { title: string; icon: React.ElementType, stats: RiderStats[], statKey: keyof RiderStats, unit: string, order?:'asc'|'desc' }) => (
    <div>
      <h4 className="flex items-center font-semibold mb-2"><Icon className="mr-2 h-5 w-5"/>{title}</h4>
      <ul className="space-y-1 text-sm">
        {stats.length > 0 ? stats.map((stat, i) => (
          <li key={stat.riderId} className="flex justify-between items-center p-2 rounded-md bg-muted/50">
            <span>{i+1}. {stat.riderName}</span>
            <span className="font-bold">
              {typeof stat[statKey] === 'number' ? ((stat[statKey] as number) * 100).toFixed(1) : stat[statKey]}
              {unit}
            </span>
          </li>
        )) : <p className="text-muted-foreground text-sm p-2">Not enough data for this month.</p>}
      </ul>
    </div>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Monthly Report</CardTitle>
          <CardDescription>Generate a performance report for the current month.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsOpen(true)} className="w-full">
            <Award className="mr-2 h-4 w-4" /> Generate Report
          </Button>
        </CardContent>
      </Card>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Monthly Performance Report</DialogTitle>
            <DialogDescription>Top performers for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <StatList title="Highest Success Rate" icon={Crown} stats={monthlyStats.topSuccess} statKey="successRatio" unit="%" order="desc" />
            <StatList title="Lowest Fail Rate" icon={ThumbsDown} stats={monthlyStats.topFailed} statKey="failRatio" unit="%" order="asc" />
            <StatList title="Lowest Return Rate" icon={PackageOpen} stats={monthlyStats.topReturned} statKey="returnRatio" unit="%" order="asc" />
          </div>
          <DialogFooter>
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
