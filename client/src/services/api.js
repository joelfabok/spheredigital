import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';
const API = axios.create({ baseURL: API_BASE_URL });

API.interceptors.request.use(config => {
  const token = localStorage.getItem('sphere_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const submitContact = (data) => API.post('/contact', data);
export const getContacts = () => API.get('/contact');
export const updateContactStatus = (id, status) => API.patch(`/contact/${id}`, { status });

export const getProjects = (params) => API.get('/projects', { params });
export const createProject = (data) => API.post('/projects', data);
export const updateProject = (id, data) => API.put(`/projects/${id}`, data);
export const deleteProject = (id) => API.delete(`/projects/${id}`);

export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const updateAdminAccount = (data) => API.put('/auth/account', data);

export const getHomeContent = () => API.get('/content/home');
export const updateHomeContent = (data) => API.put('/content/home', data);

export const getTemplates = () => API.get('/templates');
export const getAdminTemplates = () => API.get('/templates/admin');
export const createTemplate = (data) => API.post('/templates', data);
export const updateTemplate = (id, data) => API.put(`/templates/${id}`, data);
export const deleteTemplate = (id) => API.delete(`/templates/${id}`);
export const checkoutTemplates = (items) => API.post('/templates/checkout', { items });
export const getTemplateDelivery = (sessionId) => API.get(`/templates/delivery/${sessionId}`);

export default API;
