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

  const application = context?.applications.find((a: Application) => a.id === Number(id));

  useEffect(() => {
    if (!application) return;
    setCompany(application.company);
    setRole(application.role);
    setDate(application.date);
    setNotes(application.notes ?? '');
    setSelectedCategoryId(application.categoryId);
  }, [application]);

  if (!context || !application) return null;

  const { categories, statusLogs, setApplications, setStatusLogs, colors } = context;

  const currentLogs = statusLogs
    .filter((l) => l.applicationId === Number(id))
    .sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.id - a.id;
    });
  const currentStatus = currentLogs.length > 0 ? currentLogs[0].status : 'None';

  const STATUS_OPTIONS = ['Applied', 'Interviewing', 'Offered', 'Rejected', 'Withdrawn'];

  const saveChanges = async () => {
    try {
      await db.update(applicationsTable).set({ company, role, date, notes, categoryId: selectedCategoryId! }).where(eq(applicationsTable.id, Number(id)));

      if (newStatus && newStatus !== currentStatus) {
        await db.insert(statusLogsTable).values({ applicationId: Number(id), status: newStatus, date: new Date().toISOString().split('T')[0] });
      }

      const apps = await db.select().from(applicationsTable);
      const logs = await db.select().from(statusLogsTable);
      setApplications(apps);
      setStatusLogs(logs);
      router.back();
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>Edit Application</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Update {application.company}</Text>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Company</Text>
          <TextInput accessibilityLabel="Company" value={company} onChangeText={setCompany} style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Role</Text>
          <TextInput accessibilityLabel="Role" value={role} onChangeText={setRole} style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Date (YYYY-MM-DD)</Text>
          <TextInput accessibilityLabel="Date" value={date} onChangeText={setDate} style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Category</Text>
          <View style={styles.optionRow}>
            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <Pressable key={cat.id} accessibilityLabel={`Select ${cat.name} category`} accessibilityRole="button" onPress={() => setSelectedCategoryId(cat.id)}
                  style={[styles.optionButton, { borderColor: colors.inputBorder }, isSelected && { backgroundColor: cat.colour, borderColor: cat.colour }]}>
                  {!isSelected ? <View style={[styles.optionDot, { backgroundColor: cat.colour }]} /> : null}
                  <Text style={[styles.optionText, { color: colors.text }, isSelected && { color: '#FFFFFF' }]}>{cat.name}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Notes</Text>
          <TextInput accessibilityLabel="Notes" value={notes} onChangeText={setNotes} multiline style={[styles.input, styles.textArea, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Update Status</Text>
          <Text style={[styles.currentStatus, { color: colors.primary }]}>Current: {currentStatus}</Text>
          <View style={styles.optionRow}>
            {STATUS_OPTIONS.map((status) => {
              const isSelected = newStatus === status;
              const isCurrent = currentStatus === status;
              return (
                <Pressable key={status} accessibilityLabel={`Set status to ${status}`} accessibilityRole="button" onPress={() => setNewStatus(isSelected ? '' : status)}
                  style={[styles.optionButton, { borderColor: colors.inputBorder }, isCurrent && !isSelected && { borderColor: colors.primary, borderWidth: 2 }, isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                  <Text style={[styles.optionText, { color: colors.text }, isSelected && { color: '#FFFFFF' }, isCurrent && !isSelected && { color: colors.primary }]}>{status}{isCurrent ? ' ✓' : ''}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable accessibilityLabel="Save changes" accessibilityRole="button" onPress={saveChanges} style={[styles.primaryButton, { backgroundColor: colors.primary }]}>
          <Text style={[styles.primaryButtonText, { color: colors.primaryText }]}>Save Changes</Text>
        </Pressable>

        <Pressable accessibilityLabel="Cancel" accessibilityRole="button" onPress={() => router.back()} style={[styles.secondaryButton, { borderColor: colors.inputBorder }]}>
          <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, padding: 20 },
  content: { paddingBottom: 24 },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 4, marginBottom: 20 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  currentStatus: { fontSize: 13, fontWeight: '500', marginBottom: 8 },
  input: { borderRadius: 4, borderWidth: 1.5, fontSize: 15, paddingHorizontal: 12, paddingVertical: 10 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionButton: { alignItems: 'center', borderRadius: 4, borderWidth: 1.5, flexDirection: 'row', gap: 6, paddingHorizontal: 14, paddingVertical: 10 },
  optionDot: { borderRadius: 999, height: 10, width: 10 },
  optionText: { fontSize: 13, fontWeight: '600' },
  primaryButton: { alignItems: 'center', borderRadius: 4, marginTop: 8, paddingVertical: 12 },
  primaryButtonText: { fontSize: 15, fontWeight: '600' },
  secondaryButton: { alignItems: 'center', borderRadius: 4, borderWidth: 1.5, marginTop: 10, paddingVertical: 12 },
  secondaryButtonText: { fontSize: 15, fontWeight: '600' },
});