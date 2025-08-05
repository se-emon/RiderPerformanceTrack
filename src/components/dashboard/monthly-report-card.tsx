
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function MonthlyReportCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Report</CardTitle>
        <CardDescription>View detailed performance reports and rankings for any month.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link href="/report">
            View Reports <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
