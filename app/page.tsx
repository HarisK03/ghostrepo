"use client";

import { RiGhostFill } from "react-icons/ri";
import { FaArrowRight } from "react-icons/fa";
import { TimelineStep } from "./components/TimelineStep";
import FeaturesSection from "./components/FeaturesSection";
import FadeInSection from "./components/FadeInSection";
import Link from "next/link";

export default function Home() {
	return (
		<div className="relative flex flex-col items-center min-h-screen overflow-x-hidden">
			{/* Fixed gradient background */}
			<div
				className="fixed inset-0 -z-20"
				style={{
					background: `linear-gradient(
						45deg,
						#4d443d 0%,      /* left end */
						#3c372e 15%,     /* darker brown middle */
						#1e3b4f 50%,     /* dark teal/blue center */
						#2a4b58 85%,     /* lighter teal toward right */
						#26525f 100%     /* right end */
					)`,
					backgroundAttachment: "fixed",
				}}
			></div>

			{/* Stencil overlay */}
			<div
				className="fixed inset-0 -z-10 pointer-events-none"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1.5' fill='rgba(255,255,255,0.15)'/%3E%3C/svg%3E")`,
					backgroundRepeat: "repeat",
				}}
			></div>

			{/* Navbar */}
			<div className="fixed top-6 left-1/2 -translate-x-1/2 z-30">
				<div className="bg-transparent backdrop-blur-md rounded-full px-6 py-2 flex space-x-2 shadow-lg border border-white/10 font-semibold">
					{/* Demo - link to /demo */}
					<Link
						href="/demo"
						className="px-4 py-1 rounded-full text-[#ed8c45] transition-colors duration-300 hover:bg-neutral-900/25 cursor-pointer"
					>
						Demo
					</Link>

					{/* Features - link to #features section */}
					<a
						href="#top"
						className="px-4 py-1 rounded-full transition-colors duration-300 hover:bg-neutral-900/25 cursor-pointer"
					>
						Home
					</a>

					{/* Dashboard - link to /dashboard */}
					<Link
						href="/api/github/login"
						className="px-4 py-1 rounded-full transition-colors duration-300 hover:bg-neutral-900/25 cursor-pointer"
					>
						Dashboard
					</Link>
				</div>
			</div>

			{/* Main content */}
			<main className="flex-1 flex flex-col items-center justify-center px-6 w-full min-h-screen">
				<FadeInSection direction="up">
					<div className="max-w-4xl text-center space-y-8">
						<div className="flex flex-col text-9xl items-center text-white">
							<RiGhostFill
								className="
			animate-[ghostFloat_4s_ease-in-out_infinite]
			drop-shadow-[0_0_25px_rgba(255,255,255,0.25)]
		"
							/>
							<h3 className="text-2xl font-bold">GhostRepo</h3>

							{/* inline keyframes via Tailwind */}
							<style jsx>{`
								@keyframes ghostFloat {
									0%,
									100% {
										transform: translateY(0) scale(1);
										opacity: 0.95;
									}
									50% {
										transform: translateY(-12px) scale(1.03);
										opacity: 1;
									}
								}
							`}</style>
						</div>

						<div
							className="flex items-center justify-center space-x-2
            bg-[#4d443d]/15 backdrop-blur-md
            px-4 py-2 rounded-full border border-white/10
            w-auto max-w-[200px] mx-auto"
						>
							<span className="relative flex h-3 w-3">
								<span className="absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75 animate-ping [animation-duration:1.5s]"></span>
								<span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
							</span>
							<p className="text-xs text-white font-extrabold">
								STATUS
							</p>
							<span className="inline-block w-1 h-1 bg-white/20 rounded-full"></span>
							<p className="text-xs text-white font-extrabold">
								ONLINE
							</p>
						</div>

						<h1 className="text-7xl font-bold text-white">
							Share Private GitHub{" "}
							<span
								className="text-transparent"
								style={{
									background:
										"linear-gradient(to right, #60a2b5 25%, #ffffff 100%)",
									WebkitBackgroundClip: "text",
									backgroundClip: "text",
								}}
							>
								Repositories Publicly
							</span>
						</h1>

						<p className="text-gray-200 text-xl font-semibold">
							Share GitHub repositories with anyone. No GitHub
							account required. Repos stay private.
						</p>

						<button
							className="group relative overflow-hidden
            bg-gradient-to-br from-[#f4a261] via-[#ed8c45] to-[#c96a24]
            hover:from-[#f7b27a] hover:via-[#ed8c45] hover:to-[#b85f1f]
            px-12 py-4 rounded-full text-black font-bold text-md
            flex items-center gap-3 cursor-pointer mx-auto
            transition-all duration-300 ease-out
            hover:-translate-y-1
            shadow-[0_0_0px_rgba(237,140,69,0)]
            hover:shadow-[0_0_20px_rgba(237,140,69,0.6)]"
						>
							<span
								className="pointer-events-none absolute inset-0 -translate-x-full
                bg-gradient-to-r from-transparent via-white/40 to-transparent
                group-hover:translate-x-full transition-transform duration-700"
							/>
							<a href="/api/github/login">
								<span className="relative z-10">
									Login with GitHub
								</span>
							</a>
							<span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1 text-sm leading-none">
								<FaArrowRight />
							</span>
						</button>
					</div>
				</FadeInSection>
			</main>

			<FadeInSection direction="up">
				<div className="space-y-4">
					<div
						className="flex items-center justify-center space-x-2
            bg-[#4d443d]/15 backdrop-blur-md
            px-4 py-2 rounded-full border border-white/10
            w-auto max-w-[200px] mx-auto"
					>
						<span className="relative flex h-3 w-3">
							<span className="absolute inline-flex h-full w-full rounded-full bg-[#f7b27a] opacity-75 animate-ping [animation-duration:1.5s]"></span>
							<span className="relative inline-flex rounded-full h-3 w-3 bg-[#f4a261]"></span>
						</span>
						<p className="text-xs text-[#ed8c45] font-extrabold">
							ONE-CLICK SHARING
						</p>
					</div>
					<h2
						className="text-5xl font-bold text-transparent text-center"
						style={{
							background:
								"linear-gradient(to right, #60a2b5 25%, #ffffff 100%)",
							WebkitBackgroundClip: "text",
							backgroundClip: "text",
						}}
					>
						Private to Public
					</h2>
					<h4 className="text-center text-gray-400 text-lg">
						Sharing your code has never been easier.
					</h4>
				</div>
			</FadeInSection>

			{/* Demo Timeline Section */}
			<section className="relative flex flex-col items-center w-full py-12 px-6">
				<div className="flex flex-col space-y-16 max-w-4xl w-full relative z-10">
					{/* Step 1 - Left */}
					<FadeInSection direction="left">
						<TimelineStep
							side="left"
							number={1}
							title="Login with GitHub"
							description="Click this card to authenticate via GitHub. All your repos remain private."
						/>
					</FadeInSection>

					{/* Step 2 - Right */}

					<FadeInSection direction="right">
						<TimelineStep
							side="right"
							number={2}
							title="Install App to Repository"
							description="Install the GhostRepo app to your repository to enable sharing and management features."
						/>
					</FadeInSection>

					{/* Step 3 - Left */}

					<FadeInSection direction="left">
						<TimelineStep
							side="left"
							number={3}
							title="Create and Share Links"
							description="Generate shareable links for your private repositories with full control."
						/>
					</FadeInSection>

					{/* Step 3 - Right */}

					<FadeInSection direction="right">
						<TimelineStep
							side="right"
							number={4}
							title="Manage Shared Repositories"
							description="Easily manage and revoke access to your shared repositories from the dashboard."
						/>
					</FadeInSection>
				</div>
			</section>

			<FeaturesSection />

			{/* Footer */}

			<footer className="w-full py-6 flex justify-center">
				<div className="w-full max-w-4xl bg-transparent backdrop-blur-md border border-white/10 px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between text-white text-sm rounded-2xl">
					{/* Left side */}
					<div className="flex justify-between w-full items-center">
						<div className="flex items-center space-x-2">
							<RiGhostFill className="text-4xl" />
							<span className="font-bold text-2xl">
								GhostRepo
							</span>
						</div>
						<p className="text-gray-400 font-bold">
							Created by{" "}
							<a
								href="https://harisk03.github.io/portfolio"
								target="_blank"
								className="text-[#ed8c45]"
							>
								Haris Kamal
							</a>
						</p>
					</div>

					{/* Optional right side for links */}
					<div className="mt-2 sm:mt-0 flex space-x-4">
						{/* Add social or other links if needed */}
					</div>
				</div>
			</footer>
		</div>
	);
}
