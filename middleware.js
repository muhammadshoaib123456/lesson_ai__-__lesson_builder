import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Additional logic if needed
    console.log("Protected route accessed:", req.nextUrl.pathname);
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/create-lesson/:path*"] // Protect entire create-lesson section
};