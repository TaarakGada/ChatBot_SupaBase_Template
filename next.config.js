/** @type {import('next').NextConfig} */
const nextConfig = {
    serverActions: {
        bodySizeLimit: '10mb', // Increase the limit to 10MB
    },
};

module.exports = nextConfig;
