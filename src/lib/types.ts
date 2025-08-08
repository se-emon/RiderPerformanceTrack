export type Rider = {
  id: string;
  name: string;
};

export type Entry = {
  id: string;
  date: Date;
  riderId: string;
  successful: number;
  failed: number;
  returned: number;
};

export type EnrichedEntry = Entry & {
  riderName: string;
  total: number;
  successRatio: number;
  failRatio: number;
  returnRatio: number;
};

export type RiderStats = {
  riderId: string;
  riderName: string;
  successful: number;
  failed: number;
  returned: number;
  total: number;
  successRatio: number;
  failRatio: number;
  returnRatio: number;
  activeDays: number;
};

export type ReportData = {
  riderStats: RiderStats[];
  totalEntries: number;
  month: string;
  year: string;
};

    