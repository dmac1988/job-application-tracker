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
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export type User = {
  id: number;
  username: string;
  password: string;
};

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
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
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
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
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
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Something went wrong loading your data. Please restart the app.');
      }
      setLoaded(true);
    };

    void loadData();
  }, []);

  if (!loaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1E3A5F" />
        <Text style={styles.loadingText}>Loading your applications...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <AppContext.Provider
      value={{
        user, setUser,
        categories, setCategories,
        applications, setApplications,
        statusLogs, setStatusLogs,
        targets, setTargets,
      }}
    >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add" options={{ headerShown: true, title: 'Add Application' }} />
        <Stack.Screen name="settings" options={{ headerShown: true, title: 'Settings' }} />
        <Stack.Screen name="application/[id]" options={{ headerShown: true, title: 'Details' }} />
        <Stack.Screen name="application/[id]/edit" options={{ headerShown: true, title: 'Edit' }} />
      </Stack>
    </AppContext.Provider>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 15,
    marginTop: 12,
  },
  errorText: {
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    color: '#991B1B',
    fontSize: 15,
    lineHeight: 22,
    overflow: 'hidden',
    padding: 16,
    textAlign: 'center',
  },
});