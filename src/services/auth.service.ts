import axiosInstance from "../api/axios";
import type { LoginRequest, RegisterRequest, AuthResponse } from "../types/auth.types";
// import { LoginRequest } from "../types/auth.types";

export const loginApi = async (data: LoginRequest) => {
  const res = await axiosInstance.post<AuthResponse>("/auth/login", data);
  return res.data;
};

export const registerApi = async (data: RegisterRequest) => {
  const res = await axiosInstance.post<AuthResponse>("/auth/register", data);
  return res.data;
};
