import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
	title: "GhostRepo - Unlisted GitHub Sharing",
	description: "Unlisted GitHub Sharing",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="scroll-smooth">
			<body className="antialiased">
				{children}
				<Toaster
					position="bottom-center"
					toastOptions={{
						className: "rounded-full", // Tailwind classes
						style: {
							// fallback inline styles
							background: "#000",
							color: "#fff",
							borderRadius: "12px",
						},
					}}
				/>
			</body>
		</html>
	);
}
