import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Job = {
  id: number;
  title: string;
  company_name: string;
  category: string;
  job_type: string;
  url: string;
  publication_date: string;
};

export default function BrowseScreen() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch('https://remotive.com/api/remote-jobs?limit=20');

        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }

        const data = await response.json();
        setJobs(data.jobs || []);
      } catch (err) {
        setError('Could not load job listings. Check your connection and try again.');
        console.error('API error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Browse Jobs</Text>
        <Text style={styles.subtitle}>Remote listings from Remotive</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1E3A5F" />
          <Text style={styles.loadingText}>Fetching latest listings...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            accessibilityLabel="Retry"
            accessibilityRole="button"
            onPress={retry}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {jobs.length === 0 ? (
            <View style={styles.centered}>
              <Text style={styles.emptyTitle}>No listings found</Text>
              <Text style={styles.emptyMessage}>Try again later for new postings.</Text>
            </View>
          ) : (
            jobs.map((job) => (
              <Pressable
                key={job.id}
                accessibilityLabel={`${job.title} at ${job.company_name}, open listing`}
                accessibilityRole="button"
                onPress={() => Linking.openURL(job.url)}
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.cardPressed,
                ]}
              >
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.jobCompany}>{job.company_name}</Text>
                <View style={styles.jobMeta}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{job.category}</Text>
                  </View>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{job.job_type}</Text>
                  </View>
                </View>
                <Text style={styles.applyText}>Tap to view listing →</Text>
              </Pressable>
            ))
          )}
        </ScrollView>
      )}

      <Pressable
        accessibilityLabel="Go back"
        accessibilityRole="button"
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F9FAFB',
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  header: {
    marginBottom: 14,
  },
  title: {
    color: '#1A1A2E',
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 4,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 15,
    marginTop: 12,
  },
  errorText: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderRadius: 4,
    borderWidth: 1,
    color: '#991B1B',
    fontSize: 15,
    padding: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#1E3A5F',
    borderRadius: 4,
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyTitle: {
    color: '#1A1A2E',
    fontSize: 18,
    fontWeight: '700',
  },
  emptyMessage: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 8,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderLeftColor: '#D97706',
    borderLeftWidth: 3,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 10,
    padding: 14,
  },
  cardPressed: {
    opacity: 0.85,
  },
  jobTitle: {
    color: '#1A1A2E',
    fontSize: 16,
    fontWeight: '700',
  },
  jobCompany: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 2,
  },
  jobMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#FFF7ED',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    color: '#9A3412',
    fontSize: 12,
    fontWeight: '600',
  },
  applyText: {
    color: '#1E3A5F',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderColor: '#9CA3AF',
    borderRadius: 4,
    borderWidth: 1.5,
    marginBottom: 10,
    marginTop: 10,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});