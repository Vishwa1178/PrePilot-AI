import api from "./axios";

export const registerApi = (payload) => api.post("/auth/register", payload);

export const loginApi = (payload) => api.post("/auth/login", payload);

export const getMeApi = () => api.get("/auth/me");

export const updateMeApi = (payload) => api.put("/auth/me", payload);
