import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, TextInput
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExpenses, deleteExpense, clearError } from '../../store/slices/expenseSlice';
import Icon from '@expo/vector-icons/MaterialIcons';
import { confirmAlert, showAlert } from '../../utils/alert';
import { COLORS, CATEGORY_COLORS, CATEGORY_ICONS } from '../../constants/theme';

const CATS = ['All', 'Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Other'];

export default function ExpensesScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();
  const { expenses, isLoading, error } = useSelector((s) => s.expenses);

  useEffect(() => { load(); }, []);
  useEffect(() => { if (error) { showAlert('Error', error); dispatch(clearError()); } }, [error]);

  const load = async (c = 'All') => {
    try {
      const p = { page: 1, limit: 50 };
      if (c !== 'All') p.category = c;
      await dispatch(fetchExpenses(p)).unwrap();
    } catch {}
  };

  const onRefresh = async () => { setRefreshing(true); await load(cat); setRefreshing(false); };

  const handleDelete = (id) => {
    confirmAlert('Delete Expense', 'This cannot be undone.', async () => {
      try { await dispatch(deleteExpense(id)).unwrap(); }
      catch { showAlert('Error', 'Failed to delete'); }
    });
  };

  const handleCat = (c) => { setCat(c); load(c); };

  const filtered = expenses.filter((e) =>
    e.note?.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const color = CATEGORY_COLORS[item.category] || COLORS.neonBlue;
    return (
      <TouchableOpacity
        style={s.card}
        onPress={() => navigation.navigate('ExpenseDetail', { expense: item })}
        activeOpacity={0.8}
      >
        <View style={[s.cardIcon, { backgroundColor: color + '18', borderColor: color + '40' }]}>
          <Icon name={CATEGORY_ICONS[item.category] || 'category'} size={22} color={color} />
        </View>
        <View style={s.cardBody}>
          <Text style={s.cardCat}>{item.category}</Text>
          <Text style={s.cardDate}>{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
          {item.note ? <Text style={s.cardNote} numberOfLines={1}>{item.note}</Text> : null}
        </View>
        <View style={s.cardRight}>
          <Text style={[s.cardAmt, { color: COLORS.danger }]}>-${item.amount.toFixed(2)}</Text>
          <TouchableOpacity style={s.delBtn} onPress={() => handleDelete(item._id)}>
            <Icon name="delete-outline" size={18} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const Empty = () => (
    <View style={s.empty}>
      <View style={s.emptyIcon}>
        <Icon name="receipt-long" size={40} color={COLORS.neonPurple} />
      </View>
      <Text style={s.emptyTitle}>No expenses found</Text>
      <Text style={s.emptySub}>
        {search || cat !== 'All' ? 'Try adjusting your filters' : 'Add your first expense to get started'}
      </Text>
      {!search && cat === 'All' && (
        <TouchableOpacity style={s.emptyBtn} onPress={() => navigation.navigate('Add')}>
          <Icon name="add" size={16} color={COLORS.white} />
          <Text style={s.emptyBtnText}>Add Expense</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>My Expenses</Text>
          <Text style={s.headerSub}>{filtered.length} {filtered.length === 1 ? 'record' : 'records'} found</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => navigation.navigate('Add')}>
          <Icon name="add" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <Icon name="search" size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={s.searchInput}
          placeholder="Search expenses..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Icon name="close" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category chips */}
      <FlatList
        data={CATS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(i) => i}
        contentContainerStyle={s.chips}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.chip, cat === item && s.chipActive]}
            onPress={() => handleCat(item)}
          >
            {item !== 'All' && (
              <Icon
                name={CATEGORY_ICONS[item] || 'category'}
                size={13}
                color={cat === item ? COLORS.bg : COLORS.textMuted}
                style={{ marginRight: 4 }}
              />
            )}
            <Text style={[s.chipText, cat === item && s.chipTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* List */}
      {isLoading && !refreshing ? (
        <View style={s.loading}><ActivityIndicator size="large" color={COLORS.neonBlue} /></View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(i) => i._id}
          contentContainerStyle={[s.list, filtered.length === 0 && { flex: 1 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.neonBlue} />}
          ListEmptyComponent={Empty}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: COLORS.bgCard, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary },
  headerSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  addBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.neonPurple,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: COLORS.neonPurple, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginVertical: 12,
    backgroundColor: COLORS.bgCard, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  chips: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.bgCard,
  },
  chipActive: { backgroundColor: COLORS.neonBlue, borderColor: COLORS.neonBlue },
  chipText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
  chipTextActive: { color: COLORS.bg, fontWeight: '700' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 20 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgCard, borderRadius: 16,
    padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardIcon: {
    width: 46, height: 46, borderRadius: 13,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, marginRight: 12,
  },
  cardBody: { flex: 1 },
  cardCat: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  cardDate: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  cardNote: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  cardRight: { alignItems: 'flex-end' },
  cardAmt: { fontSize: 16, fontWeight: '700' },
  delBtn: { marginTop: 6, padding: 4 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 20,
    backgroundColor: 'rgba(123,92,250,0.1)', borderWidth: 1,
    borderColor: 'rgba(123,92,250,0.3)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  emptySub: { fontSize: 13, color: COLORS.textMuted, marginTop: 6, textAlign: 'center', paddingHorizontal: 40 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 20, backgroundColor: COLORS.neonPurple,
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12,
    shadowColor: COLORS.neonPurple, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  emptyBtnText: { color: COLORS.white, fontWeight: '600', fontSize: 14 },
});
