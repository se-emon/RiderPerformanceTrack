
"use client";

import { useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Undo2, Users, ArrowUp, ArrowDown } from "lucide-react";
import type { Entry, Rider } from "@/lib/types";
import { formatRatio } from '@/lib/utils';

type MetricsCardsProps = {
  entries: Entry[];
  riders: Rider[];
};

export function MetricsCards({ entries, riders }: MetricsCardsProps) {
  const metrics = useMemo(() => {
    if (entries.length === 0) {
      return { successRatio: 0, failedRatio: 0, returnRatio: 0 };
    }
    const totalSuccessful = entries.reduce((acc, entry) => acc + entry.successful, 0);
    const totalFailed = entries.reduce((acc, entry) => acc + entry.failed, 0);
    const totalReturned = entries.reduce((acc, entry) => acc + entry.returned, 0);
    const totalDeliveries = totalSuccessful + totalFailed + totalReturned;

    return {
      successRatio: totalDeliveries > 0 ? totalSuccessful / totalDeliveries : 0,
      failedRatio: totalDeliveries > 0 ? totalFailed / totalDeliveries : 0,
      returnRatio: totalDeliveries > 0 ? totalReturned / totalDeliveries : 0,
    };
  }, [entries]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-4 flex flex-col justify-between hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-muted-foreground">Success Ratio</p>
          <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-3xl font-bold text-foreground">{formatRatio(metrics.successRatio)}</p>
          <p className="text-xs text-muted-foreground">Overall delivery success</p>
        </div>
      </Card>
      <Card className="p-4 flex flex-col justify-between hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-muted-foreground">Failed Ratio</p>
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
            <Undo2 className="h-5 w-5 text-yellow-500" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-3xl font-bold text-foreground">{formatRatio(metrics.failedRatio)}</p>
          <p className="text-xs text-muted-foreground">Overall delivery failures</p>
        </div>
      </Card>
      <Card className="p-4 flex flex-col justify-between hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-muted-foreground">Return Ratio</p>
          <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
            <XCircle className="h-5 w-5 text-red-500" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-3xl font-bold text-foreground">{formatRatio(metrics.returnRatio)}</p>
          <p className="text-xs text-muted-foreground">Overall item returns</p>
        </div>
      </Card>
      <Card className="p-4 flex flex-col justify-between hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-muted-foreground">Total Riders</p>
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
            <Users className="h-5 w-5 text-blue-500" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-3xl font-bold text-foreground">{riders.length}</p>
          <p className="text-xs text-muted-foreground">Total active riders</p>
        </div>
      </Card>
    </div>
  );
}
