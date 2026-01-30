import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Đường dẫn cần bảo vệ
const protectedRoutes = [
  "/",
  "/manage-users",
  "/list-orders",
  "/create-order",
  "/list-product",
  "/product-exams",
  "/product-students",
  "/exam-questions",
  "/check-exam",
];

// Middleware
export function middleware(request: NextRequest) {
  const currentUser = request.cookies.get("user")?.value;
  const { pathname } = request.nextUrl;

  console.log("🔒 Middleware check:", {
    pathname,
    hasUser: !!currentUser,
    userAgent: request.headers.get("user-agent")?.slice(0, 50),
    host: request.headers.get("host"),
  });

  // Đã đăng nhập nhưng đang ở trang login -> chuyển về trang chủ
  if (currentUser && pathname === "/login") {
    console.log("✅ User logged in, redirecting from login to dashboard");
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Chưa đăng nhập và đang ở trang cần bảo vệ -> chuyển về trang đăng nhập
  if (!currentUser && isProtectedRoute(pathname)) {
    console.log("❌ No user found, redirecting to login");
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.set({
      name: "redirect",
      value: pathname,
    });
    return response;
  }

  console.log("✅ Middleware passed, continuing...");
  return NextResponse.next();
}

// Kiểm tra xem đường dẫn có cần bảo vệ hay không
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

// Cấu hình Middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};
