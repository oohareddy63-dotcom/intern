import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Dimensions,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { showAlert } from '../../utils/alert';
import { COLORS as C } from '../../constants/theme';

const W = Dimensions.get('window').width;

export default function LoginScreen({ navigation }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [focused, setFocused]   = useState(null);
  const [errors, setErrors]     = useState({});
  const dispatch = useDispatch();
  const { isLoading } = useSelector((s) => s.auth);

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email address';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Minimum 6 characters';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    const result = await dispatch(loginUser({ email: email.trim().toLowerCase(), password }));
    if (result.error) showAlert('Sign In Failed', result.payload || 'Invalid credentials. Please try again.');
  };

  React.useEffect(() => { dispatch(clearError()); }, []);

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Left panel — branding */}
        <View style={s.brandPanel}>
          <View style={s.logoRow}>
            <View style={s.logoBox}>
              <Icon name="account-balance-wallet" size={22} color={C.blue} />
            </View>
            <Text style={s.logoText}>SpendWise</Text>
          </View>
          <Text style={s.brandHeadline}>Take control of{'\n'}your finances.</Text>
          <Text style={s.brandSub}>
            Track every expense, understand your spending patterns, and make smarter financial decisions.
          </Text>
          <View style={s.featureList}>
            {['Real-time expense tracking', 'Category-wise analytics', 'Secure & private data'].map((f) => (
              <View key={f} style={s.featureRow}>
                <View style={s.featureDot} />
                <Text style={s.featureText}>{f}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Right panel — form */}
        <View style={s.formPanel}>
          <Text style={s.formTitle}>Sign in</Text>
          <Text style={s.formSub}>Welcome back. Enter your credentials to continue.</Text>

          <InputField
            label="Email address"
            icon="email"
            placeholder="name@company.com"
            value={email}
            onChange={setEmail}
            keyboard="email-address"
            focused={focused === 'email'}
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused(null)}
            error={errors.email}
          />

          <InputField
            label="Password"
            icon="lock"
            placeholder="Enter your password"
            value={password}
            onChange={setPassword}
            secure={!showPwd}
            focused={focused === 'pwd'}
            onFocus={() => setFocused('pwd')}
            onBlur={() => setFocused(null)}
            error={errors.password}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPwd(!showPwd)}>
                <Icon name={showPwd ? 'visibility' : 'visibility-off'} size={18} color={C.t3} />
              </TouchableOpacity>
            }
          />

          <TouchableOpacity style={[s.btn, isLoading && s.btnDisabled]} onPress={handleLogin} disabled={isLoading}>
            {isLoading
              ? <ActivityIndicator color={C.white} size="small" />
              : <Text style={s.btnText}>Sign in to your account</Text>
            }
          </TouchableOpacity>

          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or</Text>
            <View style={s.dividerLine} />
          </View>

          <TouchableOpacity style={s.secondaryBtn} onPress={() => navigation.navigate('Register')}>
            <Text style={s.secondaryBtnText}>Create a new account</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InputField({ label, icon, placeholder, value, onChange, keyboard, secure, focused, onFocus, onBlur, error, rightIcon }) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.inputWrap, focused && s.inputFocused, error && s.inputError]}>
        <Icon name={icon} size={16} color={focused ? C.blue : C.t3} style={s.inputIcon} />
        <TextInput
          style={s.input}
          placeholder={placeholder}
          placeholderTextColor={C.t3}
          value={value}
          onChangeText={onChange}
          keyboardType={keyboard || 'default'}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={secure}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        {rightIcon}
      </View>
      {error ? <Text style={s.errText}><Icon name="error-outline" size={12} color={C.red} /> {error}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: {
    flexGrow: 1, flexDirection: W > 700 ? 'row' : 'column',
    minHeight: '100%',
  },
  brandPanel: {
    flex: W > 700 ? 1 : 0,
    backgroundColor: C.surface,
    padding: W > 700 ? 48 : 32,
    paddingTop: W > 700 ? 64 : 48,
    borderRightWidth: W > 700 ? 1 : 0,
    borderRightColor: C.border,
    justifyContent: 'center',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
  logoBox: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: C.blueGlow, borderWidth: 1, borderColor: C.blue + '40',
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  logoText: { fontSize: 18, fontWeight: '700', color: C.t1, letterSpacing: 0.3 },
  brandHeadline: { fontSize: W > 700 ? 36 : 28, fontWeight: '800', color: C.t1, lineHeight: W > 700 ? 44 : 36, marginBottom: 16 },
  brandSub: { fontSize: 15, color: C.t2, lineHeight: 24, marginBottom: 32 },
  featureList: { gap: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.blue },
  featureText: { fontSize: 14, color: C.t2 },
  formPanel: {
    flex: W > 700 ? 1 : 0,
    padding: W > 700 ? 48 : 24,
    paddingTop: W > 700 ? 64 : 32,
    justifyContent: 'center',
  },
  formTitle: { fontSize: 26, fontWeight: '700', color: C.t1, marginBottom: 6 },
  formSub: { fontSize: 14, color: C.t2, marginBottom: 32, lineHeight: 22 },
  field: { marginBottom: 20 },
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
  btn: {
    height: 44, borderRadius: 8, backgroundColor: C.blue,
    justifyContent: 'center', alignItems: 'center', marginTop: 4,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: C.white, fontSize: 14, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
  dividerText: { fontSize: 12, color: C.t3 },
  secondaryBtn: {
    height: 44, borderRadius: 8, borderWidth: 1, borderColor: C.border,
    justifyContent: 'center', alignItems: 'center',
  },
  secondaryBtnText: { color: C.t2, fontSize: 14, fontWeight: '500' },
});
