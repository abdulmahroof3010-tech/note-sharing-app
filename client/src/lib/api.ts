import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  withCredentials: true,
});

export default api;

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const response = await api.post("/auth/register", data);

  return response.data;
};

export const loginUser = async (data: {
  email: string;
  password: string;
}) => {
  const response = await api.post("/auth/login", data);

  return response.data;
};

export const getNotes = async () => {
  const response = await api.get("/notes");

  return response.data;
};

export const getSpecificNote = async (id: string) => {
  const response = await api.get(`/notes/${id}`);

  return response.data;
};


export const createNote = async (data: {
  title: string;
  content: string;
  shareType: "one-time" | "time-based";
  accessType: "public" | "password-protected";
  expiresAt?: string;
}) => {
  const response = await api.post("/notes/new", data);

  return response.data;
};

export const revokeNote = async (id: string) => {
  const response = await api.patch(`/notes/${id}/revoke`);

  return response.data;
};

export const getSharedNote = async (token: string) => {
  const response = await api.get(`/share/${token}`);

  return response.data;
};

export const unlockSharedNote = async (
  token: string,
  accessKey: string
) => {
  const response = await api.post(`/share/${token}/unlock`, {
    accessKey,
  });

  return response.data;
};