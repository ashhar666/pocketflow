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
    // Proxy API requests to Hugging Face to solve cross-domain auth issues
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'https://ashharshahan-pocketflow.hf.space/api/:path*',
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
