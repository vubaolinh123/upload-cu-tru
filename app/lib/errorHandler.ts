import { AxiosError } from 'axios';

/**
 * Error messages in Vietnamese
 */
const ERROR_MESSAGES = {
    TIMEOUT: 'Yêu cầu đã hết thời gian chờ. API có thể đang quá tải, vui lòng thử lại sau.',
    NETWORK: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
    SERVER: 'Lỗi server. Vui lòng thử lại sau.',
    UNKNOWN: 'Có lỗi xảy ra khi phân tích ảnh.',
    ABORTED: 'Yêu cầu đã bị hủy.',
};

/**
 * Parse axios error and return user-friendly Vietnamese message
 */
export function parseApiError(error: unknown): string {
    if (error instanceof AxiosError) {
        // Timeout error
        if (error.code === 'ECONNABORTED') {
            return ERROR_MESSAGES.TIMEOUT;
        }

        // Request was aborted
        if (error.code === 'ERR_CANCELED') {
            return ERROR_MESSAGES.ABORTED;
        }

        // Network error (no response)
        if (!error.response) {
            return ERROR_MESSAGES.NETWORK;
        }

        // Server responded with error
        const status = error.response.status;
        if (status >= 500) {
            return ERROR_MESSAGES.SERVER;
        }

        // Try to get message from response
        const data = error.response.data as { message?: string } | undefined;
        if (data?.message) {
            return data.message;
        }

        return `Lỗi ${status}: ${error.message}`;
    }

    // Standard Error
    if (error instanceof Error) {
        return error.message;
    }

    return ERROR_MESSAGES.UNKNOWN;
}

/**
 * Check if error is timeout error
 */
export function isTimeoutError(error: unknown): boolean {
    return error instanceof AxiosError && error.code === 'ECONNABORTED';
}

/**
 * Check if error is network error
 */
export function isNetworkError(error: unknown): boolean {
    return error instanceof AxiosError && !error.response && error.code !== 'ECONNABORTED';
}
