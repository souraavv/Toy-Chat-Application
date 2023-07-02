import http from "./httpService";

// /api/auth/register
const apiEndPoint = "/auth/register";

export function register(user) {
  return http.post(apiEndPoint, user);
}
