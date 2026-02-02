import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {},
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    login: async (username, password) => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const response = await api.post('/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
};

export const izlozbeAPI = {
    getAll: async (params = {}) => {
        const response = await api.get('/izlozbe', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/izlozbe/${id}`);
        return response.data;
    },

    getBySlug: async (slug) => {
        const response = await api.get(`/izlozbe/slug/${slug}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/izlozbe', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/izlozbe/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/izlozbe/${id}`);
        return response.data;
    },
};

export const lokacijeAPI = {
    getAll: async (params = {}) => {
        const response = await api.get('/lokacije', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/lokacije/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/lokacije', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/lokacije/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/lokacije/${id}`);
        return response.data;
    },
};

export const slikeAPI = {
    getAll: async (params = {}) => {
        const response = await api.get('/slike', { params });
        return response.data;
    },

    getFromArtic: async (params = {}) => {
        const response = await api.get('/slike/artic', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/slike/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/slike', data);
        return response.data;
    },

    createFromArtic: async (artworkId) => {
        const response = await api.post(`/slike/from-artic?artwork_id=${artworkId}`);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/slike/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/slike/${id}`);
        return response.data;
    },
};

export const prijaveAPI = {
    getAll: async (params = {}) => {
        const response = await api.get('/prijave', { params });
        return response.data;
    },

    getMoje: async () => {
        const response = await api.get('/prijave/moje');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/prijave/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/prijave', data);
        return response.data;
    },

    validate: async (qrKod) => {
        const response = await api.post('/prijave/validate', { qr_kod: qrKod });
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/prijave/${id}`);
        return response.data;
    },
};

export const korisniciAPI = {
    getAll: async (params = {}) => {
        const response = await api.get('/korisnici', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/korisnici/${id}`);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/korisnici/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/korisnici/${id}`);
        return response.data;
    },
};

export default api;
