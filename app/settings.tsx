import { db } from '@/db/client';
import { categories as categoriesTable } from '@/db/schema';
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

  if (!context) return null;

  const { categories, setCategories } = context;

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

  const deleteCategory = async (id: number) => {
    await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
    const cats = await db.select().from(categoriesTable);
    setCategories(cats);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>

          <View style={styles.form}>
            <Text style={styles.label}>New Category</Text>
            <TextInput
              accessibilityLabel="Category name"
              placeholder="Category name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            <Text style={[styles.label, { marginTop: 10 }]}>Colour</Text>
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
              <View style={styles.cardLeft}>
                <View style={[styles.colourIndicator, { backgroundColor: cat.colour }]} />
                <Text style={styles.cardName}>{cat.name}</Text>
              </View>
              <Pressable
                accessibilityLabel={`Delete ${cat.name}`}
                accessibilityRole="button"
                onPress={() => deleteCategory(cat.id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </Pressable>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Text style={styles.placeholderText}>Login and account management coming soon.</Text>
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
    backgroundColor: '#F8FAFC',
    flex: 1,
    padding: 20,
  },
  title: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  label: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  colourRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colourDot: {
    borderRadius: 999,
    height: 32,
    width: 32,
  },
  colourDotSelected: {
    borderColor: '#0F172A',
    borderWidth: 3,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: '#0F766E',
    borderRadius: 10,
    marginTop: 14,
    paddingVertical: 11,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    height: 14,
    width: 14,
  },
  cardName: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deleteButtonText: {
    color: '#7F1D1D',
    fontSize: 13,
    fontWeight: '600',
  },
  placeholderText: {
    color: '#6B7280',
    fontSize: 14,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: '#94A3B8',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '600',
  },
});