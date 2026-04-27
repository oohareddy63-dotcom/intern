import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector, useDispatch } from 'react-redux';
import Icon from '@expo/vector-icons/MaterialIcons';
import { logoutUser } from '../store/slices/authSlice';
import { clearExpenses } from '../store/slices/expenseSlice';
import { confirmAlert } from '../utils/alert';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Screens
import DashboardScreen from '../screens/main/DashboardScreen';
import ExpensesScreen from '../screens/main/ExpensesScreen';
import AddExpenseScreen from '../screens/main/AddExpenseScreen';
import ExpenseDetailScreen from '../screens/main/ExpenseDetailScreen';
import EditExpenseScreen from '../screens/main/EditExpenseScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = { Dashboard: 'dashboard', Expenses: 'receipt', Add: 'add-circle' };

const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => <Icon name={TAB_ICONS[route.name]} size={size} color={color} />,
      tabBarActiveTintColor: '#00D4FF',
      tabBarInactiveTintColor: 'rgba(255,255,255,0.35)',
      tabBarStyle: {
        backgroundColor: '#0F0F2A',
        borderTopColor: 'rgba(255,255,255,0.08)',
        borderTopWidth: 1,
        height: 60,
        paddingBottom: 8,
      },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      headerShown: false,
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
    <Tab.Screen name="Expenses" component={ExpensesScreen} options={{ tabBarLabel: 'Expenses' }} />
    <Tab.Screen name="Add" component={AddExpenseScreen} options={{ tabBarLabel: 'Add' }} />
  </Tab.Navigator>
);

const AuthNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    confirmAlert(
      'Logout',
      'Are you sure you want to logout?',
      async () => {
        await dispatch(logoutUser());
        dispatch(clearExpenses());
      }
    );
  };

  const DARK_HEADER = {
    headerStyle: { backgroundColor: '#0F0F2A', borderBottomColor: 'rgba(255,255,255,0.08)', borderBottomWidth: 1 },
    headerTintColor: '#FFFFFF',
    headerTitleStyle: { fontWeight: '700', fontSize: 17 },
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{
              headerShown: true,
              headerTitle: '💰 SpendWise',
              ...DARK_HEADER,
              headerRight: () => (
                <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
                  <Icon name="logout" size={22} color="#00D4FF" />
                </TouchableOpacity>
              ),
            }}
          />
          <Stack.Screen name="ExpenseDetail" component={ExpenseDetailScreen}
            options={{ headerShown: true, headerTitle: 'Expense Details', ...DARK_HEADER }}
          />
          <Stack.Screen name="EditExpense" component={EditExpenseScreen}
            options={{ headerShown: true, headerTitle: 'Edit Expense', ...DARK_HEADER }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
