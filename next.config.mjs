/** @type {import('next').NextConfig} */
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnline: true,
  swMinify: true,
  disable: false,
  workboxOptions: {
    disableDevLogs: false,
  },
});

const nextConfig = {};

export default withPWA(nextConfig);
