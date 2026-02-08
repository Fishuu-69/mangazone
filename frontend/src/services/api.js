import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Automatically add the token to every request
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) req.headers.Authorization = token;
    return req;
});

export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);
export const fetchManga = () => API.get('/manga');
export const addManga = (data) => API.post('/manga', data);
export const updateManga = (id, data) => API.put(`/manga/${id}`, data);
export const deleteManga = (id) => API.delete(`/manga/${id}`);