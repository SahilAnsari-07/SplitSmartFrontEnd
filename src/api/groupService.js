import API from './axiosInstance';

const groupService = {
  getAll: () => API.get('/groups'),
  getById: (id) => API.get(`/groups/${id}`),
  create: (data) => API.post('/groups', data),
  addMember: (groupId, data) => API.post(`/groups/${groupId}/members`, data),
  delete: (id) => API.delete(`/groups/${id}`),
};

export default groupService;
