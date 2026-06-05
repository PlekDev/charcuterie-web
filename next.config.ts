import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Empaqueta un servidor autocontenido en .next/standalone para una imagen
  // Docker liviana (no requiere node_modules en runtime).
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  // En el build de producción borra los console.* del bundle de CLIENTE para no
  // filtrar info por la consola del navegador. Conserva error/warn. En dev no
  // toca nada (false). Los logs de SERVIDOR (route handlers/proxy) no se ven
  // afectados: nunca llegan al navegador.
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rrwoycsdxiaaesifzwut.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.bing.net',
      },
      {
        protocol: 'https',
        hostname: 'th.bing.com',
      },
      {
        protocol: 'https',
        hostname: 'i5.walmartimages.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        // Imágenes de productos guardadas en Supabase Storage.
        // El `**` cubre el subdominio del proyecto en cualquier entorno.
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
