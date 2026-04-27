import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  EXPENSES: 'offline_expenses',
  PENDING_ACTIONS: 'pending_actions',
  USER_DATA: 'user_data',
};

class OfflineStorage {
  // Save expenses for offline access
  static async saveExpenses(expenses) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
      return true;
    } catch (error) {
      console.error('Error saving expenses offline:', error);
      return false;
    }
  }

  // Get cached expenses
  static async getExpenses() {
    try {
      const expenses = await AsyncStorage.getItem(STORAGE_KEYS.EXPENSES);
      return expenses ? JSON.parse(expenses) : [];
    } catch (error) {
      console.error('Error getting cached expenses:', error);
      return [];
    }
  }

  // Save pending actions for when back online
  static async savePendingAction(action) {
    try {
      const existingActions = await this.getPendingActions();
      existingActions.push({
        ...action,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      });
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_ACTIONS, JSON.stringify(existingActions));
      return true;
    } catch (error) {
      console.error('Error saving pending action:', error);
      return false;
    }
  }

  // Get pending actions
  static async getPendingActions() {
    try {
      const actions = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_ACTIONS);
      return actions ? JSON.parse(actions) : [];
    } catch (error) {
      console.error('Error getting pending actions:', error);
      return [];
    }
  }

  // Remove a pending action after successful sync
  static async removePendingAction(actionId) {
    try {
      const existingActions = await this.getPendingActions();
      const filteredActions = existingActions.filter(action => action.id !== actionId);
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_ACTIONS, JSON.stringify(filteredActions));
      return true;
    } catch (error) {
      console.error('Error removing pending action:', error);
      return false;
    }
  }

  // Clear all pending actions
  static async clearPendingActions() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_ACTIONS);
      return true;
    } catch (error) {
      console.error('Error clearing pending actions:', error);
      return false;
    }
  }

  // Save user data for offline access
  static async saveUserData(userData) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Error saving user data offline:', error);
      return false;
    }
  }

  // Get cached user data
  static async getUserData() {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting cached user data:', error);
      return null;
    }
  }

  // Clear all offline data
  static async clearAllData() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.EXPENSES,
        STORAGE_KEYS.PENDING_ACTIONS,
        STORAGE_KEYS.USER_DATA
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing offline data:', error);
      return false;
    }
  }
}

export default OfflineStorage;
