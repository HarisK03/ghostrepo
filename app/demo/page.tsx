"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
	FiSearch,
	FiUsers,
	FiLink,
	FiEye,
	FiStar,
	FiBarChart2,
	FiSettings,
	FiTrash,
} from "react-icons/fi";
import { RiGhostFill } from "react-icons/ri";
import toast, { Toaster } from "react-hot-toast";
import RepoSettingsModal from "../components/RepoSettingsModal";
import { FaArrowLeft } from "react-icons/fa";

const AUTO_PIN_CLICK_THRESHOLD = 150;

const initialRepos = Array.from({ length: 10 }).map((_, i) => ({
	id: i + 1,
	name: `ghostrepo-project-${i + 1}`,
	githubUrl: `https://github.com/ghostrepo/ghostrepo-project-${i + 1}`,
	description: "Private repository shared securely via GhostRepo",
	shareUrl: `http://localhost:3000/share/FiPmwkcaVAq2`,
	shared: i % 2 === 0, // some repos start shared
	status: i % 3 === 0 ? "expired" : "live", // some repos are expired
	clicks: Math.floor(Math.random() * 200) + 20,
	viewers: Math.floor(Math.random() * 100) + 5,
	pinned: false,
}));

export default function DemoDashboard() {
	const [query, setQuery] = useState("");
	const [sharedQuery, setSharedQuery] = useState("");
	const [repos, setRepos] = useState([]);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [activeRepo, setActiveRepo] = useState(null);

	/* Handlers */
	const openSettings = (repo) => {
		setActiveRepo(repo);
		setSettingsOpen(true);
	};

	const closeSettings = () => {
		setSettingsOpen(false);
		setActiveRepo(null);
	};

	const handleSaveSettings = (updatedRepo) => {
		setRepos((prev) =>
			prev.map((r) => (r.id === updatedRepo.id ? updatedRepo : r))
		);
		toast.success("Settings saved!");
	};

	const handleShareRepo = (repo) => {
		setRepos((prev) =>
			prev.map((r) =>
				r.id === repo.id
					? { ...r, shared: true, status: "live" } // mark live when shared
					: r
			)
		);

		navigator.clipboard.writeText(repo.shareUrl);
		toast.success("Repository shared! Link copied to clipboard.");
	};

	const handleUnshareRepo = (repoId) => {
		setRepos((prev) =>
			prev.map((r) =>
				r.id === repoId ? { ...r, shared: false, status: "expired" } : r
			)
		);
		toast.success("Repository unshared!");
	};

	const togglePin = (id) => {
		setRepos((prev) =>
			prev.map((repo) =>
				repo.id === id ? { ...repo, pinned: !repo.pinned } : repo
			)
		);
	};

	/* Load + Auto-Pin */
	useEffect(() => {
		const storedPins = JSON.parse(
			localStorage.getItem("ghostrepo:pins") || "{}"
		);

		const hydrated = initialRepos.map((repo) => ({
			...repo,
			pinned:
				storedPins[repo.id] ?? repo.clicks >= AUTO_PIN_CLICK_THRESHOLD,
		}));

		setRepos(hydrated);
	}, []);

	/* Persist Pins */
	useEffect(() => {
		const pins = {};
		repos.forEach((r) => (pins[r.id] = r.pinned));
		localStorage.setItem("ghostrepo:pins", JSON.stringify(pins));
	}, [repos]);

	const sortedFilteredRepos = repos
		.slice()
		.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
		.filter((repo) =>
			repo.name.toLowerCase().includes(query.toLowerCase())
		);

	const sortedFilteredSharedRepos = repos
		.filter((r) => r.shared)
		.filter((r) => r.name.toLowerCase().includes(sharedQuery.toLowerCase()))
		.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)); // pinned first

	const totalEarned = repos.reduce(
		(sum, repo) => sum + repo.clicks * 0.12,
		0
	);

	return (
		<div className="min-h-screen w-full text-white bg-[#0f1829]">
			{/* Banner */}
			<div className="fixed top-0 left-0 z-50 w-full backdrop-blur-md bg-black/30 border-b border-white/10">
				<div className="max-w-6xl mx-auto py-3 flex justify-between items-center">
					<span className="text-sm text-gray-300/50 font-extrabold uppercase">
						You are viewing the GhostRepo demo
					</span>
					<Link
						href="/"
						className="text-sm font-semibold text-[#ed8c45] hover:text-white transition"
					>
						<FaArrowLeft className="inline mr-2 text-xs w-3 h-3 font-bold" />
						Back to Home
					</Link>
				</div>
			</div>

			<div className="px-6 py-24">
				{/* Header */}
				<div className="max-w-6xl mx-auto mb-10 flex items-center gap-3">
					<RiGhostFill className="text-4xl" />
					<h1 className="text-2xl font-bold">Dashboard</h1>
				</div>

				<div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* LEFT - Private Repo List (No Pin) */}
					<div className="lg:col-span-2 space-y-6">
						{/* Search */}
						<div className="relative">
							<FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
							<input
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="Search private repositories"
								className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none"
							/>
						</div>

						{/* Repo List */}
						<div className="space-y-3 max-h-[420px] overflow-y-auto no-scrollbar">
							{sortedFilteredRepos.map((repo) => (
								<div
									key={repo.id}
									className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center hover:bg-white/10 transition"
								>
									<div>
										<a
											href={repo.githubUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="font-semibold hover:text-[#ed8c45] transition"
										>
											{repo.name}
										</a>
										<p className="text-sm text-gray-400">
											{repo.description}
										</p>
									</div>

									<div className="flex items-center gap-4">
										{repo.shared && (
											<span className="border-2 border-[#306074] text-xs font-bold px-3 py-1 rounded-full bg-[#306074] text-[#78c5d9]">
												SHARED
											</span>
										)}

										{!repo.shared && (
											<button
												onClick={() =>
													handleShareRepo(repo)
												}
												className="font-bold border-2 text-[#78c5d9] hover:bg-[#306074] hover:text-[#78c5d9] hover:border-[#306074] px-2 py-1 rounded-full border border-[#78c5d9] text-xs cursor-pointer duration-300"
											>
												SHARE
											</button>
										)}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* RIGHT STATS */}
					<div className="grid grid-cols-2 gap-4 h-fit">
						<StatCard
							title="Repos Shared"
							value={repos.filter((r) => r.shared).length}
							icon={<FiUsers />}
						/>
						<StatCard
							title="Total Clicks"
							value="742"
							icon={<FiEye />}
						/>
						<StatCard
							title="Unique Viewers"
							value="318"
							icon={<FiUsers />}
						/>
						<StatCard
							title="Total Earned"
							value={`$${totalEarned.toFixed(2)}`}
							icon={<FiBarChart2 />}
						/>
					</div>
				</div>

				{/* SHARED REPOS */}
				<div className="max-w-6xl mx-auto mt-16">
					<h2 className="text-2xl font-bold mb-6">
						Shared Repositories
					</h2>

					<div className="relative mb-6">
						<FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
						<input
							value={sharedQuery}
							onChange={(e) => setSharedQuery(e.target.value)}
							placeholder="Search shared repositories"
							className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none"
						/>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{sortedFilteredSharedRepos.map((repo) => (
							<div
								key={repo.id}
								className="p-6 rounded-2xl border border-white/10 bg-white/5 relative"
							>
								<div className="flex justify-between mb-3">
									<div className="flex items-center gap-2">
										<span className="relative flex h-3 w-3">
											{repo.status === "live" && (
												<span className="absolute inline-flex h-full w-full rounded-full bg-[#f7b27a] opacity-75 animate-ping" />
											)}
											<span
												className={`relative inline-flex rounded-full h-3 w-3 ${
													repo.status === "live"
														? "bg-[#f4a261]"
														: "bg-gray-500"
												}`}
											/>
										</span>
										<p className="text-xs font-extrabold uppercase text-[#ed8c45]">
											{repo.status}
										</p>
									</div>
								</div>

								<h3 className="font-bold text-lg">
									{repo.name}
								</h3>
								<p className="text-sm text-gray-400 mt-1">
									{repo.description}
								</p>

								<div className="mt-4 flex justify-between items-center text-gray-500">
									<div className="flex items-center space-x-3">
										{/* Copy Share Link */}
										<button
											className="cursor-pointer"
											onClick={() => {
												navigator.clipboard.writeText(
													repo.shareUrl
												);
												toast.success(
													"Share link copied"
												);
											}}
											title="Copy Share Link"
										>
											<FiLink />
										</button>

										{/* Analytics */}
										<Link
											href={`/demo/analytics/${repo.id}`}
										>
											<FiBarChart2 title="Analytics" />
										</Link>

										{/* Settings */}
										<button
											className="cursor-pointer"
											onClick={() => openSettings(repo)}
											title="Settings"
										>
											<FiSettings />
										</button>

										{/* Unshare */}
										<button
											className="cursor-pointer"
											onClick={() =>
												handleUnshareRepo(repo.id)
											}
											title="Unshare Repository"
										>
											<FiTrash />
										</button>

										{/* Pin / Favorite */}
										<button
											onClick={() => togglePin(repo.id)}
											className={`transition transform hover:scale-110 cursor-pointer ${
												repo.pinned
													? "text-[#ed8c45] scale-110"
													: "text-white/40"
											}`}
											title="Pin / Favorite"
										>
											<FiStar
												fill={
													repo.pinned
														? "currentColor"
														: "none"
												}
											/>
										</button>
									</div>
									<p className="text-xs">
										{repo.clicks} clicks
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Settings Modal */}
			<RepoSettingsModal
				open={settingsOpen}
				onClose={closeSettings}
				repo={activeRepo}
				onSave={handleSaveSettings}
			/>

			<style jsx global>{`
				.no-scrollbar::-webkit-scrollbar {
					display: none;
				}
				.no-scrollbar {
					-ms-overflow-style: none;
					scrollbar-width: none;
				}
			`}</style>
		</div>
	);
}

/* Square stat card */
function StatCard({ title, value, icon }) {
	return (
		<div className="aspect-square p-4 rounded-xl bg-white/5 border border-white/10 text-center flex flex-col items-center justify-center gap-2">
			<div className="text-3xl bg-amber-600/10 p-3 rounded-xl text-[#ed8c45]">
				{icon}
			</div>
			<p className="text-sm text-gray-400">{title}</p>
			<p className="text-2xl font-bold">{value}</p>
		</div>
	);
}
