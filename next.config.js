/** @type {import('next').NextConfig} */

const nextConfig = {
  // output: 'export',
  output: 'hybrid',

  experimental: {
    appDir: true,
    
  },
//   async headers() {
//     return [
//         {
//             // matching all API routes
//             source: "/api/:path*",
//             headers: [
//                 { key: "Access-Control-Allow-Credentials", value: "true" },
//                 { key: "Access-Control-Allow-Origin", value: "https://plabipd.de/projects/ata/*" }, // replace this your actual origin
//                 { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
//                 { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
//             ]
//         }
//     ]
// },
// async headers() {
//   return [
//     {
//       source: "/api/:path*", // Adjust the source pattern as per your needs
//       headers: [
//         { key: "Access-Control-Allow-Credentials", value: "true" },
//         {
//           key: 'Access-Control-Allow-Origin',
//           value: "https://plabipd.de/projects/ata/", // Set the appropriate allowed origin value
//         },
//         {
//           key: 'Access-Control-Allow-Methods',
//           value: 'GET, POST, OPTIONS', // Set the allowed methods
//         },
//         {
//           key: 'Access-Control-Allow-Headers',
//           value: 'Origin, X-Requested-With, Content-Type, Accept', // Set the allowed headers
//         },
//       ],
//     },
//   ];
// },


  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { fs: false };
    }
    return config;
  },
  // Add the following line to enable CSS support
  cssModules: true,
};

module.exports = nextConfig;
