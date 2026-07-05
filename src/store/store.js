import { configureStore } from "@reduxjs/toolkit";
import apiSlice from "./apiSlice";
import authReducer from "./authSlice";
import expenseReducer from "./expenseSlice";
import groupReducer from "./groupSlice";

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    expenses: expenseReducer,
    groups: groupReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export default store;
