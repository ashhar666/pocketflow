/** @type {import('next').NextConfig} */
const nextConfig = {
    compress: true,
    images: {
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '**',
            },
        ],
    },
    trailingSlash: false,
    async rewrites() {
        return [
            {
                source: '/api',
                destination: 'https://ashharshahan-pocketflow.hf.space/api/',
            },
            {
                source: '/api/:path*',
                // Append trailing slash to ensure Django backend doesn't 301 redirect POST requests causing data drops
                destination: 'https://ashharshahan-pocketflow.hf.space/api/:path*/',
            },
        ];
    },
    // Performance optimizations
    swcMinify: true,
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    experimental: {
        optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
    },
    typescript: {
        ignoreBuildErrors: false,
    },
    eslint: {
        ignoreDuringBuilds: false,
    },
};

export default nextConfig;
