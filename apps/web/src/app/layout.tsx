import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/omen/sidebar";

export const metadata: Metadata = {
	title: "OMEN - Futuristic Thinking Tool",
	description: "Protocol-constrained self-evolving agent dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className="dark">
			<body className="bg-omen-bg text-zinc-100 antialiased">
				<div className="flex h-screen">
					<Sidebar />
					<main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
				</div>
			</body>
		</html>
	);
}
