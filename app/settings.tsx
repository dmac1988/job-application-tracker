import { db } from '@/db/client';
import { categories as categoriesTable, users as usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
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

  if (!context) return null;

  const { user, setUser, categories, setCategories } = context;

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.accountCard}>
            <Text style={styles.accountLabel}>Logged in as</Text>
            <Text style={styles.accountUsername}>{user?.username ?? 'Guest'}</Text>
          </View>

          <Pressable
            accessibilityLabel="Logout"
            accessibilityRole="button"
            onPress={handleLogout}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Logout</Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Delete profile"
            accessibilityRole="button"
            onPress={handleDeleteProfile}
            style={styles.dangerButton}
          >
            <Text style={styles.dangerButtonText}>Delete Profile</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>New Category</Text>
              <TextInput
                accessibilityLabel="Category name"
                placeholder="e.g. Data Science, UX Design"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Colour</Text>
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
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>Add Category</Text>
            </Pressable>
          </View>

          {categories.map((cat) => (
            <View key={cat.id} style={styles.card}>
              {editingId === cat.id ? (
                <View style={styles.editForm}>
                  <TextInput
                    accessibilityLabel="Edit category name"
                    placeholder="Category name"
                    placeholderTextColor="#94A3B8"
                    value={editName}
                    onChangeText={setEditName}
                    style={styles.input}
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
                      style={styles.saveButton}
                    >
                      <Text style={styles.saveButtonText}>Save</Text>
                    </Pressable>
                    <Pressable
                      accessibilityLabel="Cancel edit"
                      accessibilityRole="button"
                      onPress={cancelEdit}
                      style={styles.cancelButton}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <>
                  <View style={styles.cardLeft}>
                    <View style={[styles.colourIndicator, { backgroundColor: cat.colour }]} />
                    <Text style={styles.cardName}>{cat.name}</Text>
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
                      style={styles.deleteSmall}
                    >
                      <Text style={styles.deleteSmallText}>Delete</Text>
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
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Back</Text>
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
  title: {
    color: '#1A1A2E',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#1A1A2E',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  accountCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  accountLabel: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
  accountUsername: {
    color: '#1E3A5F',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  field: {
    marginBottom: 16,
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
    backgroundColor: '#1E3A5F',
    borderRadius: 8,
    paddingVertical: 14,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 10,
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
    color: '#1A1A2E',
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
    borderRadius: 6,
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
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderRadius: 6,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deleteSmallText: {
    color: '#991B1B',
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
    backgroundColor: '#1E3A5F',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F9FAFB',
    borderColor: '#9CA3AF',
    borderRadius: 6,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderColor: '#9CA3AF',
    borderRadius: 8,
    borderWidth: 1.5,
    marginBottom: 10,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderRadius: 8,
    borderWidth: 1.5,
    marginBottom: 10,
    paddingVertical: 14,
  },
  dangerButtonText: {
    color: '#991B1B',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderColor: '#9CA3AF',
    borderRadius: 8,
    borderWidth: 1.5,
    paddingVertical: 14,
  },
  backButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});