import axios from "../utils/axios";

export const apiConnector = async (method, url, data = {}, options = {}) => {
  try {
    const token = localStorage.getItem("token");

    const config = {
      method,
      url,
      data,
      withCredentials: true,
      headers: {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...options,
    };
      

    const response = await axios(config);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
