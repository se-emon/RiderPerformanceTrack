
"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Entry, Rider } from '@/lib/types';
import { initialEntries, initialRiders } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Trophy, CheckCircle, XCircle, Undo, CalendarDays } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

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
  activeDays: number;
};

export default function ReportPage() {
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [showTop10, setShowTop10] = useState(false);
  const [reportData, setReportData] = useState<RiderStats[]>([]);
  const [totalMonthEntries, setTotalMonthEntries] = useState(0);
  const [generatedDate, setGeneratedDate] = useState<string>('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedEntries = localStorage.getItem('dashboardEntries');
    if (storedEntries) {
        setEntries(JSON.parse(storedEntries, (key, value) => {
            if (key === 'date') return new Date(value);
            return value;
        }));
    } else {
        setEntries(initialEntries);
    }
    const storedRiders = localStorage.getItem('dashboardRiders');
    if (storedRiders) {
        setRiders(JSON.parse(storedRiders));
    } else {
        setRiders(initialRiders);
    }
  }, []);

  const handleGenerateReport = () => {
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    const monthEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= endDate;
    });
    
    const totalEntriesCount = monthEntries.reduce((sum, entry) => sum + entry.successful + entry.failed + entry.returned, 0);
    setTotalMonthEntries(totalEntriesCount);

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
        activeDays: 0,
      });
    });

    const riderActivity = new Map<string, Set<string>>();

    monthEntries.forEach(entry => {
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
    
    setReportData(showTop10 ? finalStats.slice(0, 10) : finalStats.slice(0, 6));
    setGeneratedDate(`${month}/${year}`);
  };
  
  const months = [
      {value: "1", label: "January"}, {value: "2", label: "February"}, {value: "3", label: "March"},
      {value: "4", label: "April"}, {value: "5", label: "May"}, {value: "6", label: "June"},
      {value: "7", label: "July"}, {value: "8", label: "August"}, {value: "9", label: "September"},
      {value: "10", label: "October"}, {value: "11", label: "November"}, {value: "12", label: "December"}
  ];
  
  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
         <div className="container mx-auto flex flex-wrap justify-between items-center gap-4">
          <h1 className="text-2xl font-bold">Monthly Performance Report</h1>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                <Link href="/">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-6">
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div className="grid gap-2">
                    <Label htmlFor="month-select">Month</Label>
                    <Select value={month} onValueChange={setMonth}>
                        <SelectTrigger id="month-select">
                        <SelectValue placeholder="Select Month" />
                        </SelectTrigger>
                        <SelectContent>
                        {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="year-input">Year</Label>
                    <Input id="year-input" type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year"/>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                    <Checkbox id="top-10" checked={showTop10} onCheckedChange={(checked) => setShowTop10(Boolean(checked))} />
                    <Label htmlFor="top-10">Show Top 10 Only</Label>
                </div>
                <Button onClick={handleGenerateReport} className="w-full lg:w-auto">Generate</Button>
            </div>
          </CardContent>
        </Card>

        {reportData.length > 0 && (
          <div className="bg-muted/20 p-4 rounded-lg">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-2">
                <h2 className="text-xl md:text-2xl font-bold flex items-center">
                    <Trophy className="mr-2 text-yellow-500" />
                    {reportData.length} Top Performers
                    {totalMonthEntries > 0 && <span className="text-base md:text-lg font-medium text-muted-foreground ml-2">({totalMonthEntries} total entries)</span>}
                </h2>
                <Badge variant="secondary" className="text-base md:text-lg self-start md:self-center">{generatedDate}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {reportData.map((rider, index) => (
                <Card key={rider.riderId} className="shadow-md hover:shadow-xl transition-shadow bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className="h-8 w-8 flex-shrink-0 flex items-center justify-center text-lg rounded-full">{index + 1}</Badge>
                        <span className="text-xl font-bold">{rider.riderName}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <Badge variant="default" className="text-md">Total: {rider.total}</Badge>
                        <Badge variant="outline" className="text-sm font-normal flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" /> {rider.activeDays} Active Days
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                     <div>
                        <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="flex items-center"><CheckCircle className="mr-2 text-green-500" /> Success</span>
                            <span>{rider.successful} ({(rider.successRatio * 100).toFixed(1)}%)</span>
                        </div>
                        <Progress value={rider.successRatio * 100} className="h-2 [&>div]:bg-green-500" />
                     </div>
                     <div>
                        <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="flex items-center"><XCircle className="mr-2 text-red-500" /> Failed</span>
                            <span>{rider.failed} ({(rider.failRatio * 100).toFixed(1)}%)</span>
                        </div>
                        <Progress value={rider.failRatio * 100} className="h-2 [&>div]:bg-red-500" />
                     </div>
                     <div>
                        <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="flex items-center"><Undo className="mr-2 text-yellow-500" /> Returned</span>
                            <span>{rider.returned} ({(rider.returnRatio * 100).toFixed(1)}%)</span>
                        </div>
                        <Progress value={rider.returnRatio * 100} className="h-2 [&>div]:bg-yellow-500" />
                     </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
