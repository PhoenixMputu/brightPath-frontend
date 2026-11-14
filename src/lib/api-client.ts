const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** Machine-readable error code sent by the API (e.g. EMAIL_ALREADY_IN_USE). */
  get code(): string | undefined {
    const body = this.body;
    if (typeof body === "object" && body !== null && "code" in body) {
      return typeof body.code === "string" ? body.code : undefined;
    }
    return undefined;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

/**
 * Small fetch client for the BrightPath API. Sends cookies, encodes JSON
 * bodies and throws an ApiError when the response is not ok.
 */
export async function apiFetch<T>(
  path: string,
  { body, headers, ...init }: RequestOptions = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body !== undefined && { "Content-Type": "application/json" }),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  const data: unknown = isJson ? await response.json() : undefined;

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Request to ${path} failed with status ${response.status}`,
      data,
    );
  }

  return data as T;
}
