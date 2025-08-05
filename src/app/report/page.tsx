"use client";

import { useState, useEffect } from 'react';
import type { Entry, Rider, ReportData, RiderStats } from '@/lib/types';
import { initialEntries, initialRiders } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Trophy, CheckCircle, XCircle, Undo, CalendarDays, ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { generateReport } from '@/ai/flows/report-insights-flow';

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
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
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
    setGeneratedDate(`${months.find(m => m.value === month)?.label} ${year}`);
    setIsLoading(false);
  };
  
  const months = [
      {value: "1", label: "January"}, {value: "2", label: "February"}, {value: "3", label: "March"},
      {value: "4", label: "April"}, {value: "5", label: "May"}, {value: "6", label: "June"},
      {value: "7", label: "July"}, {value: "8", label: "August"}, {value: "9", label: "September"},
      {value: "10", label: "October"}, {value: "11", label: "November"}, {value: "12", label: "December"}
  ];
  
  if (!isClient) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-2xl font-semibold">Loading Report Page...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-background border-b sticky top-0 z-30">
         <div className="container mx-auto flex items-center h-16 px-4 md:px-6">
          <Button asChild variant="outline" size="icon" className="h-8 w-8">
              <Link href="/">
                <ArrowLeft className="h-4 w-4"/>
                <span className="sr-only">Back to Dashboard</span>
              </Link>
          </Button>
          <h1 className="text-xl font-semibold ml-4">Monthly Performance Report</h1>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Report Generator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div className="grid gap-1.5">
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
                <div className="grid gap-1.5">
                    <Label htmlFor="year-input">Year</Label>
                    <Input id="year-input" type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year"/>
                </div>
                <div className="flex items-center space-x-2 pt-2 self-center">
                    <Checkbox id="top-10" checked={showTop10} onCheckedChange={(checked) => setShowTop10(Boolean(checked))} />
                    <Label htmlFor="top-10" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Show Top 10
                    </Label>
                </div>
                <Button onClick={handleGenerateReport} disabled={isLoading} className="w-full lg:w-auto lg:col-span-2">
                  {isLoading ? 'Generating...' : 'Generate Report'}
                </Button>
            </div>
          </CardContent>
        </Card>

        {reportData.length > 0 && (
          <div className="p-4 rounded-lg h-full">
              <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-2">
                  <h2 className="text-2xl font-bold flex items-center">
                      <Trophy className="mr-3 h-6 w-6 text-yellow-500" />
                      Top Performers
                      <Badge variant="secondary" className="text-lg ml-3">{generatedDate}</Badge>
                  </h2>
                   <div className="text-lg font-medium text-muted-foreground self-start md:self-center">
                    {totalMonthEntries} total entries
                   </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {reportData.map((rider, index) => (
                  <Card key={rider.riderId} className="shadow-sm hover:shadow-lg transition-shadow">
                  <CardHeader>
                      <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-3">
                              <Badge className="h-8 w-8 flex-shrink-0 flex items-center justify-center text-lg rounded-full">{index + 1}</Badge>
                              <CardTitle className="text-xl font-bold truncate">{rider.riderName}</CardTitle>
                          </div>
                          <Badge variant="outline" className="text-sm font-normal flex items-center gap-1">
                            <CalendarDays className="h-4 w-4" /> {rider.activeDays} Days
                          </Badge>
                      </div>
                      <div className="text-right">
                        <Badge variant="default" className="text-md">Total: {rider.total}</Badge>
                      </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                      <div>
                          <div className="flex justify-between items-center mb-1 text-sm font-medium">
                              <span className="flex items-center text-green-600"><CheckCircle className="mr-2" /> Success</span>
                              <span>{rider.successful} ({(rider.successRatio * 100).toFixed(1)}%)</span>
                          </div>
                          <Progress value={rider.successRatio * 100} className="h-2 [&>div]:bg-green-500" />
                      </div>
                      <div>
                          <div className="flex justify-between items-center mb-1 text-sm font-medium">
                              <span className="flex items-center text-yellow-600"><Undo className="mr-2" /> Failed</span>
                              <span>{rider.failed} ({(rider.failRatio * 100).toFixed(1)}%)</span>
                          </div>
                          <Progress value={rider.failRatio * 100} className="h-2 [&>div]:bg-yellow-500" />
                      </div>
                      <div>
                          <div className="flex justify-between items-center mb-1 text-sm font-medium">
                              <span className="flex items-center text-red-600"><XCircle className="mr-2" /> Returned</span>
                              <span>{rider.returned} ({(rider.returnRatio * 100).toFixed(1)}%)</span>
                          </div>
                          <Progress value={rider.returnRatio * 100} className="h-2 [&>div]:bg-red-500" />
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
