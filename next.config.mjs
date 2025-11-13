/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.inteative.com',
        pathname: '/bestearsofowl/images/**',
      },
    ],
  },
};

export default nextConfig;
