import api from "./axios";

export const startInterviewApi = (payload) => api.post("/interviews/start", payload);

export const submitAnswerApi = (interviewId, payload) =>
  api.post(`/interviews/${interviewId}/answer`, payload);

export const completeInterviewApi = (interviewId) =>
  api.post(`/interviews/${interviewId}/complete`);

export const getInterviewApi = (interviewId) => api.get(`/interviews/${interviewId}`);

export const getHistoryApi = () => api.get("/interviews/history");

export const getAnalyticsApi = () => api.get("/interviews/analytics");
