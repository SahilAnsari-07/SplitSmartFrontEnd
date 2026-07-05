import API from './axiosInstance';

const expenseService = {
  getAll: () => API.get('/expenses'),
  create: (data) => API.post('/expenses', data),
  update: (id, data) => API.put(`/expenses/${id}`, data),
  delete: (id) => API.delete(`/expenses/${id}`),
};

export default expenseService;
