import axios from "axios";
import { toast } from "react-toastify";

axios.defaults.baseURL = "http://localhost:3900/api"

export function setJwt(jwt) {
  axios.defaults.headers.common["x-auth-token"] = jwt; 
}

axios.interceptors.response.use(null, error => {
  const expectedError =
    error.response &&
    error.response.status >= 400 &&
    error.response.status < 500;

  if (!expectedError) {
        toast("Something Unexpected happen!");
  }
  return Promise.reject(error);
});

// http.axios.get -> http.get

export default {
  get: axios.get,
  put: axios.put,
  post: axios.post,
  delete: axios.delete,
  setJwt
};
