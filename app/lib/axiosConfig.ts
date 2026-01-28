import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Use local proxy to bypass CORS
const OCR_API_BASE_URL = '/api';
const OCR_TIMEOUT = 5 * 60 * 1000; // 5 minutes timeout (API can take 2-3 min)

/**
 * Create axios instance for OCR API (via local proxy)
 */
export const ocrApiClient: AxiosInstance = axios.create({
    baseURL: OCR_API_BASE_URL,
    timeout: OCR_TIMEOUT,
    headers: {
        'Accept': 'application/json',
    },
});

// Request interceptor - logging
ocrApiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        console.log(`[OCR API] Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error: AxiosError) => {
        console.error('[OCR API] Request Error:', error.message);
        return Promise.reject(error);
    }
);

// Response interceptor - logging and error transformation
ocrApiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        console.log(`[OCR API] Response: ${response.status} - Success`);
        return response;
    },
    (error: AxiosError) => {
        if (error.code === 'ECONNABORTED') {
            console.error('[OCR API] Timeout - Request took too long');
        } else if (error.response) {
            console.error(`[OCR API] Error ${error.response.status}:`, error.response.data);
        } else if (error.request) {
            console.error('[OCR API] Network Error - No response received');
        } else {
            console.error('[OCR API] Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default ocrApiClient;
