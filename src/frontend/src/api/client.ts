import axios from 'axios'

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  // Required for the browser to send and receive the authentication cookie.
  withCredentials: true,
})

export default apiClient
