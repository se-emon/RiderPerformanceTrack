"use client";

import { useState, useEffect } from 'react';
import type { Entry } from '@/lib/types';
import { initialEntries, riders } from '@/lib/data';
import { Header } from '@/components/dashboard/header';
import { MetricsCards } from '@/components/dashboard/metrics-cards';
import { EntriesTable } from '@/components/dashboard/entries-table';
import { SubmissionChart } from '@/components/dashboard/submission-chart';
import { MonthlyReportCard } from '@/components/dashboard/monthly-report-card';
import { EntryForm } from '@/components/dashboard/entry-form';

export default function DashboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setEntries(initialEntries);
  }, []);


  const handleAddEntry = (newEntryData: Omit<Entry, 'id' | 'date'> & { date: Date }) => {
    const newEntry: Entry = {
      ...newEntryData,
      id: `${newEntryData.date.getTime()}-${newEntryData.riderId}`,
    };
    setEntries(prevEntries => [newEntry, ...prevEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setIsFormOpen(false);
  };

  if (!isClient) {
    // Render a loading state or nothing on the server to avoid hydration mismatch
    return null;
  }

  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <Header onAddEntry={() => setIsFormOpen(true)} />
          <MetricsCards entries={entries} riders={riders} />
          <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <EntriesTable allEntries={entries} riders={riders} />
            </div>
            <div className="flex flex-col gap-4 md:gap-8">
              <SubmissionChart entries={entries} />
              <MonthlyReportCard entries={entries} riders={riders} />
            </div>
          </div>
        </main>
      </div>
      <EntryForm 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        riders={riders} 
        onAddEntry={handleAddEntry} 
      />
    </>
  );
}
