import { db } from '@/db/client';
import { applications as applicationsTable, applicationStatusLogs as statusLogsTable } from '@/db/schema';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from './_layout';

export default function AddApplication() {
  const router = useRouter();
  const context = useContext(AppContext);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  if (!context) return null;
  const { categories, setApplications, setStatusLogs } = context;

  const saveApplication = async () => {
    if (!company || !role || !date || !selectedCategoryId) return;

    await db.insert(applicationsTable).values({
      company,
      role,
      date,
      categoryId: selectedCategoryId,
      count: 1,
      notes,
    });

    const apps = await db.select().from(applicationsTable);
    const newApp = apps[apps.length - 1];

    if (newApp) {
      await db.insert(statusLogsTable).values({
        applicationId: newApp.id,
        status: 'Applied',
        date,
      });
    }

    const logs = await db.select().from(statusLogsTable);
    setApplications(apps);
    setStatusLogs(logs);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Add Application</Text>
        <Text style={styles.subtitle}>Record a new job application.</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Company</Text>
          <TextInput
            accessibilityLabel="Company"
            placeholder="e.g. Google, Stripe, Meta"
            placeholderTextColor="#94A3B8"
            value={company}
            onChangeText={setCompany}
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Role</Text>
          <TextInput
            accessibilityLabel="Role"
            placeholder="e.g. Software Engineer"
            placeholderTextColor="#94A3B8"
            value={role}
            onChangeText={setRole}
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Date Applied</Text>
          <TextInput
            accessibilityLabel="Date"
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94A3B8"
            value={date}
            onChangeText={setDate}
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.optionRow}>
            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  accessibilityLabel={`Select ${cat.name} category`}
                  accessibilityRole="button"
                  onPress={() => setSelectedCategoryId(cat.id)}
                  style={[
                    styles.optionButton,
                    isSelected && { backgroundColor: cat.colour, borderColor: cat.colour },
                  ]}
                >
                  {!isSelected ? (
                    <View style={[styles.optionDot, { backgroundColor: cat.colour }]} />
                  ) : null}
                  <Text
                    style={[
                      styles.optionButtonText,
                      isSelected && { color: '#FFFFFF' },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            accessibilityLabel="Notes"
            placeholder="Any extra details about this application..."
            placeholderTextColor="#94A3B8"
            value={notes}
            onChangeText={setNotes}
            multiline
            style={[styles.input, styles.textArea]}
          />
        </View>

        <Pressable
          accessibilityLabel="Save application"
          accessibilityRole="button"
          onPress={saveApplication}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Save Application</Text>
        </Pressable>

        <Pressable
          accessibilityLabel="Cancel"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Cancel</Text>
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
  content: {
    paddingBottom: 24,
  },
  title: {
    color: '#1A1A2E',
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 20,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#9CA3AF',
    borderRadius: 8,
    borderWidth: 1.5,
    color: '#1A1A2E',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#9CA3AF',
    borderRadius: 8,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  optionDot: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  optionButtonText: {
    color: '#1A1A2E',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#1E3A5F',
    borderRadius: 8,
    marginTop: 8,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderColor: '#9CA3AF',
    borderRadius: 8,
    borderWidth: 1.5,
    marginTop: 10,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});