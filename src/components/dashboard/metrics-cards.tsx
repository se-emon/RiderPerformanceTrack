
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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base font-normal">
            Success Ratio <CheckCircle2 className="h-5 w-5 text-green-500" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatRatio(metrics.successRatio)}</p>
          <p className="text-xs text-muted-foreground">Overall delivery success</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base font-normal">
            Failed Ratio <Undo2 className="h-5 w-5 text-yellow-500" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatRatio(metrics.failedRatio)}</p>
          <p className="text-xs text-muted-foreground">Overall delivery failures</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base font-normal">
            Return Ratio <XCircle className="h-5 w-5 text-red-500" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatRatio(metrics.returnRatio)}</p>
          <p className="text-xs text-muted-foreground">Overall item returns</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base font-normal">
            Total Riders <Users className="h-5 w-5 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{metrics.activeRiders}</p>
          <p className="text-xs text-muted-foreground">Total active riders in team</p>
        </CardContent>
      </Card>
    </>
  );
}
