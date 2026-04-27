import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  ActivityIndicator, Dimensions, TouchableOpacity
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExpenses, fetchExpenseSummary } from '../../store/slices/expenseSlice';
import { PieChart } from 'react-native-chart-kit';
import Icon from '@expo/vector-icons/MaterialIcons';
import { COLORS, CATEGORY_COLORS, CATEGORY_ICONS } from '../../constants/theme';

const { width: W } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();
  const { expenses, summary, isLoading } = useSelector((s) => s.expenses);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      await Promise.all([
        dispatch(fetchExpenses({ limit: 10 })).unwrap(),
        dispatch(fetchExpenseSummary()).unwrap(),
      ]);
    } catch {}
  };

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const total = summary.total.totalAmount || 0;
  const count = summary.total.count || 0;
  const avg = count > 0 ? (total / count).toFixed(2) : '0.00';

  const pieData = summary.categorySummary.map((i) => ({
    name: i._id, population: parseFloat(i.totalAmount),
    color: CATEGORY_COLORS[i._id] || '#636E72',
    legendFontColor: COLORS.textSecondary, legendFontSize: 11,
  }));

  return (
    <ScrollView
      style={s.root}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.neonBlue} />}
    >
      {/* Hero */}
      <View style={s.hero}>
        <View style={s.heroBadge}>
          <View style={s.heroDot} />
          <Text style={s.heroBadgeText}>YOUR FINANCE DASHBOARD</Text>
        </View>
        <Text style={s.heroTitle}>
          Hello, <Text style={s.heroAccent}>{user?.name?.split(' ')[0] || 'there'}</Text> 👋
        </Text>
        <Text style={s.heroSub}>Track, manage and grow your savings</Text>

        {/* Stats row */}
        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Text style={s.statNum}>{count}+</Text>
            <Text style={s.statLabel}>TRANSACTIONS</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statBox}>
            <Text style={s.statNum}>${total.toFixed(0)}</Text>
            <Text style={s.statLabel}>TOTAL SPENT</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statBox}>
            <Text style={s.statNum}>${avg}</Text>
            <Text style={s.statLabel}>AVG / EXPENSE</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Quick Actions</Text>
        <View style={s.actionsRow}>
          <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('Add')}>
            <View style={[s.actionIcon, { backgroundColor: 'rgba(123,92,250,0.15)', borderColor: 'rgba(123,92,250,0.3)' }]}>
              <Icon name="add-circle" size={24} color={COLORS.neonPurple} />
            </View>
            <Text style={s.actionLabel}>Add Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('Expenses')}>
            <View style={[s.actionIcon, { backgroundColor: 'rgba(0,212,255,0.1)', borderColor: 'rgba(0,212,255,0.3)' }]}>
              <Icon name="list-alt" size={24} color={COLORS.neonBlue} />
            </View>
            <Text style={s.actionLabel}>All Expenses</Text>
          </TouchableOpacity>
          <View style={s.actionBtn}>
            <View style={[s.actionIcon, { backgroundColor: 'rgba(0,255,136,0.1)', borderColor: 'rgba(0,255,136,0.3)' }]}>
              <Icon name="bar-chart" size={24} color={COLORS.neonGreen} />
            </View>
            <Text style={s.actionLabel}>Analytics</Text>
          </View>
        </View>
      </View>

      {/* Pie Chart */}
      {pieData.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Spending Distribution</Text>
          <PieChart
            data={pieData}
            width={W - 48}
            height={200}
            chartConfig={{ color: (o = 1) => `rgba(0,212,255,${o})` }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="10"
            absolute
          />
        </View>
      )}

      {/* Category Breakdown */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>By Category</Text>
        {summary.categorySummary.length === 0 ? (
          <View style={s.empty}>
            <Icon name="pie-chart" size={40} color={COLORS.textMuted} />
            <Text style={s.emptyText}>No data yet — add your first expense</Text>
          </View>
        ) : (
          summary.categorySummary.map((cat) => {
            const pct = total > 0 ? (cat.totalAmount / total) * 100 : 0;
            const color = CATEGORY_COLORS[cat._id] || COLORS.neonBlue;
            return (
              <View key={cat._id} style={s.catRow}>
                <View style={[s.catIcon, { backgroundColor: color + '18', borderColor: color + '40' }]}>
                  <Icon name={CATEGORY_ICONS[cat._id] || 'category'} size={18} color={color} />
                </View>
                <View style={s.catBody}>
                  <View style={s.catTop}>
                    <Text style={s.catName}>{cat._id}</Text>
                    <Text style={[s.catAmt, { color }]}>${cat.totalAmount.toFixed(2)}</Text>
                  </View>
                  <View style={s.bar}>
                    <View style={[s.barFill, { width: `${pct}%`, backgroundColor: color }]} />
                  </View>
                  <Text style={s.catMeta}>{cat.count} items · {pct.toFixed(0)}%</Text>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Recent */}
      <View style={[s.section, { marginBottom: 32 }]}>
        <View style={s.rowBetween}>
          <Text style={s.sectionTitle}>Recent Expenses</Text>
          {expenses.length > 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('Expenses')}>
              <Text style={s.seeAll}>See all →</Text>
            </TouchableOpacity>
          )}
        </View>
        {expenses.length === 0 ? (
          <View style={s.empty}>
            <Icon name="receipt-long" size={40} color={COLORS.textMuted} />
            <Text style={s.emptyText}>No expenses yet</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => navigation.navigate('Add')}>
              <Text style={s.emptyBtnText}>+ Add Expense</Text>
            </TouchableOpacity>
          </View>
        ) : (
          expenses.slice(0, 5).map((exp) => {
            const color = CATEGORY_COLORS[exp.category] || COLORS.neonBlue;
            return (
              <TouchableOpacity
                key={exp._id} style={s.expRow}
                onPress={() => navigation.navigate('ExpenseDetail', { expense: exp })}
              >
                <View style={[s.expIcon, { backgroundColor: color + '18', borderColor: color + '40' }]}>
                  <Icon name={CATEGORY_ICONS[exp.category] || 'category'} size={20} color={color} />
                </View>
                <View style={s.expBody}>
                  <Text style={s.expCat}>{exp.category}</Text>
                  <Text style={s.expDate}>{new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                  {exp.note ? <Text style={s.expNote} numberOfLines={1}>{exp.note}</Text> : null}
                </View>
                <Text style={[s.expAmt, { color: COLORS.danger }]}>-${exp.amount.toFixed(2)}</Text>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {isLoading && !refreshing && (
        <View style={s.overlay}><ActivityIndicator size="large" color={COLORS.neonBlue} /></View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  hero: {
    backgroundColor: COLORS.bgCard, margin: 16, borderRadius: 20,
    padding: 24, borderWidth: 1, borderColor: COLORS.border,
  },
  heroBadge: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  heroDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.neonBlue, marginRight: 8 },
  heroBadgeText: { fontSize: 11, color: COLORS.neonBlue, fontWeight: '700', letterSpacing: 1.5 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6 },
  heroAccent: { color: COLORS.neonBlue },
  heroSub: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 20 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statBox: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  statLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600', letterSpacing: 1, marginTop: 2 },
  statDivider: { width: 1, height: 36, backgroundColor: COLORS.border },
  section: {
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: COLORS.bgCard, borderRadius: 20,
    padding: 20, borderWidth: 1, borderColor: COLORS.border,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  seeAll: { fontSize: 13, color: COLORS.neonBlue, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, alignItems: 'center' },
  actionIcon: {
    width: 52, height: 52, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, marginBottom: 8,
  },
  actionLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500', textAlign: 'center' },
  catRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  catIcon: {
    width: 42, height: 42, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, marginRight: 12,
  },
  catBody: { flex: 1 },
  catTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  catName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  catAmt: { fontSize: 14, fontWeight: '700' },
  bar: { height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: 4, borderRadius: 2 },
  catMeta: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  expRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  expIcon: {
    width: 42, height: 42, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, marginRight: 12,
  },
  expBody: { flex: 1 },
  expCat: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  expDate: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  expNote: { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
  expAmt: { fontSize: 15, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 28 },
  emptyText: { fontSize: 13, color: COLORS.textMuted, marginTop: 10, textAlign: 'center' },
  emptyBtn: {
    marginTop: 14, paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1, borderColor: COLORS.neonPurple,
    backgroundColor: 'rgba(123,92,250,0.1)',
  },
  emptyBtnText: { color: COLORS.neonPurple, fontWeight: '600', fontSize: 13 },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(10,10,26,0.7)', justifyContent: 'center', alignItems: 'center',
  },
});
