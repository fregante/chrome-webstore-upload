import type { ItemResource } from './types.js';

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
            // Check for specific error_description values
            if (errorResponse.error_description === 'The OAuth client was not found.') {
                return 'Invalid grant: The OAuth client was not found. The provided client ID is probably not valid. Try following the guide: https://github.com/fregante/chrome-webstore-upload-keys';
            }

            if (errorResponse.error_description === 'Bad Request') {
                return 'Invalid grant: Bad Request. The provided refresh token is probably not valid. Try following the guide: https://github.com/fregante/chrome-webstore-upload-keys';
            }

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

    // Handle item errors in ItemResource: { itemError: [{ error_code: "...", error_detail: "..." }] }
    const itemResource = response as ItemResource;
    if (itemResource.itemError && Array.isArray(itemResource.itemError) && itemResource.itemError.length > 0) {
        const errorDetails = itemResource.itemError.map(error => error.error_detail).join('; ');
        return errorDetails;
    }

    // Handle IN_PROGRESS upload state
    if (itemResource.uploadState === 'IN_PROGRESS') {
        return 'Upload is in progress. Try setting or increasing the maxAwaitInProgressResponseSeconds parameter to wait for the upload to complete';
    }

    return 'Unknown error';
}

export function throwIfNotOk(request: Response, response: unknown) {
    // Check for upload failure even on HTTP 200
    const itemResource = response as Partial<ItemResource>;
    if (!request.ok || itemResource.uploadState === 'FAILURE') {
        const message = parseErrorMessage(response);
        const error = new CWSError(message);
        error.cause = response;
        throw error;
    }
}
