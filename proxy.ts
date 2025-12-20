import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token?.userId,
  },
});

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};


