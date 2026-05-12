export class CWSError extends Error {
    override cause: unknown;
    override name = 'CWSError';
}

type ErrorResponse = {
    error?: {
        code?: number;
        message?: string;
        errors?: Array<{
            message?: string;
            domain?: string;
            reason?: string;
        }>;
    } | string;
    error_code?: string;
    error_description?: string;
};

function parseErrorMessage(response: unknown): string {
    const errorResponse = response as ErrorResponse;

    // Handle OAuth errors: { error: "invalid_grant", error_description: "Bad Request" }
    if (typeof errorResponse.error === 'string') {
        if (errorResponse.error === 'invalid_grant') {
            return 'Invalid grant: The authentication keys are probably invalid or expired';
        }

        if (errorResponse.error === 'invalid_request') {
            return `Invalid request: ${errorResponse.error_description ?? 'Missing required parameters'}`;
        }

        return errorResponse.error_description ?? errorResponse.error;
    }

    // Handle API errors: { error: { code: 400, message: "...", errors: [...] } }
    if (errorResponse.error && typeof errorResponse.error === 'object') {
        const { error } = errorResponse;
        if (error.message) {
            // Remove "Publish condition not met: " prefix if present
            return error.message.replace(/^Publish condition not met: /, '');
        }
    }

    return 'Unknown error';
}

export function throwIfNotOk(request: Response, response: Record<string, unknown>) {
    if (!request.ok) {
        const message = parseErrorMessage(response);
        const error = new CWSError(message);
        // https://github.com/fregante/chrome-webstore-upload/issues/117
        error.cause = 'error' in response ? response['error'] : response;
        throw error;
    }
}
