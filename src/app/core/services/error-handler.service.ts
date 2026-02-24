import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * ErrorHandlerService
 * 
 * Responsible for:
 * - Logging error details to console for debugging
 * - Transforming technical error messages into user-friendly messages
 * - Adding timestamps and context to error logs
 * - Sanitizing sensitive data from error logs
 * 
 * Validates Requirements: 5.4
 */
@Injectable({
    providedIn: 'root'
})
export class ErrorHandlerService {

    /**
     * Logs error details to console with timestamp and context
     * @param error - The error to log
     * @param context - Optional context information about where the error occurred
     */
    log(error: Error | HttpErrorResponse | unknown, context?: string): void {
        const timestamp = new Date().toISOString();
        const sanitizedError = this.sanitizeError(error);

        const logEntry = {
            timestamp,
            context: context || 'Unknown context',
            error: sanitizedError,
            message: this.getErrorMessage(error),
            stack: error instanceof Error ? error.stack : undefined
        };

        // Log to console in development
        console.error('[ErrorHandler]', logEntry);

        // In production, this could be sent to a logging service
        // Example: this.loggingService.logError(logEntry);
    }

    /**
     * Transforms technical error messages into user-friendly messages
     * @param error - The error to transform
     * @returns User-friendly error message
     */
    transformError(error: Error | HttpErrorResponse | unknown): string {
        if (error instanceof HttpErrorResponse) {
            return this.transformHttpError(error);
        }

        if (error instanceof Error) {
            return this.transformApplicationError(error);
        }

        return 'An unexpected error occurred';
    }

    /**
     * Transforms HTTP errors into user-friendly messages
     * @param error - The HTTP error response
     * @returns User-friendly error message
     */
    private transformHttpError(error: HttpErrorResponse): string {
        // Network errors (status 0)
        if (error.status === 0) {
            return 'Unable to connect. Please check your internet connection.';
        }

        // HTTP error codes
        switch (error.status) {
            case 404:
                return 'Pokemon not found';
            case 429:
                return 'Too many requests. Please try again in a moment.';
            case 500:
            case 502:
            case 503:
            case 504:
                return 'Service temporarily unavailable. Please try again.';
            default:
                if (error.status >= 500 && error.status < 600) {
                    return 'Service temporarily unavailable. Please try again.';
                }
                return 'An unexpected error occurred';
        }
    }

    /**
     * Transforms application runtime errors into user-friendly messages
     * @param error - The application error
     * @returns User-friendly error message
     */
    private transformApplicationError(error: Error): string {
        // Check for specific error types or messages
        if (error.message.includes('timeout')) {
            return 'Request timed out. Please try again.';
        }

        if (error.message.includes('network')) {
            return 'Network error occurred. Please check your connection.';
        }

        return 'An unexpected error occurred';
    }

    /**
     * Sanitizes sensitive data from error objects
     * @param error - The error to sanitize
     * @returns Sanitized error object
     */
    private sanitizeError(error: unknown): unknown {
        if (error instanceof HttpErrorResponse) {
            return {
                status: error.status,
                statusText: error.statusText,
                url: this.sanitizeUrl(error.url),
                message: error.message
            };
        }

        if (error instanceof Error) {
            return {
                name: error.name,
                message: error.message,
                // Stack trace is kept for debugging but could be sanitized further if needed
                stack: error.stack
            };
        }

        return error;
    }

    /**
     * Sanitizes URLs by removing sensitive query parameters
     * @param url - The URL to sanitize
     * @returns Sanitized URL
     */
    private sanitizeUrl(url: string | null): string | null {
        if (!url) {
            return null;
        }

        try {
            const urlObj = new URL(url);
            // Remove sensitive query parameters (e.g., tokens, keys)
            const sensitiveParams = ['token', 'key', 'secret', 'password', 'api_key'];
            sensitiveParams.forEach(param => {
                if (urlObj.searchParams.has(param)) {
                    urlObj.searchParams.set(param, '[REDACTED]');
                }
            });
            return urlObj.toString();
        } catch {
            // If URL parsing fails, return the original URL
            return url;
        }
    }

    /**
     * Extracts error message from various error types
     * @param error - The error to extract message from
     * @returns Error message
     */
    private getErrorMessage(error: unknown): string {
        if (error instanceof HttpErrorResponse) {
            return error.message;
        }

        if (error instanceof Error) {
            return error.message;
        }

        if (typeof error === 'string') {
            return error;
        }

        return 'Unknown error';
    }
}
