import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch, useSelector } from 'react-redux';
import { updateExpense, clearError } from '../../store/slices/expenseSlice';
import { showAlert } from '../../utils/alert';
import { COLORS, CATEGORY_COLORS, CATEGORY_ICONS } from '../../constants/theme';

const CATS = ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Other'];

export default function EditExpenseScreen({ route, navigation }) {
  const { expense } = route.params;
  const [amount, setAmount] = useState(expense.amount.toString());
  const [category, setCategory] = useState(expense.category);
  const [date, setDate] = useState(new Date(expense.date));
  const [note, setNote] = useState(expense.note || '');
  const [showPicker, setShowPicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState(null);
  const dispatch = useDispatch();
  const { isLoading } = useSelector((s) => s.expenses);

  const validate = () => {
    const e = {};
    if (!amount || parseFloat(amount) <= 0) e.amount = 'Enter a valid amount';
    if (!category) e.category = 'Please select a category';
    if (note.length > 200) e.note = 'Max 200 characters';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleUpdate = async () => {
    if (!validate()) return;
    const result = await dispatch(updateExpense({
      id: expense._id,
      expenseData: { amount: parseFloat(amount), category, date: date.toISOString(), note: note.trim() },
    }));
    if (result.error) showAlert('Error', result.payload || 'Failed to update');
    else { showAlert('Success', 'Expense updated!'); navigation.goBack(); }
  };

  useEffect(() => { dispatch(clearError()); }, []);

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.amountCard}>
          <Text style={s.amountLabel}>EDIT AMOUNT</Text>
          <View style={s.amountRow}>
            <Text style={s.amountCurrency}>$</Text>
            <TextInput
              style={s.amountInput}
              placeholder="0.00"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>
          {errors.amount && <Text style={s.errText}>{errors.amount}</Text>}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Category</Text>
          <View style={s.catGrid}>
            {CATS.map((c) => {
              const color = CATEGORY_COLORS[c] || COLORS.neonBlue;
              const active = category === c;
              return (
                <TouchableOpacity
                  key={c}
                  style={[s.catBtn, active && { borderColor: color, backgroundColor: color + '20' }]}
                  onPress={() => setCategory(c)}
                >
                  <Icon name={CATEGORY_ICONS[c]} size={20} color={active ? color : COLORS.textMuted} />
                  <Text style={[s.catLabel, active && { color }]}>{c}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.category && <Text style={s.errText}>{errors.category}</Text>}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Date</Text>
          <TouchableOpacity style={s.dateBtn} onPress={() => setShowPicker(true)}>
            <Icon name="calendar-today" size={18} color={COLORS.neonBlue} style={{ marginRight: 10 }} />
            <Text style={s.dateText}>{date.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</Text>
            <Icon name="expand-more" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker value={date} mode="date" display="default"
              onChange={(_, d) => { setShowPicker(false); if (d) setDate(d); }}
              maximumDate={new Date()}
            />
          )}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Note <Text style={s.optional}>(optional)</Text></Text>
          <View style={[s.noteWrap, focused === 'note' && s.noteFocused]}>
            <TextInput
              style={s.noteInput}
              placeholder="Add a description..."
              placeholderTextColor={COLORS.textMuted}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              maxLength={200}
              onFocus={() => setFocused('note')}
              onBlur={() => setFocused(null)}
            />
          </View>
          <Text style={s.charCount}>{note.length}/200</Text>
          {errors.note && <Text style={s.errText}>{errors.note}</Text>}
        </View>

        <TouchableOpacity style={[s.btn, isLoading && s.btnOff]} onPress={handleUpdate} disabled={isLoading}>
          {isLoading
            ? <ActivityIndicator color={COLORS.white} size="small" />
            : <><Icon name="save" size={20} color={COLORS.white} style={{ marginRight: 8 }} /><Text style={s.btnText}>Save Changes</Text></>
          }
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  amountCard: {
    backgroundColor: '#1A1A3E', borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(123,92,250,0.4)',
  },
  amountLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  amountCurrency: { fontSize: 36, fontWeight: '700', color: COLORS.textMuted, marginRight: 4 },
  amountInput: { fontSize: 52, fontWeight: '800', color: COLORS.textPrimary, minWidth: 120, textAlign: 'center' },
  section: {
    backgroundColor: COLORS.bgCard, borderRadius: 16,
    padding: 18, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 0.5, marginBottom: 14 },
  optional: { color: COLORS.textMuted, fontWeight: '400' },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  catLabel: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
  dateBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14,
  },
  dateText: { flex: 1, fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
  noteWrap: {
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 14, paddingTop: 12,
  },
  noteFocused: { borderColor: COLORS.neonBlue },
  noteInput: { fontSize: 14, color: COLORS.textPrimary, minHeight: 72, textAlignVertical: 'top' },
  charCount: { fontSize: 11, color: COLORS.textMuted, textAlign: 'right', marginTop: 6 },
  errText: { fontSize: 12, color: COLORS.danger, marginTop: 6 },
  btn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    height: 56, borderRadius: 16, marginTop: 8,
    backgroundColor: COLORS.neonPurple,
    shadowColor: COLORS.neonPurple, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  btnOff: { opacity: 0.5 },
  btnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
