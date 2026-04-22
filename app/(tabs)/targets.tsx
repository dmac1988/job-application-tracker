import { db } from '@/db/client';
import { targets as targetsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
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
import { AppContext } from '../_layout';

export default function TargetsScreen() {
  const context = useContext(AppContext);
  const [goal, setGoal] = useState('');
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  if (!context) return null;

  const { targets, setTargets, categories, applications } = context;

  const addTarget = async () => {
    if (!goal || isNaN(Number(goal))) return;

    await db.insert(targetsTable).values({
      period,
      goal: Number(goal),
      categoryId: selectedCategoryId,
    });

    const tgts = await db.select().from(targetsTable);
    setTargets(tgts);
    setGoal('');
    setSelectedCategoryId(null);
  };

  const deleteTarget = async (id: number) => {
    await db.delete(targetsTable).where(eq(targetsTable.id, id));
    const tgts = await db.select().from(targetsTable);
    setTargets(tgts);
  };

  const getProgress = (target: { period: string; goal: number; categoryId: number | null }) => {
    const now = new Date();
    const filtered = applications.filter((app) => {
      const appDate = new Date(app.date);
      const matchesCategory = target.categoryId === null || app.categoryId === target.categoryId;

      if (target.period === 'weekly') {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return matchesCategory && appDate >= weekAgo && appDate <= now;
      } else {
        return (
          matchesCategory &&
          appDate.getMonth() === now.getMonth() &&
          appDate.getFullYear() === now.getFullYear()
        );
      }
    });

    return filtered.length;
  };

  const getStreak = (target: { period: string; goal: number; categoryId: number | null }) => {
    const now = new Date();
    let streak = 0;

    if (target.period === 'weekly') {
      for (let i = 0; i < 52; i++) {
        const weekEnd = new Date(now);
        weekEnd.setDate(weekEnd.getDate() - (i * 7));
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() - 7);

        const count = applications.filter((app) => {
          const appDate = new Date(app.date);
          const matchesCategory = target.categoryId === null || app.categoryId === target.categoryId;
          return matchesCategory && appDate >= weekStart && appDate <= weekEnd;
        }).length;

        if (count >= target.goal) {
          streak++;
        } else {
          break;
        }
      }
    } else {
      for (let i = 0; i < 12; i++) {
        const checkMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);

        const count = applications.filter((app) => {
          const appDate = new Date(app.date);
          const matchesCategory = target.categoryId === null || app.categoryId === target.categoryId;
          return (
            matchesCategory &&
            appDate.getMonth() === checkMonth.getMonth() &&
            appDate.getFullYear() === checkMonth.getFullYear()
          );
        }).length;

        if (count >= target.goal) {
          streak++;
        } else {
          break;
        }
      }
    }

    return streak;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.title}>Targets</Text>
      <Text style={styles.subtitle}>Set application goals and track progress</Text>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Goal (number of applications)</Text>
          <TextInput
            accessibilityLabel="Goal"
            placeholder="e.g. 5"
            placeholderTextColor="#94A3B8"
            value={goal}
            onChangeText={setGoal}
            keyboardType="numeric"
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Period</Text>
          <View style={styles.optionRow}>
            <Pressable
              accessibilityLabel="Set weekly period"
              accessibilityRole="button"
              onPress={() => setPeriod('weekly')}
              style={[styles.optionButton, period === 'weekly' && styles.optionSelected]}
            >
              <Text style={[styles.optionText, period === 'weekly' && styles.optionTextSelected]}>
                Weekly
              </Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Set monthly period"
              accessibilityRole="button"
              onPress={() => setPeriod('monthly')}
              style={[styles.optionButton, period === 'monthly' && styles.optionSelected]}
            >
              <Text style={[styles.optionText, period === 'monthly' && styles.optionTextSelected]}>
                Monthly
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Category (optional)</Text>
          <View style={styles.optionRow}>
            <Pressable
              accessibilityLabel="Global target"
              accessibilityRole="button"
              onPress={() => setSelectedCategoryId(null)}
              style={[styles.optionButton, selectedCategoryId === null && styles.optionSelected]}
            >
              <Text style={[styles.optionText, selectedCategoryId === null && styles.optionTextSelected]}>
                All
              </Text>
            </Pressable>
            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  accessibilityLabel={`Target for ${cat.name}`}
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
                      styles.optionText,
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

        <Pressable
          accessibilityLabel="Add target"
          accessibilityRole="button"
          onPress={addTarget}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>Add Target</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {targets.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No targets set</Text>
            <Text style={styles.emptyMessage}>
              Add a weekly or monthly goal above to start tracking your progress.
            </Text>
          </View>
        ) : (
          targets.map((target) => {
            const progress = getProgress(target);
            const percentage = Math.min(Math.round((progress / target.goal) * 100), 100);
            const cat = target.categoryId
              ? categories.find((c) => c.id === target.categoryId)
              : null;
            const met = progress >= target.goal;
            const streak = getStreak(target);

            return (
              <View key={target.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.cardTitle}>
                      {target.period === 'weekly' ? 'Weekly' : 'Monthly'} Goal
                    </Text>
                    <Text style={styles.cardCategory}>
                      {cat ? cat.name : 'All categories'}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityLabel="Delete target"
                    accessibilityRole="button"
                    onPress={() => deleteTarget(target.id)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </Pressable>
                </View>

                <Text style={styles.progressText}>
                  {progress} / {target.goal} applications
                </Text>

                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${percentage}%`,
                        backgroundColor: met ? '#059669' : '#1E3A5F',
                      },
                    ]}
                  />
                </View>

                <Text style={[styles.statusText, { color: met ? '#059669' : '#DC2626' }]}>
                  {met ? 'Target met!' : `${target.goal - progress} more to go`}
                </Text>

                {streak > 0 ? (
                  <View style={styles.streakBadge}>
                    <Text style={styles.streakText}>
                      🔥 {streak} {target.period === 'weekly' ? 'week' : 'month'}{streak > 1 ? 's' : ''} streak
                    </Text>
                  </View>
                ) : (
                  <View style={styles.noStreakBadge}>
                    <Text style={styles.noStreakText}>
                      No streak yet — meet this {target.period === 'weekly' ? 'week\'s' : 'month\'s'} goal to start one
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
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
  form: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 4,
    borderWidth: 1,
    marginTop: 16,
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
    borderRadius: 4,
    borderWidth: 1.5,
    color: '#1A1A2E',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
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
    borderRadius: 4,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  optionSelected: {
    backgroundColor: '#1E3A5F',
    borderColor: '#1E3A5F',
  },
  optionText: {
    color: '#1A1A2E',
    fontSize: 14,
    fontWeight: '600',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  optionDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: '#1E3A5F',
    borderRadius: 4,
    paddingVertical: 14,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    color: '#1A1A2E',
    fontSize: 18,
    fontWeight: '700',
  },
  emptyMessage: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: '#1A1A2E',
    fontSize: 16,
    fontWeight: '700',
  },
  cardCategory: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 2,
  },
  progressText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },
  progressBar: {
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    height: 8,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 4,
    height: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
  },
  streakBadge: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
    borderRadius: 4,
    borderWidth: 1,
    marginTop: 10,
    padding: 10,
  },
  streakText: {
    color: '#9A3412',
    fontSize: 14,
    fontWeight: '700',
  },
  noStreakBadge: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E2E8F0',
    borderRadius: 4,
    borderWidth: 1,
    marginTop: 10,
    padding: 10,
  },
  noStreakText: {
    color: '#64748B',
    fontSize: 13,
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deleteButtonText: {
    color: '#991B1B',
    fontSize: 13,
    fontWeight: '600',
  },
});