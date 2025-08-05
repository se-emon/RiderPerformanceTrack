
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
import { DeleteConfirmationDialog } from '@/components/dashboard/delete-confirmation-dialog';
import { PasswordDialog } from '@/components/dashboard/password-dialog';

export default function DashboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [isEntryFormOpen, setIsEntryFormOpen] = useState(false);
  const [isRiderFormOpen, setIsRiderFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<Entry | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'edit' | 'delete'; entry: Entry } | null>(null);


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
  
  const handleOpenAddEntryForm = () => {
    setEditingEntry(null);
    setIsEntryFormOpen(true);
  };
  
  const handleOpenEditEntryForm = (entry: Entry) => {
    setPendingAction({ type: 'edit', entry });
    setIsPasswordDialogOpen(true);
  };
  
  const handleOpenDeleteDialog = (entry: Entry) => {
    setPendingAction({ type: 'delete', entry });
    setIsPasswordDialogOpen(true);
  };

  const handlePasswordSubmit = (password: string) => {
    if (password === '1234') {
        setIsPasswordDialogOpen(false);
        if (pendingAction?.type === 'edit') {
            setEditingEntry(pendingAction.entry);
            setIsEntryFormOpen(true);
        } else if (pendingAction?.type === 'delete') {
            setDeletingEntry(pendingAction.entry);
        }
        setPendingAction(null);
    } else {
        alert('Incorrect password');
    }
  };

  const handleSaveEntry = (entryData: Omit<Entry, 'id'> | Entry) => {
    const entryDate = new Date(entryData.date);
    entryDate.setHours(0, 0, 0, 0);
    const processedEntryData = { ...entryData, date: entryDate };
    
    if ('id' in processedEntryData) {
      // Editing existing entry
      setEntries(prevEntries => prevEntries.map(e => e.id === processedEntryData.id ? processedEntryData : e).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } else {
      // Adding new entry
      const newEntry: Entry = {
        ...processedEntryData,
        id: `${(processedEntryData.date as Date).getTime()}-${processedEntryData.riderId}`,
      };
      setEntries(prevEntries => [newEntry, ...prevEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
    setIsEntryFormOpen(false);
    setEditingEntry(null);
  };

  const handleDeleteEntry = () => {
    if (deletingEntry) {
      setEntries(prevEntries => prevEntries.filter(entry => entry.id !== deletingEntry.id));
      setDeletingEntry(null);
    }
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
          <Header onAddEntry={handleOpenAddEntryForm} />
          <MetricsCards entries={entries} riders={riders} />
          <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <EntriesTable allEntries={entries} riders={riders} onEdit={handleOpenEditEntryForm} onDelete={handleOpenDeleteDialog} />
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
        onSaveEntry={handleSaveEntry}
        entryToEdit={editingEntry}
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
      <DeleteConfirmationDialog
        isOpen={!!deletingEntry}
        onOpenChange={() => setDeletingEntry(null)}
        onConfirm={handleDeleteEntry}
      />
      <PasswordDialog
        isOpen={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        onSubmit={handlePasswordSubmit}
       />
    </>
  );
}
