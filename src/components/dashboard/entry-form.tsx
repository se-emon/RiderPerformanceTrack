"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { Rider, Entry } from "@/lib/types";

const formSchema = z.object({
  date: z.date({ required_error: "A date is required." }),
  riderId: z.string({ required_error: "Please select a rider." }),
  successful: z.coerce.number().min(0, "Cannot be negative."),
  failed: z.coerce.number().min(0, "Cannot be negative."),
  returned: z.coerce.number().min(0, "Cannot be negative."),
});

type EntryFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  riders: Rider[];
  onAddEntry: (data: Omit<Entry, 'id'>) => void;
};

export function EntryForm({ isOpen, onOpenChange, riders, onAddEntry }: EntryFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      successful: 0,
      failed: 0,
      returned: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddEntry(values);
    form.reset();
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Daily Entry</SheetTitle>
          <SheetDescription>
            Record a rider's performance for a specific day. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="riderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rider Name</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a rider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {riders.map(rider => (
                        <SelectItem key={rider.id} value={rider.id}>{rider.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="successful"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Successful Deliveries</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 45" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="failed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Failed Deliveries</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="returned"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Returned Deliveries</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </SheetClose>
              <Button type="submit">Save Entry</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
