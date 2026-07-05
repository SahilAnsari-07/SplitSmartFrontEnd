import API from './axiosInstance';

const sharedExpenseService = {
  getByGroup: (groupId) => API.get(`/groups/${groupId}/expenses`),
  create: (groupId, data) => API.post(`/groups/${groupId}/expenses`, data),
  delete: (groupId, expenseId) => API.delete(`/groups/${groupId}/expenses/${expenseId}`),
};

export default sharedExpenseService;
