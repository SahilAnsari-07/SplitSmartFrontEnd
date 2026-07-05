import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import expenseService from '../api/expenseService';

export const fetchExpenses = createAsyncThunk(
  'expenses/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await expenseService.getAll();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch expenses');
    }
  }
);

export const addExpense = createAsyncThunk(
  'expenses/add',
  async (data, { rejectWithValue }) => {
    try {
      const res = await expenseService.create(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to add expense');
    }
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await expenseService.update(id, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to update expense');
    }
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/delete',
  async (id, { rejectWithValue }) => {
    try {
      await expenseService.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to delete expense');
    }
  }
);

const expenseSlice = createSlice({
  name: 'expenses',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // Fetch
    builder.addCase(fetchExpenses.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchExpenses.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchExpenses.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Add
    builder.addCase(addExpense.fulfilled, (state, action) => {
      state.items.unshift(action.payload);
    });

    // Update
    builder.addCase(updateExpense.fulfilled, (state, action) => {
      const idx = state.items.findIndex((e) => e.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    });

    // Delete
    builder.addCase(deleteExpense.fulfilled, (state, action) => {
      state.items = state.items.filter((e) => e.id !== action.payload);
    });
  },
});

export default expenseSlice.reducer;
