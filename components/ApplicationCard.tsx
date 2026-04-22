import { AppContext, Application } from '@/app/_layout';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  application: Application;
};

export default function ApplicationCard({ application }: Props) {
  const router = useRouter();
  const context = useContext(AppContext);

  if (!context) return null;

  const { categories, statusLogs } = context;
  const category = categories.find((c) => c.id === application.categoryId);

  const appLogs = statusLogs
    .filter((l) => l.applicationId === application.id)
    .sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.id - a.id;
    });
  const latestStatus = appLogs.length > 0 ? appLogs[0].status : 'No status';

  const statusColour: Record<string, string> = {
    Applied: '#2563EB',
    Interviewing: '#D97706',
    Offered: '#059669',
    Rejected: '#DC2626',
    Withdrawn: '#7C3AED',
  };

  return (
    <Pressable
      accessibilityLabel={`${application.company}, ${application.role}, status ${latestStatus}, view details`}
      accessibilityRole="button"
      onPress={() =>
        router.push({ pathname: '/application/[id]', params: { id: application.id.toString() } })
      }
      style={({ pressed }) => [
        styles.card,
        pressed ? styles.cardPressed : null,
      ]}
    >
      <View style={styles.topRow}>
        <Text style={styles.company}>{application.company}</Text>
        <Text
          style={[
            styles.status,
            { color: statusColour[latestStatus] || '#64748B' },
          ]}
        >
          {latestStatus}
        </Text>
      </View>

      <Text style={styles.role}>{application.role}</Text>

      <View style={styles.bottomRow}>
        {category ? (
          <View style={[styles.tag, { backgroundColor: category.colour + '18' }]}>
            <View style={[styles.tagDot, { backgroundColor: category.colour }]} />
            <Text style={[styles.tagText, { color: category.colour }]}>
              {category.name}
            </Text>
          </View>
        ) : null}
        <Text style={styles.date}>{application.date}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderLeftColor: '#1E3A5F',
    borderLeftWidth: 3,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 10,
    padding: 14,
  },
  cardPressed: {
    opacity: 0.85,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  company: {
    color: '#1A1A2E',
    fontSize: 17,
    fontWeight: '700',
  },
  status: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  role: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 3,
  },
  bottomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  tag: {
    alignItems: 'center',
    borderRadius: 4,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagDot: {
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    color: '#94A3B8',
    fontSize: 12,
  },
});