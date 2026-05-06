import { getApiUrl } from "@/contants/api";

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

export const fetchApi = async (endpoint: string, options: FetchOptions = {}) => {
  const { requireAuth = true, ...customOptions } = options;
  
  const headers = new Headers(customOptions.headers);
  
  if (requireAuth) {
    let token = null;
    if (typeof window !== "undefined") {
      token = localStorage.getItem("token");
    } else {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        token = cookieStore.get("token")?.value;
      } catch (e) {
        // ignore if not running in an App Router server context
      }
    }
    
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  // Set default content type to JSON if not provided
  if (!headers.has("Content-Type") && !(customOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(getApiUrl(endpoint), {
    ...customOptions,
    headers,
  });

  // Handle 401 Unauthorized globally
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      document.cookie = "user=; path=/; max-age=0";
      document.cookie = "token=; path=/; max-age=0";
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    } else {
      // Chạy ở Server Component -> dùng redirect của next/navigation
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const { redirect } = await import("next/navigation");
        redirect("/login");
      } catch (e) {
        // Luôn ném lỗi từ redirect() ra ngoài để Next.js xử lý chuyển hướng
        throw e;
      }
    }
    
    // Nếu vẫn không redirect được thì mới ném lỗi
    throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
  }

  return response;
};
