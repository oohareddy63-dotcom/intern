import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { expenseAPI } from '../../services/api';

// Async thunks
export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await expenseAPI.getExpenses(params);
      if (response.data) {
        return response.data;
      } else {
        return rejectWithValue('Invalid response from server');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch expenses';
      return rejectWithValue(errorMessage);
    }
  }
);

export const addExpense = createAsyncThunk(
  'expenses/addExpense',
  async (expenseData, { rejectWithValue }) => {
    try {
      const response = await expenseAPI.addExpense(expenseData);
      if (response.data && response.data.expense) {
        return response.data.expense;
      } else {
        return rejectWithValue('Invalid response from server');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add expense';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async ({ id, expenseData }, { rejectWithValue }) => {
    try {
      const response = await expenseAPI.updateExpense(id, expenseData);
      if (response.data && response.data.expense) {
        return response.data.expense;
      } else {
        return rejectWithValue('Invalid response from server');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update expense';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (id, { rejectWithValue }) => {
    try {
      await expenseAPI.deleteExpense(id);
      return id;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete expense';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchExpenseSummary = createAsyncThunk(
  'expenses/fetchExpenseSummary',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await expenseAPI.getExpenseSummary(params);
      if (response.data) {
        return response.data;
      } else {
        return rejectWithValue('Invalid response from server');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch expense summary';
      return rejectWithValue(errorMessage);
    }
  }
);

const initialState = {
  expenses: [],
  summary: {
    categorySummary: [],
    total: { totalAmount: 0, count: 0 }
  },
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalExpenses: 0
  }
};

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearExpenses: (state) => {
      state.expenses = [];
      state.summary = {
        categorySummary: [],
        total: { totalAmount: 0, count: 0 }
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Expenses
      .addCase(fetchExpenses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses = action.payload.expenses;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add Expense
      .addCase(addExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses.unshift(action.payload);
        state.pagination.totalExpenses += 1;
        state.error = null;
      })
      .addCase(addExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Expense
      .addCase(updateExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.expenses.findIndex(exp => exp._id === action.payload._id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete Expense
      .addCase(deleteExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses = state.expenses.filter(exp => exp._id !== action.payload);
        state.pagination.totalExpenses -= 1;
        state.error = null;
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Summary
      .addCase(fetchExpenseSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExpenseSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.summary = action.payload;
        state.error = null;
      })
      .addCase(fetchExpenseSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearExpenses } = expenseSlice.actions;
export default expenseSlice.reducer;
