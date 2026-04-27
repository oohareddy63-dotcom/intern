import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useDispatch } from 'react-redux';
import { deleteExpense } from '../../store/slices/expenseSlice';
import { confirmAlert, showAlert } from '../../utils/alert';
import { COLORS, CATEGORY_COLORS, CATEGORY_ICONS } from '../../constants/theme';

export default function ExpenseDetailScreen({ route, navigation }) {
  const { expense } = route.params;
  const dispatch = useDispatch();
  const color = CATEGORY_COLORS[expense.category] || COLORS.neonBlue;

  const handleDelete = () => {
    confirmAlert('Delete Expense', 'This action cannot be undone.', async () => {
      try { await dispatch(deleteExpense(expense._id)).unwrap(); navigation.goBack(); }
      catch { showAlert('Error', 'Failed to delete expense'); }
    });
  };

  const Row = ({ icon, label, value }) => (
    <View style={s.row}>
      <View style={s.rowIcon}><Icon name={icon} size={18} color={COLORS.neonBlue} /></View>
      <View style={s.rowBody}>
        <Text style={s.rowLabel}>{label}</Text>
        <Text style={s.rowValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={s.root} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={[s.hero, { borderColor: color + '40' }]}>
        <View style={[s.heroIcon, { backgroundColor: color + '18', borderColor: color + '40' }]}>
          <Icon name={CATEGORY_ICONS[expense.category] || 'category'} size={36} color={color} />
        </View>
        <Text style={[s.heroCategory, { color }]}>{expense.category}</Text>
        <Text style={s.heroAmount}>${expense.amount.toFixed(2)}</Text>
        <Text style={s.heroDate}>
          {new Date(expense.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </Text>
      </View>

      {/* Details */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Details</Text>
        <Row icon="category" label="Category" value={expense.category} />
        <Row icon="attach-money" label="Amount" value={`$${expense.amount.toFixed(2)}`} />
        <Row icon="calendar-today" label="Date" value={new Date(expense.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
        {expense.note && <Row icon="notes" label="Note" value={expense.note} />}
      </View>

      {/* Actions */}
      <View style={s.actions}>
        <TouchableOpacity style={s.editBtn} onPress={() => navigation.navigate('EditExpense', { expense })}>
          <Icon name="edit" size={20} color={COLORS.neonBlue} />
          <Text style={s.editBtnText}>Edit Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.deleteBtn} onPress={handleDelete}>
          <Icon name="delete" size={20} color={COLORS.danger} />
          <Text style={s.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  hero: {
    margin: 16, borderRadius: 20, padding: 28,
    backgroundColor: COLORS.bgCard, alignItems: 'center',
    borderWidth: 1,
  },
  heroIcon: {
    width: 72, height: 72, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, marginBottom: 14,
  },
  heroCategory: { fontSize: 14, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  heroAmount: { fontSize: 44, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6 },
  heroDate: { fontSize: 13, color: COLORS.textMuted },
  card: {
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: COLORS.bgCard, borderRadius: 16,
    padding: 20, borderWidth: 1, borderColor: COLORS.border,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 0.5, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  rowIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(0,212,255,0.1)', borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  rowBody: { flex: 1 },
  rowLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', letterSpacing: 0.5, marginBottom: 2 },
  rowValue: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },
  actions: { flexDirection: 'row', marginHorizontal: 16, gap: 12, marginBottom: 32 },
  editBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 52, borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(0,212,255,0.4)',
    backgroundColor: 'rgba(0,212,255,0.08)',
  },
  editBtnText: { color: COLORS.neonBlue, fontSize: 15, fontWeight: '700' },
  deleteBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 52, borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,77,109,0.4)',
    backgroundColor: 'rgba(255,77,109,0.08)',
  },
  deleteBtnText: { color: COLORS.danger, fontSize: 15, fontWeight: '700' },
});
