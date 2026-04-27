import { expenseAPI } from './api';
import OfflineStorage from './offlineStorage';

class SyncService {
  // Sync pending actions when back online
  static async syncPendingActions() {
    try {
      const pendingActions = await OfflineStorage.getPendingActions();
      
      if (pendingActions.length === 0) {
        return { success: true, synced: 0 };
      }

      let syncedCount = 0;
      const failedActions = [];

      for (const action of pendingActions) {
        try {
          let result;
          
          switch (action.type) {
            case 'ADD_EXPENSE':
              result = await expenseAPI.addExpense(action.data);
              if (result.status === 201) {
                syncedCount++;
                await OfflineStorage.removePendingAction(action.id);
              } else {
                failedActions.push(action);
              }
              break;
              
            case 'UPDATE_EXPENSE':
              result = await expenseAPI.updateExpense(action.data.id, action.data.expenseData);
              if (result.status === 200) {
                syncedCount++;
                await OfflineStorage.removePendingAction(action.id);
              } else {
                failedActions.push(action);
              }
              break;
              
            case 'DELETE_EXPENSE':
              result = await expenseAPI.deleteExpense(action.data.id);
              if (result.status === 200) {
                syncedCount++;
                await OfflineStorage.removePendingAction(action.id);
              } else {
                failedActions.push(action);
              }
              break;
              
            default:
              failedActions.push(action);
          }
        } catch (error) {
          console.error('Failed to sync action:', action, error);
          failedActions.push(action);
        }
      }

      return { 
        success: failedActions.length === 0, 
        synced: syncedCount, 
        failed: failedActions.length 
      };
    } catch (error) {
      console.error('Sync service error:', error);
      return { success: false, synced: 0, failed: 0 };
    }
  }

  // Add expense with offline support
  static async addExpenseWithOffline(expenseData) {
    try {
      // Try to add online first
      const result = await expenseAPI.addExpense(expenseData);
      
      if (result.status === 201) {
        // Success: remove any pending actions for this expense
        await this.syncPendingActions();
        return { success: true, data: result.data.expense, offline: false };
      }
      
      throw new Error('Failed to add expense');
    } catch (error) {
      // Offline or failed: save for later
      const offlineAction = {
        type: 'ADD_EXPENSE',
        data: expenseData
      };
      
      const saved = await OfflineStorage.savePendingAction(offlineAction);
      
      if (saved) {
        // Also save to local cache for immediate display
        const currentExpenses = await OfflineStorage.getExpenses();
        const newExpense = {
          _id: `offline_${Date.now()}`,
          ...expenseData,
          date: new Date(expenseData.date).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isOffline: true
        };
        currentExpenses.unshift(newExpense);
        await OfflineStorage.saveExpenses(currentExpenses);
        
        return { success: true, data: newExpense, offline: true };
      }
      
      return { success: false, error: 'Failed to save expense offline' };
    }
  }

  // Update expense with offline support
  static async updateExpenseWithOffline(id, expenseData) {
    try {
      // Try to update online first
      const result = await expenseAPI.updateExpense(id, expenseData);
      
      if (result.status === 200) {
        return { success: true, data: result.data.expense, offline: false };
      }
      
      throw new Error('Failed to update expense');
    } catch (error) {
      // Offline or failed: save for later
      const offlineAction = {
        type: 'UPDATE_EXPENSE',
        data: { id, expenseData }
      };
      
      const saved = await OfflineStorage.savePendingAction(offlineAction);
      
      if (saved) {
        // Update local cache
        const currentExpenses = await OfflineStorage.getExpenses();
        const expenseIndex = currentExpenses.findIndex(exp => exp._id === id);
        
        if (expenseIndex !== -1) {
          currentExpenses[expenseIndex] = {
            ...currentExpenses[expenseIndex],
            ...expenseData,
            updatedAt: new Date().toISOString(),
            isOffline: true
          };
          await OfflineStorage.saveExpenses(currentExpenses);
        }
        
        return { success: true, data: { _id: id, ...expenseData }, offline: true };
      }
      
      return { success: false, error: 'Failed to save expense update offline' };
    }
  }

  // Delete expense with offline support
  static async deleteExpenseWithOffline(id) {
    try {
      // Try to delete online first
      const result = await expenseAPI.deleteExpense(id);
      
      if (result.status === 200) {
        return { success: true, offline: false };
      }
      
      throw new Error('Failed to delete expense');
    } catch (error) {
      // Offline or failed: save for later
      const offlineAction = {
        type: 'DELETE_EXPENSE',
        data: { id }
      };
      
      const saved = await OfflineStorage.savePendingAction(offlineAction);
      
      if (saved) {
        // Remove from local cache
        const currentExpenses = await OfflineStorage.getExpenses();
        const filteredExpenses = currentExpenses.filter(exp => exp._id !== id);
        await OfflineStorage.saveExpenses(filteredExpenses);
        
        return { success: true, offline: true };
      }
      
      return { success: false, error: 'Failed to save expense deletion offline' };
    }
  }

  // Get expenses with offline fallback
  static async getExpensesWithOffline(params = {}) {
    try {
      // Try to get online first
      const result = await expenseAPI.getExpenses(params);
      
      if (result.status === 200) {
        // Cache the latest data
        await OfflineStorage.saveExpenses(result.data.expenses);
        return { success: true, data: result.data, offline: false };
      }
      
      throw new Error('Failed to fetch expenses');
    } catch (error) {
      // Offline or failed: use cached data
      const cachedExpenses = await OfflineStorage.getExpenses();
      
      return { 
        success: true, 
        data: { 
          expenses: cachedExpenses, 
          pagination: { currentPage: 1, totalPages: 1, totalExpenses: cachedExpenses.length }
        }, 
        offline: true 
      };
    }
  }
}

export default SyncService;
