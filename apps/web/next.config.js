/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@vms/shared"],
  output: "standalone",
};

module.exports = nextConfig;
