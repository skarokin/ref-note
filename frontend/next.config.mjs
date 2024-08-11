/** @type {import('next').NextConfig} */
const nextConfig = {
    // for images lol
    images: {
        remotePatterns: [
        {
            protocol: 'https',
            hostname: 'lh3.googleusercontent.com',
        },
        ],
    }
};

export default nextConfig;
