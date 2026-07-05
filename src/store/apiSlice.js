import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || "/api",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    headers.set("content-type", "application/json");
    return headers;
  },
});

const baseQueryWithAuthRedirect = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuthRedirect,
  tagTypes: ["Auth", "Expenses", "Groups", "GroupDetail", "SharedExpenses"],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({
        url: "auth/login",
        method: "POST",
        body,
      }),
    }),
    register: builder.mutation({
      query: (body) => ({
        url: "auth/register",
        method: "POST",
        body,
      }),
    }),
    getExpenses: builder.query({
      query: () => "expenses",
      providesTags: ["Expenses"],
    }),
    createExpense: builder.mutation({
      query: (body) => ({
        url: "expenses",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Expenses"],
    }),
    updateExpense: builder.mutation({
      query: ({ id, data }) => ({
        url: `expenses/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Expenses"],
    }),
    deleteExpense: builder.mutation({
      query: (id) => ({
        url: `expenses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Expenses"],
    }),
    getGroups: builder.query({
      query: () => "groups",
      providesTags: ["Groups"],
    }),
    getBalanceSummary: builder.query({
      query: () => "groups/balance-summary",
      providesTags: ["Groups", "GroupDetail"],
    }),
    getGroupDetail: builder.query({
      query: (groupId) => `groups/${groupId}`,
      providesTags: (_result, _error, groupId) => [
        { type: "GroupDetail", id: groupId },
      ],
    }),
    createGroup: builder.mutation({
      query: (body) => ({
        url: "groups",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Groups"],
    }),
    addGroupMember: builder.mutation({
      query: ({ groupId, body }) => ({
        url: `groups/${groupId}/members`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { groupId }) => [
        "Groups",
        { type: "GroupDetail", id: groupId },
      ],
    }),
    deleteGroup: builder.mutation({
      query: (groupId) => ({
        url: `groups/${groupId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Groups"],
    }),
    getSharedExpenses: builder.query({
      query: (groupId) => `groups/${groupId}/expenses`,
      providesTags: (_result, _error, groupId) => [
        { type: "SharedExpenses", id: groupId },
      ],
    }),
    createSharedExpense: builder.mutation({
      query: ({ groupId, body }) => ({
        url: `groups/${groupId}/expenses`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { groupId }) => [
        { type: "GroupDetail", id: groupId },
        { type: "SharedExpenses", id: groupId },
      ],
    }),
    deleteSharedExpense: builder.mutation({
      query: ({ groupId, expenseId }) => ({
        url: `groups/${groupId}/expenses/${expenseId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { groupId }) => [
        { type: "GroupDetail", id: groupId },
        { type: "SharedExpenses", id: groupId },
      ],
    }),
    createSettlement: builder.mutation({
      query: ({ groupId, body }) => ({
        url: `groups/${groupId}/settlements`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { groupId }) => [
        { type: "GroupDetail", id: groupId },
      ],
    }),
    linkUser: builder.mutation({
      query: (body) => ({
        url: "group-members/link-user",
        method: "POST",
        body,
        responseHandler: (response) => response.text(),
      }),
      invalidatesTags: ["Groups", "GroupDetail"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useGetGroupsQuery,
  useGetBalanceSummaryQuery,
  useGetGroupDetailQuery,
  useCreateGroupMutation,
  useAddGroupMemberMutation,
  useDeleteGroupMutation,
  useGetSharedExpensesQuery,
  useCreateSharedExpenseMutation,
  useDeleteSharedExpenseMutation,
  useCreateSettlementMutation,
  useLinkUserMutation,
} = apiSlice;

export default apiSlice;
