
"use client";

import { useState, useEffect } from 'react';
import type { Entry, Rider } from '@/lib/types';
import { initialEntries, initialRiders } from '@/lib/data';
import { Header } from '@/components/dashboard/header';
import { MetricsCards } from '@/components/dashboard/metrics-cards';
import { EntriesTable } from '@/components/dashboard/entries-table';
import { MonthlyReportCard } from '@/components/dashboard/monthly-report-card';
import { EntryForm } from '@/components/dashboard/entry-form';
import { RiderForm } from '@/components/dashboard/rider-form';

export default function DashboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [isEntryFormOpen, setIsEntryFormOpen] = useState(false);
  const [isRiderFormOpen, setIsRiderFormOpen] = useState(false);
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

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('dashboardEntries', JSON.stringify(entries));
    }
  }, [entries, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('dashboardRiders', JSON.stringify(riders));
    }
  }, [riders, isClient]);

  const handleAddEntry = (newEntryData: Omit<Entry, 'id' | 'date'> & { date: Date }) => {
    const newEntry: Entry = {
      ...newEntryData,
      id: `${newEntryData.date.getTime()}-${newEntryData.riderId}`,
    };
    setEntries(prevEntries => [newEntry, ...prevEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setIsEntryFormOpen(false);
  };

  const handleAddRider = (riderName: string) => {
    const newRider: Rider = {
      id: (riders.length + 1).toString(),
      name: riderName,
    };
    setRiders(prevRiders => [...prevRiders, newRider]);
    setIsRiderFormOpen(false);
  };

  if (!isClient) {
    return null;
  }

  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <Header onAddEntry={() => setIsEntryFormOpen(true)} />
          <MetricsCards entries={entries} riders={riders} />
          <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <EntriesTable allEntries={entries} riders={riders} />
            </div>
            <div className="flex flex-col gap-4 md:gap-8">
              <MonthlyReportCard />
            </div>
          </div>
        </main>
      </div>
      <EntryForm 
        isOpen={isEntryFormOpen} 
        onOpenChange={setIsEntryFormOpen} 
        riders={riders} 
        onAddEntry={handleAddEntry}
        onAddNewRider={() => {
          setIsEntryFormOpen(false);
          setIsRiderFormOpen(true);
        }}
      />
      <RiderForm
        isOpen={isRiderFormOpen}
        onOpenChange={setIsRiderFormOpen}
        onAddRider={handleAddRider}
      />
    </>
  );
}
