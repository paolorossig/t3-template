type ErrorWithMessage = {
  message: string;
};
type ErrorWithName = {
  name: string;
};

const isErrorWith = (error: unknown, property: string) => {
  return (
    typeof error === 'object' &&
    error !== null &&
    property in error &&
    typeof (error as Record<string, unknown>)[property] === 'string'
  );
};

const isErrorWithMessage = (error: unknown): error is ErrorWithMessage => {
  return isErrorWith(error, 'message');
};

const isErrorWithName = (error: unknown): error is ErrorWithName => {
  return isErrorWith(error, 'name');
};

const toErrorWithMessage = (maybeError: unknown): ErrorWithMessage => {
  if (isErrorWithMessage(maybeError)) return maybeError;

  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError));
  }
};

export const getErrorMessage = (error: unknown) => {
  return toErrorWithMessage(error).message;
};

export const getErrorName = (error: unknown) => {
  return isErrorWithName(error) ? error.name : '';
};
