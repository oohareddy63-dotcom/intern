import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Dimensions,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { showAlert } from '../../utils/alert';
import { COLORS as C } from '../../constants/theme';

const W = Dimensions.get('window').width;

export default function RegisterScreen({ navigation }) {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [focused, setFocused]   = useState(null);
  const [errors, setErrors]     = useState({});
  const dispatch = useDispatch();
  const { isLoading } = useSelector((s) => s.auth);

  const validate = () => {
    const e = {};
    if (!name.trim() || name.trim().length < 2) e.name = 'Enter your full name';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email address';
    if (!password || password.length < 6) e.password = 'Minimum 6 characters';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    const result = await dispatch(registerUser({ name: name.trim(), email: email.trim().toLowerCase(), password }));
    if (result.error) showAlert('Registration Failed', result.payload || 'Please try again.');
  };

  React.useEffect(() => { dispatch(clearError()); }, []);



  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <View style={s.brandPanel}>
          <View style={s.logoRow}>
            <View style={s.logoBox}>
              <Icon name="account-balance-wallet" size={22} color={C.blue} />
            </View>
            <Text style={s.logoText}>SpendWise</Text>
          </View>
          <Text style={s.brandHeadline}>Start your financial{'\n'}journey today.</Text>
          <Text style={s.brandSub}>Join thousands of users who track their expenses and achieve their financial goals.</Text>
          <View style={s.featureList}>
            {['Free to use, always', 'Secure JWT authentication', 'Works offline too'].map((f) => (
              <View key={f} style={s.featureRow}>
                <View style={s.featureDot} />
                <Text style={s.featureText}>{f}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.formPanel}>
          <Text style={s.formTitle}>Create account</Text>
          <Text style={s.formSub}>Fill in the details below to get started.</Text>

          {/* Name */}
          <View style={s.field}>
            <Text style={s.label}>Full name</Text>
            <View style={[s.inputWrap, focused === 'name' && s.inputFocused, errors.name && s.inputError]}>
              <Icon name="person" size={16} color={focused === 'name' ? C.blue : C.t3} style={s.inputIcon} />
              <TextInput style={s.input} placeholder="John Doe" placeholderTextColor={C.t3}
                value={name} onChangeText={setName} autoCapitalize="words" autoCorrect={false}
                onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} />
            </View>
            {errors.name ? <Text style={s.errText}>{errors.name}</Text> : null}
          </View>

          {/* Email */}
          <View style={s.field}>
            <Text style={s.label}>Email address</Text>
            <View style={[s.inputWrap, focused === 'email' && s.inputFocused, errors.email && s.inputError]}>
              <Icon name="email" size={16} color={focused === 'email' ? C.blue : C.t3} style={s.inputIcon} />
              <TextInput style={s.input} placeholder="name@company.com" placeholderTextColor={C.t3}
                value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} />
            </View>
            {errors.email ? <Text style={s.errText}>{errors.email}</Text> : null}
          </View>

          {/* Password */}
          <View style={s.field}>
            <Text style={s.label}>Password</Text>
            <View style={[s.inputWrap, focused === 'password' && s.inputFocused, errors.password && s.inputError]}>
              <Icon name="lock" size={16} color={focused === 'password' ? C.blue : C.t3} style={s.inputIcon} />
              <TextInput style={s.input} placeholder="Create a password" placeholderTextColor={C.t3}
                value={password} onChangeText={setPassword} secureTextEntry={!showPwd} autoCapitalize="none" autoCorrect={false}
                onFocus={() => setFocused('password')} onBlur={() => setFocused(null)} />
              <TouchableOpacity onPress={() => setShowPwd(!showPwd)}>
                <Icon name={showPwd ? 'visibility' : 'visibility-off'} size={18} color={C.t3} />
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={s.errText}>{errors.password}</Text> : null}
          </View>

          {/* Confirm */}
          <View style={s.field}>
            <Text style={s.label}>Confirm password</Text>
            <View style={[s.inputWrap, focused === 'confirm' && s.inputFocused, errors.confirm && s.inputError]}>
              <Icon name="lock-outline" size={16} color={focused === 'confirm' ? C.blue : C.t3} style={s.inputIcon} />
              <TextInput style={s.input} placeholder="Repeat your password" placeholderTextColor={C.t3}
                value={confirm} onChangeText={setConfirm} secureTextEntry={!showPwd} autoCapitalize="none" autoCorrect={false}
                onFocus={() => setFocused('confirm')} onBlur={() => setFocused(null)} />
            </View>
            {errors.confirm ? <Text style={s.errText}>{errors.confirm}</Text> : null}
          </View>

          <TouchableOpacity style={[s.btn, isLoading && s.btnDisabled]} onPress={handleRegister} disabled={isLoading}>
            {isLoading
              ? <ActivityIndicator color={C.white} size="small" />
              : <Text style={s.btnText}>Create account</Text>
            }
          </TouchableOpacity>

          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or</Text>
            <View style={s.dividerLine} />
          </View>

          <TouchableOpacity style={s.secondaryBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={s.secondaryBtnText}>Sign in to existing account</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1, flexDirection: W > 700 ? 'row' : 'column', minHeight: '100%' },
  brandPanel: {
    flex: W > 700 ? 1 : 0,
    backgroundColor: C.surface, padding: W > 700 ? 48 : 32,
    paddingTop: W > 700 ? 64 : 48,
    borderRightWidth: W > 700 ? 1 : 0, borderRightColor: C.border,
    justifyContent: 'center',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
  logoBox: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: C.blueGlow, borderWidth: 1, borderColor: C.blue + '40',
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  logoText: { fontSize: 18, fontWeight: '700', color: C.t1 },
  brandHeadline: { fontSize: W > 700 ? 34 : 26, fontWeight: '800', color: C.t1, lineHeight: W > 700 ? 42 : 34, marginBottom: 16 },
  brandSub: { fontSize: 15, color: C.t2, lineHeight: 24, marginBottom: 32 },
  featureList: { gap: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.blue },
  featureText: { fontSize: 14, color: C.t2 },
  formPanel: {
    flex: W > 700 ? 1 : 0,
    padding: W > 700 ? 48 : 24, paddingTop: W > 700 ? 64 : 32,
    justifyContent: 'center',
  },
  formTitle: { fontSize: 26, fontWeight: '700', color: C.t1, marginBottom: 6 },
  formSub: { fontSize: 14, color: C.t2, marginBottom: 28, lineHeight: 22 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '500', color: C.t2, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.input, borderWidth: 1, borderColor: C.border,
    borderRadius: 8, paddingHorizontal: 12, height: 44,
  },
  inputFocused: { borderColor: C.blue, backgroundColor: C.blueGlow },
  inputError: { borderColor: C.red },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: C.t1 },
  errText: { fontSize: 12, color: C.red, marginTop: 5 },
  btn: { height: 44, borderRadius: 8, backgroundColor: C.blue, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: C.white, fontSize: 14, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
  dividerText: { fontSize: 12, color: C.t3 },
  secondaryBtn: { height: 44, borderRadius: 8, borderWidth: 1, borderColor: C.border, justifyContent: 'center', alignItems: 'center' },
  secondaryBtnText: { color: C.t2, fontSize: 14, fontWeight: '500' },
});
