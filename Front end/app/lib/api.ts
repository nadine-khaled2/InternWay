import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    timeout: 5000, // 5 seconds – fail fast when backend is down so mock data loads immediately
    withCredentials: true, // Crucial for cookie-based refresh tokens & logout
    headers: {
        'Content-Type': 'application/json',
        'X-Tunnel-Skip-AntiSpam-Page': 'true',
    },
});

let isRefreshing = false;
let failedRequestsQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedRequestsQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedRequestsQueue = [];
};

// Add a request interceptor to include auth token if available
api.interceptors.request.use(
    (config) => {
        // Prevent duplicate /api in the final request URL
        if (config.url && config.url.startsWith('/api/')) {
            config.url = config.url.substring(4);
        } else if (config.url && config.url.startsWith('api/')) {
            config.url = config.url.substring(3);
        }

        // Support both localStorage and sessionStorage
        const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || sessionStorage.getItem('token')) : null;
        
        // Exclude anonymous Account endpoints from receiving the Authorization header
        const urlLower = config.url ? config.url.toLowerCase() : '';
        const isAnonymous = urlLower.includes('account/login') ||
            urlLower.includes('account/signup') ||
            urlLower.includes('account/refreshtoken') ||
            urlLower.includes('account/logout') ||
            urlLower.includes('account/forgetpassword') ||
            urlLower.includes('account/resetpassword');

        if (isAnonymous) {
            if (config.headers) {
                delete config.headers.Authorization;
            }
        } else if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor for global response handling & auto refresh token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Auto Refresh Token on 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest._skipRefresh) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedRequestsQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Call GET /Account/refreshtoken to request a new access token
                // We pass _skipRefresh: true to avoid infinite interceptor loops
                const res = await api.get('/Account/refreshtoken', { _skipRefresh: true } as any);
                
                const data = res.data?.data || res.data;
                const newToken = data?.token || data; // handle direct or wrapped string token

                if (newToken) {
                    const rememberMe = typeof window !== 'undefined' && localStorage.getItem('rememberMe') === 'true';
                    if (rememberMe) {
                        localStorage.setItem('token', newToken);
                    } else {
                        sessionStorage.setItem('token', newToken);
                    }
                    
                    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                    
                    processQueue(null, newToken);
                    return api(originalRequest);
                } else {
                    throw new Error('No new token returned');
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                
                // If refresh token fails (e.g. 401), execute logout call to clear DB tokens
                try {
                    await api.delete('/Account/logout', { _skipRefresh: true } as any);
                } catch (logoutError) {
                    console.warn('Backend logout call failed during refresh failure:', logoutError);
                }

                // Clear tokens and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('refreshToken');
                sessionStorage.removeItem('user');
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;

export function getErrorMessage(error: any, defaultMessage: string = 'An error occurred'): string {
    if (error?.response?.data) {
        const data = error.response.data;
        if (typeof data === 'string') {
            return data;
        }
        if (typeof data === 'object' && data !== null) {
            const obj = data as Record<string, any>;
            if (obj.detail) return obj.detail;
            if (obj.message) return obj.message;
            if (obj.Message) return obj.Message;
            if (obj.errorMessage) return obj.errorMessage;
            if (obj.title) return obj.title;
            if (obj.errors && typeof obj.errors === 'object' && obj.errors !== null) {
                const errorsDict = obj.errors as Record<string, any>;
                const errorDetails = Object.keys(errorsDict)
                    .map(key => errorsDict[key])
                    .reduce((acc: any, val: any) => acc.concat(val), [])
                    .join(', ');
                if (errorDetails) return errorDetails;
            }
            // Raw ASP.NET ModelState dictionary: BadRequest(ModelState) serializes as
            // { "FieldName": ["error 1", "error 2"], "OtherField": ["error 3"] }
            // with no message/Message/errorMessage/title/errors wrapper at all.
            const keys = Object.keys(obj);
            const looksLikeModelState =
                keys.length > 0 &&
                keys.every(key => Array.isArray(obj[key]) && obj[key].every((v: any) => typeof v === 'string'));
            if (looksLikeModelState) {
                const errorDetails = keys
                    .map(key => obj[key])
                    .reduce((acc: string[], val: string[]) => acc.concat(val), [])
                    .join(', ');
                if (errorDetails) return errorDetails;
            }
        }
    }
    return error?.message || defaultMessage;
}
