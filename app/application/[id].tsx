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

  const { applications, setApplications, categories, statusLogs, setStatusLogs, colors } = context;

  const application = applications.find((a: Application) => a.id === Number(id));
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
    Applied: '#2563EB', Interviewing: '#D97706', Offered: '#059669', Rejected: '#DC2626', Withdrawn: '#7C3AED',
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.company, { color: colors.text }]}>{application.company}</Text>
        <Text style={[styles.role, { color: colors.textSecondary }]}>{application.role}</Text>

        <View style={styles.infoRow}>
          {category ? (
            <View style={[styles.tag, { backgroundColor: category.colour + '18' }]}>
              <Text style={[styles.tagText, { color: category.colour }]}>{category.name}</Text>
            </View>
          ) : null}
          <View style={[styles.tag, { backgroundColor: colors.card }]}>
            <Text style={[styles.tagText, { color: colors.textSecondary }]}>{application.date}</Text>
          </View>
          <Text style={[styles.statusBadge, { color: statusColour[latestStatus] || colors.textSecondary }]}>{latestStatus}</Text>
        </View>

        {application.notes ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Notes</Text>
            <Text style={[styles.notes, { color: colors.text }]}>{application.notes}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Status History</Text>
          {logs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No status updates</Text>
              <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>Tap Edit to add a status update.</Text>
            </View>
          ) : (
            logs.map((log, index) => (
              <View key={log.id} style={[styles.logRow, { backgroundColor: colors.card, borderColor: colors.border }, index === 0 && { borderColor: colors.primary, borderWidth: 2 }]}>
                <Text style={[styles.logStatus, { color: index === 0 ? (statusColour[log.status] || colors.text) : colors.text }]}>
                  {log.status}{index === 0 ? ' (latest)' : ''}
                </Text>
                <Text style={[styles.logDate, { color: colors.textSecondary }]}>{log.date}</Text>
              </View>
            ))
          )}
        </View>

        <Pressable
          accessibilityLabel="Edit application"
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/application/[id]/edit', params: { id } })}
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.primaryButtonText, { color: colors.primaryText }]}>Edit</Text>
        </Pressable>

        <Pressable
          accessibilityLabel="Delete application"
          accessibilityRole="button"
          onPress={deleteApplication}
          style={[styles.dangerButton, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}
        >
          <Text style={[styles.dangerButtonText, { color: colors.danger }]}>Delete</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, padding: 20 },
  company: { fontSize: 26, fontWeight: '800' },
  role: { fontSize: 16, marginTop: 4 },
  infoRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  tag: { borderRadius: 4, paddingHorizontal: 10, paddingVertical: 5 },
  tagText: { fontSize: 12, fontWeight: '600' },
  statusBadge: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  notes: { fontSize: 15, lineHeight: 22 },
  emptyState: { paddingVertical: 12 },
  emptyTitle: { fontSize: 15, fontWeight: '600' },
  emptyMessage: { fontSize: 13, marginTop: 4 },
  logRow: { borderRadius: 4, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, padding: 12 },
  logStatus: { fontSize: 15, fontWeight: '600' },
  logDate: { fontSize: 14 },
  primaryButton: { alignItems: 'center', borderRadius: 4, marginTop: 24, paddingVertical: 12 },
  primaryButtonText: { fontSize: 15, fontWeight: '600' },
  dangerButton: { alignItems: 'center', borderRadius: 4, borderWidth: 1.5, marginTop: 10, paddingVertical: 12 },
  dangerButtonText: { fontSize: 15, fontWeight: '600' },
});