/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@vms/shared"],
  output: "standalone",
  allowedDevOrigins: [
    "https://vms.aptechgroup.com",
    "https://vms.aptechgroup.net",
  ],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3001/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
