import http from "./httpService";

import jwtDecode from "jwt-decode";

const apiEndPoint = "/auth/login";
const tokenKey = "token";

http.setJwt(getJwt());

export async function login(user) {
  const {data} = await http.post(apiEndPoint, user); // We get the token and store it in the localStorage
  //console.log(token);
  localStorage.setItem(tokenKey, data.token);
  return data;
}

// We are simply storing the token when we are rendering user from the register form
export function loginWithJwt(jwt) {
  localStorage.setItem(tokenKey, jwt);
}

export function logout() {
  localStorage.removeItem(tokenKey);
}

export function getCurrentUser() {
  try {
    const jwt = localStorage.getItem(tokenKey);
    const user = jwtDecode(jwt);
    return user;
  } catch (ex) {
    return null;
  }
}

export function getJwt() {
  return localStorage.getItem(tokenKey);
}
export default { login, loginWithJwt, logout, getCurrentUser, getJwt };
