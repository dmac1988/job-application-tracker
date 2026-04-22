import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from './_layout';

type Job = {
  id: number;
  title: string;
  company_name: string;
  category: string;
  job_type: string;
  url: string;
};

export default function BrowseScreen() {
  const router = useRouter();
  const context = useContext(AppContext);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  if (!context) return null;
  const { colors } = context;

  useEffect(() => {
    fetch('https://remotive.com/api/remote-jobs?limit=20')
      .then((res) => res.json())
      .then((data) => setJobs(data.jobs || []))
      .catch(() => setError('Could not load job listings. Check your connection and try again.'))
      .finally(() => setLoading(false));
  }, []);

  const retry = () => {
    setJobs([]);
    setLoading(true);
    setError('');
    fetch('https://remotive.com/api/remote-jobs?limit=20')
      .then((res) => res.json())
      .then((data) => setJobs(data.jobs || []))
      .catch(() => setError('Could not load job listings. Check your connection and try again.'))
      .finally(() => setLoading(false));
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Browse Jobs</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Remote listings from Remotive</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Fetching latest listings...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={[styles.errorText, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder, color: colors.danger }]}>{error}</Text>
          <Pressable accessibilityLabel="Retry" accessibilityRole="button" onPress={retry} style={[styles.retryButton, { backgroundColor: colors.primary }]}>
            <Text style={[styles.retryButtonText, { color: colors.primaryText }]}>Try Again</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {jobs.length === 0 ? (
            <View style={styles.centered}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No listings found</Text>
              <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>Try again later for new postings.</Text>
            </View>
          ) : (
            jobs.map((job) => (
              <Pressable key={job.id} accessibilityLabel={`${job.title} at ${job.company_name}, open listing`} accessibilityRole="button"
                onPress={() => Linking.openURL(job.url)}
                style={({ pressed }) => [styles.card, { backgroundColor: colors.card, borderColor: colors.border }, pressed && styles.cardPressed]}>
                <Text style={[styles.jobTitle, { color: colors.text }]}>{job.title}</Text>
                <Text style={[styles.jobCompany, { color: colors.textSecondary }]}>{job.company_name}</Text>
                <View style={styles.jobMeta}>
                  <View style={styles.tag}><Text style={styles.tagText}>{job.category}</Text></View>
                  <View style={styles.tag}><Text style={styles.tagText}>{job.job_type}</Text></View>
                </View>
                <Text style={[styles.applyText, { color: colors.primary }]}>Tap to view listing →</Text>
              </Pressable>
            ))
          )}
        </ScrollView>
      )}

      <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={() => router.back()}
        style={[styles.backButton, { borderColor: colors.inputBorder }]}>
        <Text style={[styles.backButtonText, { color: colors.text }]}>Back</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingHorizontal: 18, paddingTop: 10 },
  header: { marginBottom: 14 },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 4 },
  centered: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  loadingText: { fontSize: 15, marginTop: 12 },
  errorText: { borderRadius: 4, borderWidth: 1, fontSize: 15, padding: 16, textAlign: 'center' },
  retryButton: { borderRadius: 4, marginTop: 16, paddingHorizontal: 24, paddingVertical: 12 },
  retryButtonText: { fontSize: 15, fontWeight: '600' },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyMessage: { fontSize: 14, marginTop: 8 },
  listContent: { paddingBottom: 24 },
  card: { borderLeftColor: '#D97706', borderLeftWidth: 3, borderRadius: 4, borderWidth: 1, marginBottom: 10, padding: 14 },
  cardPressed: { opacity: 0.85 },
  jobTitle: { fontSize: 16, fontWeight: '700' },
  jobCompany: { fontSize: 14, marginTop: 2 },
  jobMeta: { flexDirection: 'row', gap: 8, marginTop: 8 },
  tag: { backgroundColor: '#FFF7ED', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 },
  tagText: { color: '#9A3412', fontSize: 12, fontWeight: '600' },
  applyText: { fontSize: 13, fontWeight: '600', marginTop: 10 },
  backButton: { alignItems: 'center', borderRadius: 4, borderWidth: 1.5, marginBottom: 10, marginTop: 10, paddingVertical: 12 },
  backButtonText: { fontSize: 16, fontWeight: '600' },
});