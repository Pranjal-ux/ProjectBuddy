import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    const rawBackendUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.BACKEND_URL ||
      "http://127.0.0.1:5000/api";
    const backendHost = rawBackendUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");

    return [
      {
        source: "/api/:path*",
        destination: `${backendHost}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

