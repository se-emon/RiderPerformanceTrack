
"use client";

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type HeaderProps = {
  onAddEntry: () => void;
};

export function Header({ onAddEntry }: HeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">RiderPerformanceTrack</h1>
      <div className="flex items-center space-x-2">
        <Button onClick={onAddEntry} className="transition-transform active:scale-95">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Entry
        </Button>
      </div>
    </div>
  );
}
