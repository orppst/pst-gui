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

type ErrorWithMessage = {
    message: string
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as Record<string, unknown>).message === 'string'
    )
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
    if (isErrorWithMessage(maybeError)) return maybeError

    try {
        return new Error(JSON.stringify(maybeError))
    } catch {
        // fallback in case there's an error from stringify
        return new Error(String(maybeError))
    }
}

function getErrorMessage(error: unknown) {
    return toErrorWithMessage(error).message
}