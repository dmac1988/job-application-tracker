import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

const sqlite = openDatabaseSync('jobtracker.db');

sqlite.execSync(
  'CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, colour TEXT NOT NULL DEFAULT \'#3B82F6\');'
);

sqlite.execSync(
  'CREATE TABLE IF NOT EXISTS applications (id INTEGER PRIMARY KEY AUTOINCREMENT, company TEXT NOT NULL, role TEXT NOT NULL, date TEXT NOT NULL, category_id INTEGER NOT NULL, count INTEGER NOT NULL DEFAULT 1, notes TEXT DEFAULT \'\');'
);

sqlite.execSync(
  'CREATE TABLE IF NOT EXISTS application_status_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, application_id INTEGER NOT NULL, date TEXT NOT NULL, status TEXT NOT NULL);'
);

sqlite.execSync(
  'CREATE TABLE IF NOT EXISTS targets (id INTEGER PRIMARY KEY AUTOINCREMENT, period TEXT NOT NULL, goal INTEGER NOT NULL, category_id INTEGER);'
);

export const db = drizzle(sqlite);