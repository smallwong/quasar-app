import axios from 'axios';

const api = axios.create({
  baseURL: 'https://dev.tapgo.cc/test/',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const url = config.url;

  if (token && url !== 'auth/login') {
    config.headers.Authorization = token;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
    return Promise.reject(error);
  },
);

export default api;
