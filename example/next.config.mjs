/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,

	basePath: "/xplevelsystem",

	experimental: {
		serverActions: {
			allowedOrigins: ["triooo.com.br", "www.triooo.com.br"],
		},
	},
};

export default nextConfig;
