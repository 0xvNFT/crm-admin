import axios from 'axios'

const client = axios.create({
  withCredentials: true,
})

client.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      window.location.pathname !== '/login'
    ) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default client
