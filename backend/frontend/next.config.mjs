/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
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
    typescript: {
        ignoreBuildErrors: false,
    },
    eslint: {
        ignoreDuringBuilds: false,
    },
};

export default nextConfig;
