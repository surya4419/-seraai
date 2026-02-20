import axios from 'axios';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

export const setupAxiosInterceptors = (onLogout) => {
  // Response interceptor to handle token refresh
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If error is 401 and we haven't tried to refresh yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers['Authorization'] = 'Bearer ' + token;
              return axios(originalRequest);
            })
            .catch(err => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          // No refresh token, logout
          isRefreshing = false;
          onLogout();
          return Promise.reject(error);
        }

        try {
          // Try to refresh the token
          const response = await axios.post('/api/auth/refresh', {
            refreshToken
          });

          const { access_token, refresh_token } = response.data;
          
          // Update stored tokens
          localStorage.setItem('token', access_token);
          localStorage.setItem('refreshToken', refresh_token);
          
          // Update axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
          
          // Process queued requests
          processQueue(null, access_token);
          
          // Retry original request
          originalRequest.headers['Authorization'] = 'Bearer ' + access_token;
          isRefreshing = false;
          
          return axios(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          processQueue(refreshError, null);
          isRefreshing = false;
          onLogout();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};
