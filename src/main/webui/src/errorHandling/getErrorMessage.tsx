/*
    API error message format
    {
        message: string,
        name: string,
        stack: {
            exceptionType: string,
            message: string,
            statusCode: number
        }
        --OR--
        stack: {
          payload: string,
          status: string
        }
    }
    where statusCode is the relevant internet error code.
    We need to get either the stack.message string or the stack.payload string, if they exist,
    over the top-level "message".
 */

type ErrorWithMessage = {
    message: string
}

type ErrorWithStack = {
    stack: {
        exceptionType?: string,
        message?: string,
        statusCode?: number,
        payload?: string,
        status?: string
    }
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as Record<string, unknown>).message === 'string'
    )
}

function isErrorWithStack(error: unknown): error is ErrorWithStack {
    return (
        typeof error === 'object' &&
            error !== null &&
            'stack' in error &&
            typeof (error as Record<string, unknown>).stack === 'object'
    )
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {

    if (isErrorWithStack(maybeError)) {
        if (isErrorWithMessage(maybeError.stack)) {
            return maybeError.stack
        }

        return {message: maybeError.stack.payload ?? String(maybeError.stack)}
    }

    if (isErrorWithMessage(maybeError)) return maybeError

    try {
        return new Error(JSON.stringify(maybeError))
    } catch {
        // fallback in case there's an error from stringify
        return new Error(String(maybeError))
    }
}

/**
 * This function attempts to extract the details of any general error, if the details cannot be extracted
 * falls back to returning a string of the error object itself
 * @param error the error object
 * @returns a message string
 */
export default function getErrorMessage(error: unknown) {
    return toErrorWithMessage(error).message
}