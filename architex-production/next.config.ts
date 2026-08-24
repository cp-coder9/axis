import type {NextConfig} from 'next';

const staticExport = process.env.ARCHITEX_STATIC_EXPORT === '1';

const nextConfig: NextConfig = {
  distDir: process.env.ARCHITEX_GOD_MODE_TEST === 'true' ? '.next-god-mode' : '.next',
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow local-dev access from 127.0.0.1 / localhost (dev-only origins;
  // cross-origin /_next/* requests are otherwise blocked with 403).
  allowedDevOrigins: ['127.0.0.1', 'localhost', '100.86.64.121'],
  // Allow access to remote image placeholder.
  images: {
    unoptimized: staticExport,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // This allows any path under the hostname
      },
    ],
  },
  // Tunnel/proxy: forward /api/* to the local PHP API so the app works
  // from any public hostname (Cloudflare tunnel) without CORS or
  // exposing the API port directly.
  ...(staticExport ? {} : {
    async rewrites() {
      return [
        { source: '/api/:path*', destination: 'http://127.0.0.1:8080/api/:path*' },
      ];
    },
  }),

  output: staticExport ? 'export' : 'standalone',
  transpilePackages: ['motion'],
  webpack: (config, {dev}) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
