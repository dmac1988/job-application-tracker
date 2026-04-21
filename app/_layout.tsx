import { db } from '@/db/client';
import {
  applications as applicationsTable,
  categories as categoriesTable,
  applicationStatusLogs as statusLogsTable,
  targets as targetsTable,
} from '@/db/schema';
import { seedIfEmpty } from '@/db/seed';
import { Stack } from 'expo-router';
import { createContext, useEffect, useState } from 'react';

export type Category = {
  id: number;
  name: string;
  colour: string;
};

export type Application = {
  id: number;
  company: string;
  role: string;
  date: string;
  categoryId: number;
  count: number;
  notes: string | null;
};

export type StatusLog = {
  id: number;
  applicationId: number;
  status: string;
  date: string;
};

export type Target = {
  id: number;
  period: string;
  goal: number;
  categoryId: number | null;
};

type AppContextType = {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  statusLogs: StatusLog[];
  setStatusLogs: React.Dispatch<React.SetStateAction<StatusLog[]>>;
  targets: Target[];
  setTargets: React.Dispatch<React.SetStateAction<Target[]>>;
};

export const AppContext = createContext<AppContextType | null>(null);

export default function RootLayout() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [statusLogs, setStatusLogs] = useState<StatusLog[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        await seedIfEmpty();
        const cats = await db.select().from(categoriesTable);
        const apps = await db.select().from(applicationsTable);
        const logs = await db.select().from(statusLogsTable);
        const tgts = await db.select().from(targetsTable);
        setCategories(cats);
        setApplications(apps);
        setStatusLogs(logs);
        setTargets(tgts);
        console.log('Data loaded:', cats.length, 'categories,', apps.length, 'applications');
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    void loadData();
  }, []);

  return (
    <AppContext.Provider
      value={{
        categories, setCategories,
        applications, setApplications,
        statusLogs, setStatusLogs,
        targets, setTargets,
      }}
    >
      <Stack />
    </AppContext.Provider>
  );
}