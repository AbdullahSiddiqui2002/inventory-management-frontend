import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow all tunnel domains in development without cross-origin blocks
  allowedDevOrigins: [
    "bore.pub",
    "bore.pub:51106",
    "*.bore.pub",
    "*.ngrok-free.app",
    "*.ngrok.io",
    "*.ngrok.app",
    "stockcore-build.loca.lt",
    "*.loca.lt",
    "*.lhr.life",
    "localhost:3000",
    "127.0.0.1:3000",
  ],
  async rewrites() {
    return [
      {
        source: "/api/Auth/:path*",
        destination: "http://localhost:5151/api/Auth/:path*",
      },
      {
        source: "/api/Project/:path*",
        destination: "http://localhost:5151/api/Project/:path*",
      },
      {
        source: "/api/Supervisor/:path*",
        destination: "http://localhost:5151/api/Supervisor/:path*",
      },
      {
        source: "/api/Product/:path*",
        destination: "http://localhost:5151/api/Product/:path*",
      },
      {
        source: "/api/Category/:path*",
        destination: "http://localhost:5151/api/Category/:path*",
      },
      {
        source: "/api/Supplier/:path*",
        destination: "http://localhost:5151/api/Supplier/:path*",
      },
      {
        source: "/api/Health/:path*",
        destination: "http://localhost:5151/api/Health/:path*",
      },
      {
        source: "/api/Admin/:path*",
        destination: "http://localhost:5151/api/Admin/:path*",
      },
    ];
  },
};

export default nextConfig;
