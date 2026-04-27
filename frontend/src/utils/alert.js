import { Alert, Platform } from 'react-native';

/**
 * Cross-platform confirm dialog.
 * Uses window.confirm on web, Alert.alert on native.
 */
export const confirmAlert = (title, message, onConfirm, onCancel) => {
  if (Platform.OS === 'web') {
    const result = window.confirm(`${title}\n\n${message}`);
    if (result) onConfirm();
    else if (onCancel) onCancel();
  } else {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: onCancel },
      { text: 'Delete', style: 'destructive', onPress: onConfirm },
    ]);
  }
};

/**
 * Cross-platform info/error alert.
 */
export const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};
