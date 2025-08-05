
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon, RotateCw, ChevronLeft, ChevronRight, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { Rider, Entry } from '@/lib/types';
import { formatRatio } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


type EntriesTableProps = {
  allEntries: Entry[];
  riders: Rider[];
  onEdit: (entry: Entry) => void;
  onDelete: (entry: Entry) => void;
};

type Filters = {
  riderId: string | null;
  dateRange: DateRange | undefined;
};

const ENTRIES_PER_PAGE = 10;

export function EntriesTable({ allEntries, riders, onEdit, onDelete }: EntriesTableProps) {
  const [filters, setFilters] = useState<Filters>({ riderId: null, dateRange: undefined });
  const [currentPage, setCurrentPage] = useState(1);

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
        const startDateMatch = !filters.dateRange?.from || date >= filters.dateRange.from;
        const endDateMatch = !filters.dateRange?.to || date <= filters.dateRange.to;
        const riderMatch = !filters.riderId || entry.riderId === filters.riderId;
        return startDateMatch && endDateMatch && riderMatch;
      });
  }, [allEntries, filters, riderMap]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const totalPages = Math.ceil(filteredEntries.length / ENTRIES_PER_PAGE);

  const paginatedEntries = useMemo(() => {
    const startIndex = (currentPage - 1) * ENTRIES_PER_PAGE;
    return filteredEntries.slice(startIndex, startIndex + ENTRIES_PER_PAGE);
  }, [filteredEntries, currentPage]);
  
  const today = new Date();
  today.setHours(0,0,0,0);

  const resetFilters = () => {
    setFilters({ riderId: null, dateRange: undefined });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Entries</CardTitle>
        <CardDescription>View and filter daily rider performance records.</CardDescription>
        <div className="flex flex-col md:flex-row md:items-center gap-2 pt-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full md:w-auto justify-start text-left font-normal",
                  !filters.dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange?.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                      {format(filters.dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(filters.dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={filters.dateRange?.from}
                selected={filters.dateRange}
                onSelect={(range) => setFilters(f => ({...f, dateRange: range}))}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Select onValueChange={(val) => setFilters(f => ({...f, riderId: val === 'all' ? null : val}))} value={filters.riderId || 'all'}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by Rider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Riders</SelectItem>
              {riders.map(rider => <SelectItem key={rider.id} value={rider.id}>{rider.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={resetFilters} variant="ghost" className="w-full md:w-auto">
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEntries.length > 0 ? (
                paginatedEntries.map((entry) => (
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
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onSelect={() => onEdit(entry)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => onDelete(entry)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No entries found for the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
            <div>
                Showing page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                </Button>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>
        </div>
      </CardFooter>
    </Card>
  );
}
