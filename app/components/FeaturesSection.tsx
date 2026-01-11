"use client";

import { useState, useEffect } from "react";
import { FaCogs, FaChartLine, FaShieldAlt, FaDollarSign } from "react-icons/fa";
import FadeInSection from "./FadeInSection";

const features = [
	{
		id: 1,
		title: "Customizable Repository Sharing",
		icon: FaCogs,
		description:
			"Share your private repositories with full control. Customize access, expiration, and visibility of each shared link.",
		bullets: [
			"Students share restricted code with recruiters",
			"Password-protect shared repository links",
			"Set expiration dates for access",
			"Track which links are active or revoked",
			"Prevent code web scraping",
		],
	},
	{
		id: 2,
		title: "Real-time Analytics and Alerts",
		icon: FaChartLine,
		description:
			"Get real-time insights on who accesses your repositories. Receive alerts for link activity.",
		bullets: [
			"Receive instant email notifications on access",
			"Track repository access metrics in real-time",
			"Detailed logs for auditing purposes",
			"Customizable alert thresholds for your team",
		],
	},
	{
		id: 3,
		title: "Monetization",
		icon: FaDollarSign,
		description:
			"Monetize access to your repositories. Provide paid links securely and easily.",
		bullets: [
			"Integrate with Stripe for secure payments",
			"Set per-link pricing",
			"Track revenue per shared repository",
		],
	},
];

export default function FeaturesSection() {
	const [selectedFeature, setSelectedFeature] = useState(features[0]);
	const [animateKey, setAnimateKey] = useState(0);

	useEffect(() => {
		setAnimateKey((prev) => prev + 1);
	}, [selectedFeature]);

	const Icon = selectedFeature.icon; // ✅ fix for lowercase component error

	return (
		<FadeInSection direction="up">
			<section
				className="flex flex-col items-center w-full h-full py-96 px-6 bg-transparent"
				id="features"
			>
				{/* Core Features Pill */}
				<div className="flex items-center justify-center space-x-2 bg-[#4d443d]/15 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 w-auto max-w-[200px] mx-auto mb-4">
					<span className="relative flex h-3 w-3">
						<span className="absolute inline-flex h-full w-full rounded-full bg-[#f7b27a] opacity-75 animate-ping [animation-duration:1.5s]" />
						<span className="relative inline-flex rounded-full h-3 w-3 bg-[#f4a261]" />
					</span>
					<p className="text-xs text-[#ed8c45] font-extrabold">
						CORE FEATURES
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
					The Need for GhostRepo
				</h2>
				<h4 className="text-center text-gray-400 text-lg mt-4">
					The foundations of GhostRepo.
				</h4>

				<div className="max-w-5xl min-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
					{/* Left buttons */}
					<div className="flex flex-col space-y-4">
						{features.map((feature) => {
							const ButtonIcon = feature.icon;
							const isActive = selectedFeature.id === feature.id;

							return (
								<button
									key={feature.id}
									onClick={() => setSelectedFeature(feature)}
									className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left font-semibold bg-transparent backdrop-blur-md transition-all duration-300 ${
										isActive
											? "bg-[#ed8c45]/25 border border-[#ed8c45]"
											: "bg-[#4d443d]/20 border border-white/10"
									} hover:bg-[#ed8c45]/20 hover:border-[#ed8c45] cursor-pointer`}
								>
									<ButtonIcon
										className={`text-xl ${
											isActive
												? "text-[#ed8c45]"
												: "text-white/70"
										}`}
									/>
									<span
										className={
											isActive
												? "text-white"
												: "text-white/80"
										}
									>
										{feature.title}
									</span>
								</button>
							);
						})}
					</div>

					{/* Right card */}
					<div
						key={animateKey}
						className="md:col-span-2 relative border border-white/10 rounded-2xl p-8 backdrop-blur-xs bg-transparent transition-all duration-500 opacity-0 animate-fadeIn"
					>
						{/* Feature Header */}
						<div className="flex items-center gap-3 mb-4">
							<Icon className="text-3xl text-[#ed8c45]" />
							<h3 className="text-2xl font-bold text-white">
								{selectedFeature.title}
							</h3>
						</div>

						{/* Feature description */}
						<p className="text-gray-300/50 mb-4">
							{selectedFeature.description}
						</p>

						{/* Separator Line */}
						<div className="h-[2px] w-full bg-white/5 rounded-full mb-6 z-20" />

						{/* Feature bullets */}
						<ul className="space-y-3">
							{selectedFeature.bullets.map((bullet, idx) => (
								<li
									key={idx}
									className="flex items-start gap-3"
								>
									<span className="mt-1 text-[#f4a261]/70">
										<svg
											className="w-3 h-3"
											fill="currentColor"
											viewBox="0 0 8 8"
										>
											<circle cx="4" cy="4" r="4" />
										</svg>
									</span>
									<span className="text-gray-200">
										{bullet}
									</span>
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Tailwind animation keyframes */}
				<style jsx>{`
					@keyframes fadeIn {
						0% {
							opacity: 0;
							transform: translateY(16px);
						}
						100% {
							opacity: 1;
							transform: translateY(0);
						}
					}
					.animate-fadeIn {
						animation: fadeIn 0.4s ease-out forwards;
					}
				`}</style>
			</section>
		</FadeInSection>
	);
}
