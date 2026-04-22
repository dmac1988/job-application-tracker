import { db } from '@/db/client';
import { categories as categoriesTable, users as usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { File, Paths } from 'expo-file-system/next';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useContext, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from './_layout';

const COLOUR_OPTIONS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EF4444',
  '#EC4899',
  '#14B8A6',
  '#F97316',
];

export default function SettingsScreen() {
  const router = useRouter();
  const context = useContext(AppContext);
  const [name, setName] = useState('');
  const [selectedColour, setSelectedColour] = useState(COLOUR_OPTIONS[0]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editColour, setEditColour] = useState('');
  const [exporting, setExporting] = useState(false);

  if (!context) return null;

  const { user, setUser, categories, setCategories, applications, statusLogs, darkMode, setDarkMode, colors } = context;

  const addCategory = async () => {
    if (!name.trim()) return;

    await db.insert(categoriesTable).values({
      name: name.trim(),
      colour: selectedColour,
    });

    const cats = await db.select().from(categoriesTable);
    setCategories(cats);
    setName('');
    setSelectedColour(COLOUR_OPTIONS[0]);
  };

  const startEdit = (id: number, currentName: string, currentColour: string) => {
    setEditingId(id);
    setEditName(currentName);
    setEditColour(currentColour);
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;

    await db
      .update(categoriesTable)
      .set({ name: editName.trim(), colour: editColour })
      .where(eq(categoriesTable.id, editingId));

    const cats = await db.select().from(categoriesTable);
    setCategories(cats);
    setEditingId(null);
    setEditName('');
    setEditColour('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditColour('');
  };

  const deleteCategory = async (id: number) => {
    await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
    const cats = await db.select().from(categoriesTable);
    setCategories(cats);
  };

  const handleLogout = () => {
    setUser(null);
    router.replace('/login');
  };

  const handleDeleteProfile = async () => {
    if (!user) return;
    await db.delete(usersTable).where(eq(usersTable.id, user.id));
    setUser(null);
    router.replace('/login');
  };

  const exportCSV = async () => {
    try {
      setExporting(true);

      const header = 'Company,Role,Date,Category,Status,Notes\n';
      const rows = applications.map((app) => {
        const cat = categories.find((c) => c.id === app.categoryId);
        const appLogs = statusLogs
          .filter((l) => l.applicationId === app.id)
          .sort((a, b) => {
            const dateCompare = b.date.localeCompare(a.date);
            if (dateCompare !== 0) return dateCompare;
            return b.id - a.id;
          });
        const latestStatus = appLogs.length > 0 ? appLogs[0].status : 'Unknown';

        const escape = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;

        return [
          escape(app.company),
          escape(app.role),
          escape(app.date),
          escape(cat?.name || ''),
          escape(latestStatus),
          escape(app.notes || ''),
        ].join(',');
      });

      const csv = header + rows.join('\n');
      const file = new File(Paths.cache, 'applications.csv');
      file.create();
      file.write(csv);

      await Sharing.shareAsync(file.uri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Applications',
      });
    } catch (error) {
      Alert.alert('Export Failed', 'Something went wrong exporting your data.');
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          <View style={[styles.themeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.themeLabel, { color: colors.text }]}>Dark Mode</Text>
            <Switch
              accessibilityLabel="Toggle dark mode"
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
              thumbColor={darkMode ? '#FFFFFF' : '#F9FAFB'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
          <View style={[styles.accountCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.accountLabel, { color: colors.textSecondary }]}>Logged in as</Text>
            <Text style={[styles.accountUsername, { color: colors.primary }]}>{user?.username ?? 'Guest'}</Text>
          </View>

          <Pressable
            accessibilityLabel="Export applications to CSV"
            accessibilityRole="button"
            onPress={exportCSV}
            disabled={exporting}
            style={[styles.exportButton, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.exportButtonText, { color: colors.primaryText }]}>
              {exporting ? 'Exporting...' : 'Export Applications (CSV)'}
            </Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Logout"
            accessibilityRole="button"
            onPress={handleLogout}
            style={[styles.secondaryButton, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Logout</Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Delete profile"
            accessibilityRole="button"
            onPress={handleDeleteProfile}
            style={[styles.dangerButton, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}
          >
            <Text style={[styles.dangerButtonText, { color: colors.danger }]}>Delete Profile</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>

          <View style={[styles.form, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.text }]}>New Category</Text>
              <TextInput
                accessibilityLabel="Category name"
                placeholder="e.g. Data Science, UX Design"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.text }]}>Colour</Text>
              <View style={styles.colourRow}>
                {COLOUR_OPTIONS.map((colour) => (
                  <Pressable
                    key={colour}
                    accessibilityLabel={`Select colour ${colour}`}
                    accessibilityRole="button"
                    onPress={() => setSelectedColour(colour)}
                    style={[
                      styles.colourDot,
                      { backgroundColor: colour },
                      selectedColour === colour && styles.colourDotSelected,
                    ]}
                  />
                ))}
              </View>
            </View>

            <Pressable
              accessibilityLabel="Add category"
              accessibilityRole="button"
              onPress={addCategory}
              style={[styles.addButton, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.addButtonText, { color: colors.primaryText }]}>Add Category</Text>
            </Pressable>
          </View>

          {categories.map((cat) => (
            <View key={cat.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {editingId === cat.id ? (
                <View style={styles.editForm}>
                  <TextInput
                    accessibilityLabel="Edit category name"
                    placeholder="Category name"
                    placeholderTextColor={colors.textSecondary}
                    value={editName}
                    onChangeText={setEditName}
                    style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  />
                  <View style={styles.colourRow}>
                    {COLOUR_OPTIONS.map((colour) => (
                      <Pressable
                        key={colour}
                        accessibilityLabel={`Change colour to ${colour}`}
                        accessibilityRole="button"
                        onPress={() => setEditColour(colour)}
                        style={[
                          styles.colourDotSmall,
                          { backgroundColor: colour },
                          editColour === colour && styles.colourDotSelected,
                        ]}
                      />
                    ))}
                  </View>
                  <View style={styles.editActions}>
                    <Pressable
                      accessibilityLabel="Save edit"
                      accessibilityRole="button"
                      onPress={saveEdit}
                      style={[styles.saveButton, { backgroundColor: colors.primary }]}
                    >
                      <Text style={[styles.saveButtonText, { color: colors.primaryText }]}>Save</Text>
                    </Pressable>
                    <Pressable
                      accessibilityLabel="Cancel edit"
                      accessibilityRole="button"
                      onPress={cancelEdit}
                      style={[styles.cancelButton, { borderColor: colors.inputBorder }]}
                    >
                      <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <>
                  <View style={styles.cardLeft}>
                    <View style={[styles.colourIndicator, { backgroundColor: cat.colour }]} />
                    <Text style={[styles.cardName, { color: colors.text }]}>{cat.name}</Text>
                  </View>
                  <View style={styles.cardActions}>
                    <Pressable
                      accessibilityLabel={`Edit ${cat.name}`}
                      accessibilityRole="button"
                      onPress={() => startEdit(cat.id, cat.name, cat.colour)}
                      style={styles.editButton}
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </Pressable>
                    <Pressable
                      accessibilityLabel={`Delete ${cat.name}`}
                      accessibilityRole="button"
                      onPress={() => deleteCategory(cat.id)}
                      style={[styles.deleteSmall, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}
                    >
                      <Text style={[styles.deleteSmallText, { color: colors.danger }]}>Delete</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          ))}
        </View>

        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={[styles.backButton, { borderColor: colors.inputBorder }]}
        >
          <Text style={[styles.backButtonText, { color: colors.text }]}>Back</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  themeCard: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 16,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  accountCard: {
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  accountLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  accountUsername: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  exportButton: {
    alignItems: 'center',
    borderRadius: 4,
    marginBottom: 10,
    paddingVertical: 14,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderRadius: 4,
    borderWidth: 1.5,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  colourRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colourDot: {
    borderRadius: 999,
    height: 36,
    width: 36,
  },
  colourDotSmall: {
    borderRadius: 999,
    height: 28,
    width: 28,
  },
  colourDotSelected: {
    borderColor: '#1A1A2E',
    borderWidth: 3,
  },
  addButton: {
    alignItems: 'center',
    borderRadius: 4,
    paddingVertical: 14,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 10,
    padding: 14,
  },
  cardLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  colourIndicator: {
    borderRadius: 999,
    height: 16,
    width: 16,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
    borderRadius: 4,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  editButtonText: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteSmall: {
    borderRadius: 4,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deleteSmallText: {
    fontSize: 14,
    fontWeight: '600',
  },
  editForm: {
    gap: 12,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  saveButton: {
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    borderRadius: 4,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1.5,
    marginBottom: 10,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1.5,
    marginBottom: 10,
    paddingVertical: 14,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1.5,
    paddingVertical: 14,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});