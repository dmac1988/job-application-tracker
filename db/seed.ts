import { db } from './client';
import { applications, applicationStatusLogs, categories, targets } from './schema';

export async function seedIfEmpty() {
  const existing = await db.select().from(categories);
  if (existing.length > 0) return;

  await db.insert(categories).values([
    { name: 'Frontend', colour: '#3B82F6' },
    { name: 'Backend', colour: '#10B981' },
    { name: 'Data', colour: '#F59E0B' },
    { name: 'DevOps', colour: '#8B5CF6' },
  ]);

  await db.insert(applications).values([
    { company: 'Google', role: 'Frontend Engineer', date: '2026-03-01', categoryId: 1, count: 1, notes: 'Referral from friend' },
    { company: 'Stripe', role: 'Backend Developer', date: '2026-03-05', categoryId: 2, count: 1, notes: '' },
    { company: 'Datadog', role: 'Data Analyst', date: '2026-03-10', categoryId: 3, count: 1, notes: 'Found on LinkedIn' },
    { company: 'Amazon', role: 'DevOps Engineer', date: '2026-03-15', categoryId: 4, count: 1, notes: '' },
    { company: 'Meta', role: 'React Developer', date: '2026-03-20', categoryId: 1, count: 1, notes: 'Applied through careers page' },
    { company: 'Shopify', role: 'Full Stack Dev', date: '2026-04-01', categoryId: 2, count: 1, notes: '' },
  ]);

  await db.insert(applicationStatusLogs).values([
    { applicationId: 1, status: 'Applied', date: '2026-03-01' },
    { applicationId: 1, status: 'Interviewing', date: '2026-03-10' },
    { applicationId: 2, status: 'Applied', date: '2026-03-05' },
    { applicationId: 2, status: 'Rejected', date: '2026-03-20' },
    { applicationId: 3, status: 'Applied', date: '2026-03-10' },
    { applicationId: 4, status: 'Applied', date: '2026-03-15' },
    { applicationId: 4, status: 'Interviewing', date: '2026-03-25' },
    { applicationId: 4, status: 'Offered', date: '2026-04-05' },
    { applicationId: 5, status: 'Applied', date: '2026-03-20' },
    { applicationId: 6, status: 'Applied', date: '2026-04-01' },
  ]);

  await db.insert(targets).values([
    { period: 'weekly', goal: 5, categoryId: null },
    { period: 'monthly', goal: 15, categoryId: null },
    { period: 'weekly', goal: 2, categoryId: 1 },
  ]);
}