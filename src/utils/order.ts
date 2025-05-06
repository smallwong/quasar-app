import api from './api';

export const getOrder = async (params?: unknown) => {
  const response = await api.get('orders', { params });
  return response;
};
