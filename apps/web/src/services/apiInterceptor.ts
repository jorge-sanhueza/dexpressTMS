class ApiInterceptor {
  constructor() {
    this.setupInterceptor();
  }

  private setupInterceptor() {
    const originalFetch = window.fetch;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input instanceof URL ? input.toString() : input;
      const request = new Request(url, init);
      const token = localStorage.getItem("access_token");

      if (token) {
        request.headers.set("Authorization", `Bearer ${token}`);
      }

      try {
        const response = await originalFetch.call(window, request);

        if (response.status === 401) {
          this.handleAuthError();
        }

        return response;
      } catch (error) {
        this.handleFetchError(error);
        throw error;
      }
    };
  }

  private handleAuthError() {
    console.log("🔄 Token expired, clearing auth...");
    this.clearAuth();
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
}

export const apiInterceptor = new ApiInterceptor();
