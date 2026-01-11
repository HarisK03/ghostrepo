// "use client";

// import { useEffect, useState } from "react";

// type User = {
// 	login: string;
// 	id: number;
// 	token: string;
// };

// export default function Dashboard() {
// 	const [loggedIn, setLoggedIn] = useState(false);
// 	const [user, setUser] = useState<User | null>(null);

// 	useEffect(() => {
// 		fetch("/api/session")
// 			.then((res) => res.json())
// 			.then((data) => {
// 				setLoggedIn(data.loggedIn);
// 				if (data.loggedIn) setUser(data.user);
// 			});
// 	}, []);

// 	if (!loggedIn) {
// 		return (
// 			<div className="p-8 text-center">
// 				<h1 className="text-2xl font-bold">Not logged in</h1>
// 				<a
// 					href="/api/github/login"
// 					className="mt-4 inline-block px-6 py-3 bg-gray-800 text-white rounded-md"
// 				>
// 					Login with GitHub
// 				</a>
// 			</div>
// 		);
// 	}

// 	return (
// 		<div className="p-8">
// 			<h1 className="text-2xl font-bold">Hello, {user?.login}</h1>
// 			<p>You're logged in via GitHub OAuth!</p>
// 		</div>
// 	);
// }
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
import toast from "react-hot-toast";
import RepoSettingsModal from "../components/RepoSettingsModal";
import { supabase } from "@/lib/supabase";
import { FaArrowLeft } from "react-icons/fa";

const AUTO_PIN_CLICK_THRESHOLD = 150;

