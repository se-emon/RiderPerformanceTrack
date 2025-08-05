
"use client";

import { useState, useEffect } from 'react';
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
import type { ReportData, RiderStats } from '@/lib/types';
import { generateReport, getReportInsights } from '@/ai/flows/report-insights-flow';
import { ReportInsights } from '@/components/report/report-insights';


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
  const [insights, setInsights] = useState<string>('');
  const [isLoadingInsights, setIsLoadingInsights] = useState<boolean>(false);

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

  const handleGenerateReport = async () => {
    setInsights('');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    const monthEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= endDate;
    });
    
    const generatedReport = await generateReport({
        entries: monthEntries,
        riders,
        topN: showTop10 ? 10 : 6
    });

    setReportData(generatedReport.riderStats);
    setTotalMonthEntries(generatedReport.totalEntries);
    setGeneratedDate(`${month}/${year}`);

    if (generatedReport.riderStats.length > 0) {
        setIsLoadingInsights(true);
        const aiInsights = await getReportInsights(generatedReport);
        setInsights(aiInsights);
        setIsLoadingInsights(false);
    }
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <div className="bg-muted/20 p-4 rounded-lg h-full">
                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-2">
                        <h2 className="text-xl md:text-2xl font-bold flex items-center">
                            <Trophy className="mr-2 text-yellow-500" />
                            {reportData.length} Top Performers
                            {totalMonthEntries > 0 && <span className="text-base md:text-lg font-medium text-muted-foreground ml-2">({totalMonthEntries} total entries)</span>}
                        </h2>
                        <Badge variant="secondary" className="text-base md:text-lg self-start md:self-center">{generatedDate}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {reportData.map((rider, index) => (
                        <Card key={rider.riderId} className="shadow-md hover:shadow-xl transition-shadow bg-card">
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                <div className="flex items-center gap-3">
                                    <Badge className="h-8 w-8 flex-shrink-0 flex items-center justify-center text-lg rounded-full">{index + 1}</Badge>
                                    <CardTitle className="text-xl font-bold truncate">{rider.riderName}</CardTitle>
                                </div>
                                <Badge variant="default" className="text-md self-start sm:self-center">Total: {rider.total}</Badge>
                            </div>
                            <div className="flex justify-end">
                            <Badge variant="outline" className="text-sm font-normal flex items-center gap-1">
                                <CalendarDays className="h-4 w-4" /> {rider.activeDays} Active Days
                                </Badge>
                            </div>
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
                                    <span className="flex items-center"><Undo className="mr-2 text-yellow-500" /> Failed</span>
                                    <span>{rider.failed} ({(rider.failRatio * 100).toFixed(1)}%)</span>
                                </div>
                                <Progress value={rider.failRatio * 100} className="h-2 [&>div]:bg-yellow-500" />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1 text-sm">
                                    <span className="flex items-center"><XCircle className="mr-2 text-red-500" /> Returned</span>
                                    <span>{rider.returned} ({(rider.returnRatio * 100).toFixed(1)}%)</span>
                                </div>
                                <Progress value={rider.returnRatio * 100} className="h-2 [&>div]:bg-red-500" />
                            </div>
                        </CardContent>
                        </Card>
                    ))}
                    </div>
                </div>
            </div>
            <div className="lg:col-span-1">
                <ReportInsights insights={insights} isLoading={isLoadingInsights} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

    