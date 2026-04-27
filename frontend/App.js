import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import ErrorBoundary from './src/components/ErrorBoundary';
import OfflineAlert from './src/components/OfflineAlert';
import { useNetworkStatus } from './src/hooks/useNetworkStatus';

function AppContent() {
  const { isConnected } = useNetworkStatus();
  return (
    <>
      <OfflineAlert isConnected={isConnected} />
      <NavigationContainer>
        <StatusBar style="auto" />
        <AppNavigator />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </PersistGate>
    </Provider>
  );
}
