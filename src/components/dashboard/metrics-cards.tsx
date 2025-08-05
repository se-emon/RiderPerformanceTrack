
"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Undo2, Users } from "lucide-react";
import type { Entry, Rider } from "@/lib/types";
import { formatRatio } from '@/lib/utils';

type MetricsCardsProps = {
  entries: Entry[];
  riders: Rider[];
};

export function MetricsCards({ entries, riders }: MetricsCardsProps) {
  const metrics = useMemo(() => {
    if (entries.length === 0) {
      return { totalDeliveries: 0, successRatio: 0, failedRatio: 0, returnRatio: 0, activeRiders: 0 };
    }
    const totalSuccessful = entries.reduce((acc, entry) => acc + entry.successful, 0);
    const totalFailed = entries.reduce((acc, entry) => acc + entry.failed, 0);
    const totalReturned = entries.reduce((acc, entry) => acc + entry.returned, 0);
    const totalDeliveries = totalSuccessful + totalFailed + totalReturned;

    return {
      totalDeliveries,
      successRatio: totalDeliveries > 0 ? totalSuccessful / totalDeliveries : 0,
      failedRatio: totalDeliveries > 0 ? totalFailed / totalDeliveries : 0,
      returnRatio: totalDeliveries > 0 ? totalReturned / totalDeliveries : 0,
      activeRiders: riders.length,
    };
  }, [entries, riders]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Ratio</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatRatio(metrics.successRatio)}</div>
          <p className="text-xs text-muted-foreground">Overall delivery success</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Failed Ratio</CardTitle>
          <Undo2 className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatRatio(metrics.failedRatio)}</div>
          <p className="text-xs text-muted-foreground">Overall delivery failures</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Return Ratio</CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatRatio(metrics.returnRatio)}</div>
          <p className="text-xs text-muted-foreground">Overall item returns</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Riders</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.activeRiders}</div>
          <p className="text-xs text-muted-foreground">Total active riders in team</p>
        </CardContent>
      </Card>
    </div>
  );
}