export default function DemoDashboard() {
	const [query, setQuery] = useState("");
	const [sharedQuery, setSharedQuery] = useState("");
	const [repos, setRepos] = useState<any[]>([]);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [activeRepo, setActiveRepo] = useState<any>(null);

	/* Handlers */
	const openSettings = (repo: any) => {
		setActiveRepo(repo);
		setSettingsOpen(true);
	};

	const closeSettings = () => {
		setSettingsOpen(false);
		setActiveRepo(null);
	};

	const handleSaveSettings = async (updatedRepo: any) => {
		try {
			const { error } = await supabase.from("shared_repos").upsert(
				{
					github_repo_id: updatedRepo.id,
					owner: updatedRepo.owner,
					repo: updatedRepo.name,
					pinned: updatedRepo.pinned,
					share_token: updatedRepo.share_token,
					share_url: updatedRepo.shareUrl,
					status: updatedRepo.status,
					description: updatedRepo.description,
					password_hash: updatedRepo.password_hash ?? null,
					expires_at: updatedRepo.expires_at ?? null,
					price: updatedRepo.price ?? 0, // <-- ADD THIS
					installation_id: updatedRepo.installation_id,
				},
				{ onConflict: "github_repo_id" }
			);

			if (error) throw error;

			// Update local state
			setRepos((prev) =>
				prev.map((r) => (r.id === updatedRepo.id ? updatedRepo : r))
			);

			toast.success("Settings saved!");
		} catch (err: any) {
			console.error("Failed to save settings:", err);
			toast.error(
				"Failed to save settings: " + (err?.message ?? "Unknown error")
			);
		}
	};

	function generateToken(length: number = 8) {
		const chars =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		let token = "";
		for (let i = 0; i < length; i++) {
			token += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return token;
	}

	const handleShareRepo = async (repo: any) => {
		// Block sharing if the app is not installed
		if (!repo.installation_id) {
			toast.error(
				`Cannot share "${repo.name}" because the GhostRepo app is not installed.`
			);
			return;
		}

		// Use existing token if shared, otherwise generate new
		const token = repo.share_token ?? generateToken(12);

		const payload = {
			github_repo_id: repo.id,
			share_token: token,
			owner: repo.owner,
			repo: repo.name,
			description: repo.description,
			share_url: `http://localhost:3000/share/${token}`,
			shared: true,
			status: "live",
			pinned: repo.pinned,
			installation_id: repo.installation_id,
			password_hash: null,
			expires_at: null,
		};

		const { error } = await supabase
			.from("shared_repos")
			.upsert(payload, { onConflict: "github_repo_id" });

		if (error) {
			toast.error("Failed to share repo: " + error.message);
			return;
		}

		setRepos((prev) =>
			prev.map((r) =>
				r.id === repo.id
					? {
							...r,
							shared: true,
							status: "live",
							share_token: token,
							shareUrl: payload.share_url,
							password_hash: null,
							expires_at: null,
					  }
					: r
			)
		);

		navigator.clipboard.writeText(payload.share_url);
		toast.success("Repository shared!");
	};

	const handleUnshareRepo = async (repoId: number) => {
		const { error } = await supabase
			.from("shared_repos")
			.update({ shared: false, status: "expired" })
			.eq("github_repo_id", repoId);

		if (error) {
			toast.error("Failed to unshare: " + error.message);
			return;
		}

		setRepos((prev) =>
			prev.map((r) =>
				r.id === repoId
					? {
							...r,
							shared: false,
							status: "expired",
							share_token: null,
							shareUrl: null,
					  }
					: r
			)
		);

		toast.success("Repository unshared");
	};

	const togglePin = async (id: number) => {
		setRepos((prev) =>
			prev.map((repo) =>
				repo.id === id ? { ...repo, pinned: !repo.pinned } : repo
			)
		);

		const repo = repos.find((r) => r.id === id);
		if (!repo) return;

		await supabase.from("shared_repos").upsert(
			{
				github_repo_id: repo.id,
				pinned: !repo.pinned,
				owner: repo.owner,
				repo: repo.name,
				share_url: repo.shareUrl,
			},
			{ onConflict: "github_repo_id" }
		);
	};

	/* Load Repos + Hydrate Shared Info */
	useEffect(() => {
		const loadRepos = async () => {
			try {
				const [ghRes, sharedRes] = await Promise.all([
					fetch("/api/repos"),
					supabase.from("shared_repos").select("*"),
				]);

				if (!ghRes.ok) throw new Error("Failed to fetch GitHub repos");

				const ghData = await ghRes.json();

				const sharedMap = new Map<number, any>(
					(sharedRes.data || []).map((r) => [
						Number(r.github_repo_id),
						r,
					])
				);

				// Update hydrated repos to compute status based on expires_at
				const hydrated = ghData.map((r: any) => {
					const shared = sharedMap.get(Number(r.id));

					let status = shared?.status ?? "expired";
					if (shared?.expires_at) {
						const now = new Date();
						const expires = new Date(shared.expires_at);
						status = expires < now ? "expired" : "live";
					}

					return {
						id: Number(r.id),
						name: r.repo,
						owner: r.owner,
						githubUrl: `https://github.com/${r.owner}/${r.repo}`,
						description:
							r.description?.trim() || "No description provided",
						shareUrl: shared
							? `http://localhost:3000/share/${shared.share_token}`
							: null,
						share_token: shared?.share_token ?? null,
						shared: shared?.shared ?? false,
						status,
						clicks: shared?.clicks ?? 0,
						viewers: shared?.viewers ?? 0,
						pinned: shared?.pinned ?? false,
						installation_id: r.installation_id,
						expires_at: shared?.expires_at ?? null,
						price: shared?.price ?? 0, // <-- new
					};
				});

				setRepos(hydrated);
			} catch (err) {
				console.error(err);
				toast.error("Failed to load repositories");
			}
		};

		loadRepos();
	}, []);

	/* Filters */
	const sortedFilteredRepos = repos
		.slice()
		.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
		.filter((repo) =>
			repo.name.toLowerCase().includes(query.toLowerCase())
		);

	const sortedFilteredSharedRepos = repos
		.filter((r) => r.shared)
		.filter((r) => r.name.toLowerCase().includes(sharedQuery.toLowerCase()))
		.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

	const totalEarned = repos.reduce(
		(sum, repo) => sum + repo.clicks * 0.12,
		0
	);

	return (
		<div className="min-h-screen w-full text-white bg-[#0f1829]">
			<div className="fixed top-0 left-0 z-50 w-full backdrop-blur-md bg-black/30 border-b border-white/10">
				<div className="max-w-6xl mx-auto py-3 flex justify-between items-center">
					<span className="text-sm text-gray-300/50 font-extrabold uppercase">
						INSTALL THE GHOSTREPO APP TO YOUR REPOSITORIES
					</span>
					<Link
						href="https://github.com/apps/ghostrepoapp/installations/new"
						className="text-sm font-extrabold text-[#ed8c45] hover:text-white transition"
					>
						<FaArrowLeft className="inline mr-2 text-xs w-3 h-3 font-bold" />
						INSTALL APP
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
					{/* LEFT - Private Repo List */}
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
										<p className="text-sm text-gray-400 line-clamp-2">
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
												disabled={!repo.installation_id}
												className={`font-bold border-2 px-2 py-1 rounded-full text-xs cursor-pointer duration-300 ${
													repo.installation_id
														? "text-[#78c5d9] border-[#78c5d9] hover:bg-[#306074] hover:text-[#78c5d9] hover:border-[#306074]"
														: "text-gray-500 border-gray-500 cursor-not-allowed"
												}`}
												title={
													!repo.installation_id
														? "Install the GhostRepo app to share this repository"
														: "Share"
												}
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
							value="0"
							icon={<FiEye />}
						/>
						<StatCard
							title="Unique Viewers"
							value="0"
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
														: "bg-red-500"
												}`}
											/>
										</span>
										<p className="text-xs font-extrabold uppercase">
											{repo.status === "live"
												? "Live"
												: repo.expires_at
												? `Expired ${new Date(
														repo.expires_at
												  ).toLocaleDateString()}`
												: "Expired"}
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

										{/* Pin */}
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
function StatCard({ title, value, icon }: any) {
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
