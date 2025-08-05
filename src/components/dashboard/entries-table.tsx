"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from "date-fns";
import { Calendar as CalendarIcon, Filter, RotateCw } from 'lucide-react';
import type { Rider, Entry, EnrichedEntry } from '@/lib/types';
import { formatRatio } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type EntriesTableProps = {
  allEntries: Entry[];
  riders: Rider[];
};

type Filters = {
  riderId: string | null;
  startDate: Date | null;
  endDate: Date | null;
};

export function EntriesTable({ allEntries, riders }: EntriesTableProps) {
  const [filters, setFilters] = useState<Filters>({ riderId: null, startDate: null, endDate: null });

  const riderMap = useMemo(() => new Map(riders.map(r => [r.id, r.name])), [riders]);

  const filteredEntries = useMemo(() => {
    return allEntries
      .map(entry => {
        const total = entry.successful + entry.failed + entry.returned;
        return {
          ...entry,
          riderName: riderMap.get(entry.riderId) ?? 'Unknown Rider',
          total,
          successRatio: total > 0 ? entry.successful / total : 0,
          failRatio: total > 0 ? entry.failed / total : 0,
          returnRatio: total > 0 ? entry.returned / total : 0,
        };
      })
      .filter(entry => {
        const date = new Date(entry.date);
        const startDateMatch = !filters.startDate || date >= filters.startDate;
        const endDateMatch = !filters.endDate || date <= filters.endDate;
        const riderMatch = !filters.riderId || entry.riderId === filters.riderId;
        return startDateMatch && endDateMatch && riderMatch;
      });
  }, [allEntries, filters, riderMap]);
  
  const today = new Date();
  today.setHours(0,0,0,0);

  const resetFilters = () => {
    setFilters({ riderId: null, startDate: null, endDate: null });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Entries</CardTitle>
        <CardDescription>View and filter daily rider performance records.</CardDescription>
        <div className="flex flex-wrap items-center gap-2 pt-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.startDate ? format(filters.startDate, "PPP") : <span>Start Date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={filters.startDate} onSelect={(d) => setFilters(f => ({...f, startDate: d || null}))} initialFocus />
            </PopoverContent>
          </Popover>
           <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.endDate ? format(filters.endDate, "PPP") : <span>End Date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={filters.endDate} onSelect={(d) => setFilters(f => ({...f, endDate: d || null}))} initialFocus />
            </PopoverContent>
          </Popover>
          <Select onValueChange={(val) => setFilters(f => ({...f, riderId: val === 'all' ? null : val}))} value={filters.riderId || 'all'}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by Rider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Riders</SelectItem>
              {riders.map(rider => <SelectItem key={rider.id} value={rider.id}>{rider.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={resetFilters} variant="ghost">
            <RotateCw className="mr-2 h-4 w-4" /> Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Rider</TableHead>
                <TableHead className="text-right">Delivered</TableHead>
                <TableHead className="text-right">Failed</TableHead>
                <TableHead className="text-right">Returned</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Success %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {format(entry.date, "MMM d, yyyy")}
                      {entry.date.getTime() === today.getTime() && <Badge variant="outline" className="ml-2 bg-accent/50">Today</Badge>}
                    </TableCell>
                    <TableCell>{entry.riderName}</TableCell>
                    <TableCell className="text-right text-green-600 dark:text-green-400">{entry.successful}</TableCell>
                    <TableCell className="text-right text-red-600 dark:text-red-400">{entry.failed}</TableCell>
                    <TableCell className="text-right text-yellow-600 dark:text-yellow-400">{entry.returned}</TableCell>
                    <TableCell className="text-right font-medium">{entry.total}</TableCell>
                    <TableCell className="text-right">{formatRatio(entry.successRatio)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No entries found for the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
