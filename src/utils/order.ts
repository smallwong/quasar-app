import api from './api';

export const getOrder = async (params?: unknown) => {
  const response = await api.get('orders', { params });
  return response;
};

export const orderStatusName = (status: string) => {
  switch (status) {
    case 'open':
      return '已開啟';
    case 'cancelled':
      return '已取消';
    default:
      break;
  }
};

export const financialStatusName = (status: string) => {
  switch (status) {
    case 'paid':
      return '已收到款項';
    case 'pending':
      return '未收到款項';
    default:
      break;
  }
};

export const fulfillmentStatusName = (status: string) => {
  switch (status) {
    case 'received':
      return '已出貨';
    case 'preparing':
      return '未出貨';
    default:
      break;
  }
};
