// src/lib/api-client.ts
class ApiClient {
  private async fetchWithAuth(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    const urlString =
      typeof input === "string"
        ? input
        : input instanceof URL
        ? input.toString()
        : input.url;
    const method =
      init?.method ||
      (typeof input !== "string" && !(input instanceof URL)
        ? input.method
        : "GET");

    // Skip modification for auth endpoints and OPTIONS requests
    const isAuthEndpoint = this.isAuthRequest(urlString);
    const isOptions = method === "OPTIONS";

    const token = localStorage.getItem("access_token");

    const headers: HeadersInit = {
      ...(init?.headers || {}),
      "Content-Type": "application/json",
      ...(token && !isAuthEndpoint && !isOptions
        ? { Authorization: `Bearer ${token}` }
        : {}),
    };

    try {
      const response = await fetch(input, { ...init, headers });

      if (response.status === 401) {
        this.handleAuthError();
        throw new Error("Authentication required");
      }

      return response;
    } catch (error) {
      this.handleFetchError(error);
      throw error;
    }
  }

  private isAuthRequest(url: string): boolean {
    const authPaths = [
      "/api/auth/login",
      "/api/auth/test-login",
      "/api/auth/register",
      "/api/auth/refresh",
    ];
    return authPaths.some((path) => url.includes(path));
  }

  private handleAuthError() {
    console.log("🔄 Auth error detected, clearing storage...");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("tenant");
    sessionStorage.clear();
    window.dispatchEvent(new CustomEvent("auth-expired"));
    window.location.href = "/login";
  }

  private handleFetchError(error: unknown) {
    const isNetworkError = error instanceof TypeError;
    const isAuthError =
      error instanceof Error && error.message === "Authentication required";

    if (isNetworkError || isAuthError) {
      this.clearAuth();
    }
  }

  private clearAuth() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.dispatchEvent(new CustomEvent("auth-expired"));
  }

  // Public API methods
  async get(url: string, init?: RequestInit) {
    return this.fetchWithAuth(url, { ...init, method: "GET" });
  }

  async post(url: string, data?: any, init?: RequestInit) {
    return this.fetchWithAuth(url, {
      ...init,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(url: string, data?: any, init?: RequestInit) {
    return this.fetchWithAuth(url, {
      ...init,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(url: string, init?: RequestInit) {
    return this.fetchWithAuth(url, { ...init, method: "DELETE" });
  }

  async patch(url: string, data?: any, init?: RequestInit) {
    return this.fetchWithAuth(url, {
      ...init,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export const apiClient = new ApiClient();
