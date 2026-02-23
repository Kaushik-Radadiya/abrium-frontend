const SESSION_EXPIRED_ERROR = 'Session expired';
const GENERIC_REQUEST_ERROR = 'Something went wrong while processing request';

export type ApiClientOptions = Omit<RequestInit, 'headers'> & {
  isForm?: boolean;
  headers?: HeadersInit;
  addAuthorization?: boolean;
  accessToken?: string | null;
  locale?: string;
};

function getRiskAlertMessage(record: Record<string, unknown>) {
  const directRisk = record.risk;
  if (directRisk && typeof directRisk === 'object') {
    const alertMessage = (directRisk as Record<string, unknown>).alertMessage;
    if (typeof alertMessage === 'string' && alertMessage.trim()) {
      return alertMessage;
    }
  }

  const payloadData = record.data;
  if (payloadData && typeof payloadData === 'object') {
    const risk = (payloadData as Record<string, unknown>).risk;
    if (risk && typeof risk === 'object') {
      const alertMessage = (risk as Record<string, unknown>).alertMessage;
      if (typeof alertMessage === 'string' && alertMessage.trim()) {
        return alertMessage;
      }
    }
  }

  return null;
}

function getErrorMessageFromJsonPayload(
  payload: unknown,
  fallback: string,
): string {
  if (!payload || typeof payload !== 'object') return fallback;
  const record = payload as Record<string, unknown>;
  const error = record.error;
  const message = record.message;
  const riskAlertMessage = getRiskAlertMessage(record);

  if (typeof error === 'string' && error.trim()) {
    if (riskAlertMessage) {
      return `${error}: ${riskAlertMessage}`;
    }
    return error;
  }

  if (typeof message === 'string' && message.trim()) {
    if (riskAlertMessage) {
      return `${message}: ${riskAlertMessage}`;
    }
    return message;
  }

  return fallback;
}

async function parseResponsePayload<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';

  if (contentType.includes('application/json') || contentType.includes('+json')) {
    const payload = (await response.json().catch(() => null)) as unknown;
    if (!response.ok) {
      const fallback =
        response.status === 401 || response.status === 403
          ? SESSION_EXPIRED_ERROR
          : GENERIC_REQUEST_ERROR;
      throw new Error(getErrorMessageFromJsonPayload(payload, fallback));
    }
    return payload as T;
  }

  if (
    contentType.includes('application/octet-stream') ||
    contentType.includes('text/csv')
  ) {
    if (!response.ok) {
      throw new Error(
        response.status === 401 || response.status === 403
          ? SESSION_EXPIRED_ERROR
          : GENERIC_REQUEST_ERROR,
      );
    }
    return response as T;
  }

  if (response.status === 204 && response.ok) {
    return undefined as T;
  }

  if (!response.ok) {
    throw new Error(
      response.status === 401 || response.status === 403
        ? SESSION_EXPIRED_ERROR
        : GENERIC_REQUEST_ERROR,
    );
  }

  throw new Error(GENERIC_REQUEST_ERROR);
}

export async function apiClient<T = unknown>(
  url: string,
  requestOptions: ApiClientOptions = {},
) {
  const {
    isForm = false,
    headers: initialHeaders,
    addAuthorization = false,
    accessToken = null,
    locale = 'en',
    ...rest
  } = requestOptions;

  const headers = new Headers(initialHeaders);

  if (addAuthorization && accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  headers.set('accept-language', locale);

  if (!isForm && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...rest, headers });
  return parseResponsePayload<T>(response);
}
