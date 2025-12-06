/** @type {import('next').NextConfig} */
import withPWAInit from "@ducanh2912/next-pwa";
import bundleAnalyzer from "@next/bundle-analyzer";

const withPWA = withPWAInit({
    dest: "public",
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnline: true,
    swMinify: true,
    disable: process.env.NODE_ENV === "development",
    workboxOptions: {
        disableDevLogs: false,
    },
});

const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
    output: "standalone",
    reactStrictMode: true,
    turbopack: {}, // Explicitly enable Turbopack to resolve build conflicts
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "peerlist.io",
            },
        ],
    },
};

export default withBundleAnalyzer(withPWA(nextConfig));
