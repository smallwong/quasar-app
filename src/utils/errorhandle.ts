import axios from 'axios';

export const tokenExpired = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response) {
    const status = error.response.status;
    if (status === 401) {
      return true;
    }
  }
  return false;
};
