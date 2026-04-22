import { db } from '@/db/client';
import { applications as applicationsTable, applicationStatusLogs as statusLogsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext, Application } from '../../_layout';

export default function EditApplication() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const context = useContext(AppContext);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState('');

  const application = context?.applications.find(
    (a: Application) => a.id === Number(id)
  );

  useEffect(() => {
    if (!application) return;
    setCompany(application.company);
    setRole(application.role);
    setDate(application.date);
    setNotes(application.notes ?? '');
    setSelectedCategoryId(application.categoryId);
  }, [application]);

  if (!context || !application) return null;

  const { categories, statusLogs, setApplications, setStatusLogs } = context;

  const currentLogs = statusLogs
    .filter((l) => l.applicationId === Number(id))
    .sort((a, b) => b.date.localeCompare(a.date));

  const currentStatus = currentLogs.length > 0 ? currentLogs[0].status : 'None';

  const STATUS_OPTIONS = ['Applied', 'Interviewing', 'Offered', 'Rejected', 'Withdrawn'];

  const saveChanges = async () => {
    try {
      await db
        .update(applicationsTable)
        .set({ company, role, date, notes, categoryId: selectedCategoryId! })
        .where(eq(applicationsTable.id, Number(id)));

      if (newStatus && newStatus !== currentStatus) {
        await db.insert(statusLogsTable).values({
          applicationId: Number(id),
          status: newStatus,
          date: new Date().toISOString().split('T')[0],
        });
        console.log('Status updated to:', newStatus);
      }

      const apps = await db.select().from(applicationsTable);
      const logs = await db.select().from(statusLogsTable);
      setApplications(apps);
      setStatusLogs(logs);
      console.log('Saved:', apps.length, 'apps,', logs.length, 'logs');
      router.back();
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Edit Application</Text>
        <Text style={styles.subtitle}>Update {application.company}</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Company</Text>
          <TextInput
            accessibilityLabel="Company"
            value={company}
            onChangeText={setCompany}
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Role</Text>
          <TextInput
            accessibilityLabel="Role"
            value={role}
            onChangeText={setRole}
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
          <TextInput
            accessibilityLabel="Date"
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
          <Text style={styles.label}>Notes</Text>
          <TextInput
            accessibilityLabel="Notes"
            value={notes}
            onChangeText={setNotes}
            multiline
            style={[styles.input, styles.textArea]}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Update Status</Text>
          <Text style={styles.currentStatus}>Current: {currentStatus}</Text>
          <View style={styles.optionRow}>
            {STATUS_OPTIONS.map((status) => {
              const isSelected = newStatus === status;
              const isCurrent = currentStatus === status;
              return (
                <Pressable
                  key={status}
                  accessibilityLabel={`Set status to ${status}`}
                  accessibilityRole="button"
                  onPress={() => setNewStatus(isSelected ? '' : status)}
                  style={[
                    styles.optionButton,
                    isCurrent && !isSelected && styles.currentButton,
                    isSelected && styles.statusSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      isSelected && { color: '#FFFFFF' },
                      isCurrent && !isSelected && { color: '#1E3A5F' },
                    ]}
                  >
                    {status}{isCurrent ? ' ✓' : ''}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          accessibilityLabel="Save changes"
          accessibilityRole="button"
          onPress={saveChanges}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Save Changes</Text>
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
    marginBottom: 16,
  },
  label: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  currentStatus: {
    color: '#1E3A5F',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  optionButtonText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '500',
  },
  currentButton: {
    borderColor: '#1E3A5F',
    borderWidth: 2,
  },
  statusSelected: {
    backgroundColor: '#1E3A5F',
    borderColor: '#1E3A5F',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#1E3A5F',
    borderRadius: 8,
    marginTop: 8,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
  },
});