/*
        USAGE:

        try {
            <code-to-try>
        }
        catch (error) {
            console.log({message: getErrorMessage(error)});
            //or whatever logging your using - continue dealing with error
        }
 */

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
    }
    where statusCode is the relevant internet error code.
    We need to display the stack.message string NOT the top level message string
 */

type ErrorWithMessage = {
    message: string
}

type ErrorWithStack = {
    stack: {
        exceptionType: string,
        message: string,
        statusCode: number
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
        console.log("error object: " + maybeError.stack);
        if (isErrorWithMessage(maybeError.stack)) {
            console.log("stack message: " + maybeError.stack.message)
            return maybeError.stack
        }
    }

    if (isErrorWithMessage(maybeError)) return maybeError

    try {
        return new Error(JSON.stringify(maybeError))
    } catch {
        // fallback in case there's an error from stringify
        return new Error(String(maybeError))
    }
}

export default function getErrorMessage(error: unknown) {
    return toErrorWithMessage(error).message
}