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
    .sort((a, b) => b.date.localeCompare(a.date));

  const latestStatus = logs.length > 0 ? logs[0].status : 'No status';

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
            <View style={[styles.tag, { backgroundColor: category.colour + '20' }]}>
              <Text style={[styles.tagText, { color: category.colour }]}>{category.name}</Text>
            </View>
          ) : null}
          <View style={styles.tag}>
            <Text style={styles.tagText}>{application.date}</Text>
          </View>
          <View style={[styles.tag, { backgroundColor: '#ECFDF5' }]}>
            <Text style={[styles.tagText, { color: '#059669' }]}>{latestStatus}</Text>
          </View>
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
            <Text style={styles.emptyText}>No status updates yet</Text>
          ) : (
            logs.map((log) => (
              <View key={log.id} style={styles.logRow}>
                <Text style={styles.logStatus}>{log.status}</Text>
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
    backgroundColor: '#F8FAFC',
    flex: 1,
    padding: 20,
  },
  company: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '700',
  },
  role: {
    color: '#6B7280',
    fontSize: 16,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  tag: {
    backgroundColor: '#EFF6FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  notes: {
    color: '#374151',
    fontSize: 15,
    lineHeight: 22,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
  },
  logRow: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    padding: 12,
  },
  logStatus: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
  },
  logDate: {
    color: '#6B7280',
    fontSize: 14,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#0F766E',
    borderRadius: 10,
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
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 10,
    paddingVertical: 12,
  },
  dangerButtonText: {
    color: '#7F1D1D',
    fontSize: 15,
    fontWeight: '600',
  },
});