import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import groupService from "../api/groupService";
import sharedExpenseService from "../api/sharedExpenseService";

const getErrorMessage = (err, fallback) =>
  err.response?.data?.message || err.response?.data || err.message || fallback;

export const fetchGroups = createAsyncThunk(
  "groups/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await groupService.getAll();
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to fetch groups"));
    }
  },
);

export const fetchGroupDetail = createAsyncThunk(
  "groups/fetchDetail",
  async (id, { rejectWithValue }) => {
    try {
      const res = await groupService.getById(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        getErrorMessage(err, "Failed to fetch group detail"),
      );
    }
  },
);

export const createGroup = createAsyncThunk(
  "groups/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await groupService.create(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to create group"));
    }
  },
);

export const addMemberToGroup = createAsyncThunk(
  "groups/addMember",
  async ({ groupId, email }, { rejectWithValue }) => {
    try {
      const res = await groupService.addMember(groupId, { email });
      return { groupId, group: res.data };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to add member"));
    }
  },
);

export const deleteGroup = createAsyncThunk(
  "groups/delete",
  async (id, { rejectWithValue }) => {
    try {
      await groupService.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to delete group"));
    }
  },
);

export const fetchSharedExpenses = createAsyncThunk(
  "groups/fetchSharedExpenses",
  async (groupId, { rejectWithValue }) => {
    try {
      const res = await sharedExpenseService.getByGroup(groupId);
      return { groupId, expenses: res.data };
    } catch (err) {
      return rejectWithValue(
        getErrorMessage(err, "Failed to fetch shared expenses"),
      );
    }
  },
);

export const addSharedExpense = createAsyncThunk(
  "groups/addSharedExpense",
  async ({ groupId, data }, { rejectWithValue }) => {
    try {
      const res = await sharedExpenseService.create(groupId, data);
      return { groupId, expense: res.data };
    } catch (err) {
      return rejectWithValue(
        getErrorMessage(err, "Failed to add shared expense"),
      );
    }
  },
);

export const deleteSharedExpense = createAsyncThunk(
  "groups/deleteSharedExpense",
  async ({ groupId, expenseId }, { rejectWithValue }) => {
    try {
      await sharedExpenseService.delete(groupId, expenseId);
      return { groupId, expenseId };
    } catch (err) {
      return rejectWithValue(
        getErrorMessage(err, "Failed to delete shared expense"),
      );
    }
  },
);

const groupSlice = createSlice({
  name: "groups",
  initialState: {
    items: [],
    currentGroup: null,
    sharedExpenses: {},
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentGroup: (state) => {
      state.currentGroup = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch groups list
    builder.addCase(fetchGroups.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchGroups.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchGroups.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Fetch group detail
    builder.addCase(fetchGroupDetail.fulfilled, (state, action) => {
      state.currentGroup = action.payload;
    });

    // Create group
    builder.addCase(createGroup.fulfilled, (state, action) => {
      state.items.push(action.payload);
    });

    // Delete group
    builder.addCase(deleteGroup.fulfilled, (state, action) => {
      state.items = state.items.filter((g) => g.id !== action.payload);
      delete state.sharedExpenses[action.payload];
    });

    // Fetch shared expenses for a group
    builder.addCase(fetchSharedExpenses.fulfilled, (state, action) => {
      state.sharedExpenses[action.payload.groupId] = action.payload.expenses;
    });

    // Add shared expense
    builder.addCase(addSharedExpense.fulfilled, (state, action) => {
      const { groupId, expense } = action.payload;
      if (!state.sharedExpenses[groupId]) {
        state.sharedExpenses[groupId] = [];
      }
      state.sharedExpenses[groupId].unshift(expense);
    });

    // Delete shared expense
    builder.addCase(deleteSharedExpense.fulfilled, (state, action) => {
      const { groupId, expenseId } = action.payload;
      if (state.sharedExpenses[groupId]) {
        state.sharedExpenses[groupId] = state.sharedExpenses[groupId].filter(
          (e) => e.id !== expenseId,
        );
      }
    });

    // Add member
    builder.addCase(addMemberToGroup.fulfilled, (state, action) => {
      const group = state.items.find((g) => g.id === action.payload.groupId);
      if (group) {
        group.members = action.payload.group.members;
      }
      if (
        state.currentGroup &&
        state.currentGroup.id === action.payload.groupId
      ) {
        state.currentGroup.members = action.payload.group.members;
      }
    });
  },
});

export const { clearCurrentGroup } = groupSlice.actions;
export default groupSlice.reducer;
