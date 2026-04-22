import { db } from '@/db/client';
import { applications as applicationsTable, applicationStatusLogs as statusLogsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext, Application } from '../_layout';

export default function ApplicationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const context = useContext(AppContext);

  if (!context) return null;

  const { applications, setApplications, categories, statusLogs, setStatusLogs } = context;

  const application = applications.find(
    (a: Application) => a.id === Number(id)
  );

  if (!application) return null;

  const category = categories.find((c) => c.id === application.categoryId);
  const logs = statusLogs
    .filter((l) => l.applicationId === Number(id))
    .sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.id - a.id;
    });

  const latestStatus = logs.length > 0 ? logs[0].status : 'No status';

  const statusColour: Record<string, string> = {
    Applied: '#2563EB',
    Interviewing: '#D97706',
    Offered: '#059669',
    Rejected: '#DC2626',
    Withdrawn: '#7C3AED',
  };

  const deleteApplication = async () => {
    await db.delete(statusLogsTable).where(eq(statusLogsTable.applicationId, Number(id)));
    await db.delete(applicationsTable).where(eq(applicationsTable.id, Number(id)));

    const apps = await db.select().from(applicationsTable);
    const remainingLogs = await db.select().from(statusLogsTable);
    setApplications(apps);
    setStatusLogs(remainingLogs);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.company}>{application.company}</Text>
        <Text style={styles.role}>{application.role}</Text>

        <View style={styles.infoRow}>
          {category ? (
            <View style={[styles.tag, { backgroundColor: category.colour + '18' }]}>
              <Text style={[styles.tagText, { color: category.colour }]}>{category.name}</Text>
            </View>
          ) : null}
          <View style={styles.tag}>
            <Text style={styles.tagText}>{application.date}</Text>
          </View>
          <Text style={[styles.statusBadge, { color: statusColour[latestStatus] || '#64748B' }]}>
            {latestStatus}
          </Text>
        </View>

        {application.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{application.notes}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status History</Text>
          {logs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No status updates</Text>
              <Text style={styles.emptyMessage}>Tap Edit to add a status update.</Text>
            </View>
          ) : (
            logs.map((log, index) => (
              <View key={log.id} style={[styles.logRow, index === 0 && styles.logRowLatest]}>
                <Text style={[styles.logStatus, index === 0 && { color: statusColour[log.status] || '#374151' }]}>
                  {log.status}{index === 0 ? ' (latest)' : ''}
                </Text>
                <Text style={styles.logDate}>{log.date}</Text>
              </View>
            ))
          )}
        </View>

        <Pressable
          accessibilityLabel="Edit application"
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/application/[id]/edit', params: { id } })}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Edit</Text>
        </Pressable>

        <Pressable
          accessibilityLabel="Delete application"
          accessibilityRole="button"
          onPress={deleteApplication}
          style={styles.dangerButton}
        >
          <Text style={styles.dangerButtonText}>Delete</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F9FAFB',
    flex: 1,
    padding: 20,
  },
  company: {
    color: '#1A1A2E',
    fontSize: 26,
    fontWeight: '800',
  },
  role: {
    color: '#64748B',
    fontSize: 16,
    marginTop: 4,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  tag: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: '#1A1A2E',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  notes: {
    color: '#374151',
    fontSize: 15,
    lineHeight: 22,
  },
  emptyState: {
    paddingVertical: 12,
  },
  emptyTitle: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyMessage: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 4,
  },
  logRow: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    padding: 12,
  },
  logRowLatest: {
    borderColor: '#1E3A5F',
    borderWidth: 2,
  },
  logStatus: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
  },
  logDate: {
    color: '#64748B',
    fontSize: 14,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#1E3A5F',
    borderRadius: 8,
    marginTop: 24,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  dangerButton: {
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
    paddingVertical: 12,
  },
  dangerButtonText: {
    color: '#991B1B',
    fontSize: 15,
    fontWeight: '600',
  },
});