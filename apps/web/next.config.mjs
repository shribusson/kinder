/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@kinder/shared'],
  async redirects() {
    return [
      {
        source: '/crm/vehicles',
        destination: '/crm/profiles',
        permanent: true,
      },
      {
        source: '/crm/settings/vehicle-brands',
        destination: '/crm/settings/directories',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
