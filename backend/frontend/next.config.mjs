/** @type {import('next').NextConfig} */
const nextConfig = {
    compress: true,
    poweredByHeader: false,
    productionBrowserSourceMaps: false,
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
                // Trailing slash prevents Django from 301-redirecting POST requests
                destination: 'https://ashharshahan-pocketflow.hf.space/api/:path*/',
            },
        ];
    },
    async headers() {
        return [
            {
                // Static assets — cache for 1 year (immutable, content-hashed filenames)
                source: '/_next/static/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                // Enable DNS prefetch for all pages
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                ],
            },
        ];
    },
    swcMinify: true,
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    experimental: {
        optimizePackageImports: [
            'lucide-react',
            'recharts',
            'framer-motion',
            'date-fns',
        ],
    },
    typescript: {
        ignoreBuildErrors: false,
    },
    eslint: {
        ignoreDuringBuilds: false,
    },
};

export default nextConfig;
