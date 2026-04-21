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

  const { categories } = context;
  const category = categories.find((c) => c.id === application.categoryId);

  return (
    <Pressable
      accessibilityLabel={`${application.company}, ${application.role}, view details`}
      accessibilityRole="button"
      onPress={() =>
        router.push({ pathname: '/application/[id]', params: { id: application.id.toString() } })
      }
      style={({ pressed }) => [
        styles.card,
        pressed ? styles.cardPressed : null,
      ]}
    >
      <Text style={styles.company}>{application.company}</Text>
      <Text style={styles.role}>{application.role}</Text>

      <View style={styles.tags}>
        {category ? (
          <View style={[styles.tag, { backgroundColor: category.colour + '20' }]}>
            <Text style={[styles.tagText, { color: category.colour }]}>
              {category.name}
            </Text>
          </View>
        ) : null}
        <View style={styles.tag}>
          <Text style={styles.tagText}>{application.date}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  cardPressed: {
    opacity: 0.88,
  },
  company: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
  role: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 2,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
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
});