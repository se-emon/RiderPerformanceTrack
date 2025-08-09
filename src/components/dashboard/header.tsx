
"use client";

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type HeaderProps = {
  onAddEntry: () => void;
};

export function Header({ onAddEntry }: HeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold text-foreground">Dashbor</h1>
      <div className="flex items-center space-x-2">
        <Button onClick={onAddEntry}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Entry
        </Button>
      </div>
    </div>
  );
}
