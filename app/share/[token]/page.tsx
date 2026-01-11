"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import FileTree from "@/app/components/FileTree";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { FiCopy, FiDownload, FiArchive } from "react-icons/fi";
import { FaCodeBranch } from "react-icons/fa";
import toast from "react-hot-toast";
import { loadStripe, Stripe } from "@stripe/stripe-js";

import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { csharp } from "@replit/codemirror-lang-csharp";
import { php } from "@codemirror/lang-php";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { markdown } from "@codemirror/lang-markdown";
import { json } from "@codemirror/lang-json";
import { yaml } from "@codemirror/legacy-modes/mode/yaml";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import { swift } from "@codemirror/legacy-modes/mode/swift";
import { rust } from "@codemirror/lang-rust";
import { go } from "@codemirror/legacy-modes/mode/go";
import { StreamLanguage } from "@codemirror/language";
import { EditorView } from "@codemirror/view";

type TreeItem = {
	path: string;
	type: "blob" | "tree";
	owner: string;
	repo: string;
	isBinary?: boolean;
};

type SharedRepoInfo = {
	password_hash?: string | null;
	expires_at?: string | null;
	price?: number;
	pinned?: boolean;
	share_token?: string;
	shareUrl?: string;
	status?: string;
};

// ---------- Stripe ----------
let stripePromise: Promise<Stripe | null> | null = null;

if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
	stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
} else {
	console.warn(
		"⚠️ Stripe publishable key is missing! Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env.local"
	);
}

export const getStripe = (): Promise<Stripe | null> | null => {
	if (!stripePromise) console.error("Stripe not initialized");
	return stripePromise;
};

export default function SharedRepo() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { token } = useParams<{ token: string }>();

	const [tree, setTree] = useState<TreeItem[]>([]);
	const [nestedTree, setNestedTree] = useState<any[]>([]);
	const [fileContent, setFileContent] = useState<string>("");
	const [isBinary, setIsBinary] = useState(false);
	const [selectedBranch, setSelectedBranch] = useState<string>("");
	const [branches, setBranches] = useState<string[]>([]);
	const [selectedFileName, setSelectedFileName] = useState<string>("");
	const [repoName, setRepoName] = useState<string>("");
	const [sharedInfo, setSharedInfo] = useState<SharedRepoInfo>({});
	const [unlocked, setUnlocked] = useState(false);
	const [passwordPromptVisible, setPasswordPromptVisible] = useState(false);
	const [password, setPassword] = useState("");
	const [buyerEmail, setBuyerEmail] = useState("");

	const fileViewerRef = useRef<HTMLDivElement>(null);
	const codeMirrorRef = useRef<EditorView | null>(null);

	const emailFromQuery = searchParams?.get("email") || "";
	const largeFontTheme = EditorView.theme({ "&": { fontSize: "16px" } });
	const sharedBy = repoName.split("/")[0] || "Unknown";

	// ---------- Helpers ----------
	function isTextFile(fileName: string) {
		const ext = fileName.split(".").pop()?.toLowerCase();
		const nonText = [
			"png",
			"jpg",
			"jpeg",
			"gif",
			"bmp",
			"ico",
			"mp3",
			"wav",
			"ogg",
			"mp4",
			"mov",
			"avi",
			"mkv",
			"pdf",
			"exe",
			"zip",
			"tar",
			"gz",
			"7z",
		];
		return !nonText.includes(ext ?? "");
	}

	function getLanguageMode(fileName: string) {
		if (!fileName) return null;
		const ext = fileName.split(".").pop()?.toLowerCase();
		switch (ext) {
			case "js":
				return javascript();
			case "ts":
				return javascript({ typescript: true });
			case "jsx":
				return javascript({ jsx: true });
			case "tsx":
				return javascript({ jsx: true, typescript: true });
			case "py":
				return python();
			case "java":
				return java();
			case "cpp":
			case "cc":
			case "cxx":
			case "c":
				return cpp();
			case "cs":
				return csharp();
			case "php":
				return php();
			case "html":
			case "htm":
				return html();
			case "css":
				return css();
			case "md":
				return markdown();
			case "json":
				return json();
			case "yaml":
			case "yml":
				return StreamLanguage.define(yaml);
			case "sh":
			case "bash":
				return StreamLanguage.define(shell);
			case "swift":
				return StreamLanguage.define(swift);
			case "rs":
				return rust();
			case "go":
				return StreamLanguage.define(go);
			default:
				return null;
		}
	}

	function buildTree(tree: TreeItem[]) {
		const root: any[] = [];
		for (const item of tree) {
			const parts = item.path.split("/");
			let currentLevel = root;
			for (let i = 0; i < parts.length; i++) {
				const part = parts[i];
				let node = currentLevel.find((n) => n.name === part);
				if (!node) {
					node = {
						name: part,
						type: i === parts.length - 1 ? item.type : "tree",
						path: i === parts.length - 1 ? item.path : undefined,
						children:
							i === parts.length - 1 && item.type === "blob"
								? undefined
								: [],
					};
					currentLevel.push(node);
				}
				if (node.children) currentLevel = node.children;
			}
		}
		function sortNodes(nodes: any[]) {
			nodes.sort((a, b) =>
				a.type === b.type
					? a.name.localeCompare(b.name)
					: a.type === "tree"
					? -1
					: 1
			);
			nodes.forEach((n) => n.children && sortNodes(n.children));
		}
		sortNodes(root);
		return root;
	}

	async function openFile(path: string) {
		if (!unlocked) return;
		const item = tree.find((t) => t.path === path);
		if (!item) return;
		setSelectedFileName(item.path);

		if (!isTextFile(item.path)) {
			setFileContent("");
			setIsBinary(true);
		} else {
			try {
				const res = await fetch(
					`/api/shares/file?owner=${item.owner}&repo=${
						item.repo
					}&path=${encodeURIComponent(
						item.path
					)}&branch=${encodeURIComponent(
						selectedBranch
					)}&token=${token}`
				);
				if (!res.ok) {
					setFileContent("");
					setIsBinary(true);
				} else {
					const data = await res.json();
					setFileContent(data?.content || "");
					setIsBinary(!data?.content);
				}
			} catch {
				setFileContent("");
				setIsBinary(true);
			}
		}
		window.scrollTo({ top: 0, behavior: "smooth" });
	}

	// ---------- Email unlock ----------
	useEffect(() => {
		if (!token || !emailFromQuery) return;
		setBuyerEmail(emailFromQuery);
		setUnlocked(true); // bypass paywall if email present
		toast.success("Repo unlocked via email ✅");
	}, [token, emailFromQuery]);

	// ---------- Password / Paywall ----------
	useEffect(() => {
		if (!token) return;

		async function validateShare() {
			try {
				const res = await fetch(`/api/shares/[token]/validate`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ token }),
				});
				const data = await res.json();

				if (data.passwordRequired) {
					setPasswordPromptVisible(true);
				} else if (data.paywall) {
					setSharedInfo({ ...sharedInfo, price: data.price });
				} else if (data.valid) {
					setUnlocked(true);
					setPasswordPromptVisible(false);
				} else if (data.expired) {
					toast.error("Link expired");
				}
			} catch (err) {
				console.error(err);
				toast.error("Failed to validate share");
			}
		}

		validateShare();
	}, [token]);

	const handlePasswordSubmit = async () => {
		if (!password) return;
		try {
			const res = await fetch(`/api/shares/[token]/validate`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token, password }),
			});
			const data = await res.json();
			if (data.valid) {
				setUnlocked(true);
				setPasswordPromptVisible(false);
				toast.success("Repo unlocked!");
			} else {
				toast.error(data.message || "Incorrect password");
			}
		} catch {
			toast.error("Failed to validate password");
		}
	};

	const handlePurchase = async () => {
		if (!sharedInfo.price || !repoName || !token || !buyerEmail) {
			return toast.error("Missing information");
		}

		const res = await fetch("/api/stripe/checkout", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				token,
				amount: sharedInfo.price,
				repoName,
				email: buyerEmail,
			}),
		});

		const data = await res.json();
		if (!data.url) return toast.error("Failed to start payment");
		window.location.href = data.url;
	};

	// ---------- Fetch branches & tree ----------
	useEffect(() => {
		if (!token) return;
		fetch(`/api/shares/${token}/branches`)
			.then((res) => res.json())
			.then((data) => {
				setBranches(data.branches ?? []);
				if (data.branches?.length) setSelectedBranch(data.branches[0]);
			});
	}, [token]);

	useEffect(() => {
		if (!token || !selectedBranch) return;

		fetch(
			`/api/shares/${token}?branch=${encodeURIComponent(selectedBranch)}`
		)
			.then(async (res) => {
				const text = await res.text();
				try {
					return JSON.parse(text);
				} catch {
					return { tree: [], owner: "", repo: "", shared: {} };
				}
			})
			.then((data) => {
				const treeWithOwner = (data.tree ?? [])
					.filter((t: any) => t.type === "tree" || !t.isBinary)
					.map((t: any) => ({
						...t,
						owner: data.owner,
						repo: data.repo,
					}));

				setTree(unlocked ? treeWithOwner : []);
				setNestedTree(unlocked ? buildTree(treeWithOwner) : []);
				setFileContent("");
				setIsBinary(false);
				if (data.owner && data.repo)
					setRepoName(`${data.owner}/${data.repo}`);
				if (data.shared) setSharedInfo(data.shared);
			});
	}, [token, selectedBranch, unlocked]);

	// ---------- Render ----------
	if (!unlocked && passwordPromptVisible) {
		return (
			<div className="min-h-screen flex flex-col justify-center items-center bg-[#0f1829] text-white">
				<h1 className="text-2xl mb-4">
					This repo is password protected 🔒
				</h1>
				<input
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="Enter password"
					className="p-2 rounded-md text-black"
				/>
				<button
					onClick={handlePasswordSubmit}
					className="ml-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700"
				>
					Unlock
				</button>
			</div>
		);
	}

	if (!unlocked && sharedInfo.price && sharedInfo.price > 0) {
		return (
			<div className="min-h-screen flex flex-col justify-center items-center bg-[#0f1829] text-white">
				<h1 className="text-2xl mb-4">
					This repo is behind a paywall 🔑
				</h1>
				<p className="mb-4">Price: ${sharedInfo.price.toFixed(2)}</p>
				<input
					type="email"
					placeholder="Email used for purchase"
					value={buyerEmail}
					onChange={(e) => setBuyerEmail(e.target.value)}
					className="mb-4 px-4 py-2 rounded text-black w-64"
				/>
				<button
					onClick={handlePurchase}
					disabled={!buyerEmail}
					className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-600 disabled:opacity-50"
				>
					Buy Now
				</button>
			</div>
		);
	}

	// ---------- Main repo viewer ----------
	return (
		<div className="min-h-screen w-full text-white bg-[#0f1829]">
			<div className="mx-auto p-6 lg:p-12">
				{/* Repo Info */}
				<div className="mb-8">
					<h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-2">
						{repoName || "Repo"}
					</h1>
					<h2 className="text-lg lg:text-xl text-gray-300">
						Shared by{" "}
						<span className="text-white font-semibold">
							{sharedBy}
						</span>
					</h2>
					{sharedInfo.password_hash && (
						<p className="text-sm text-red-400 mt-1">
							🔒 Password protected
						</p>
					)}
					{sharedInfo.expires_at && (
						<p className="text-sm text-yellow-400 mt-1">
							⏳ Expires:{" "}
							{new Date(sharedInfo.expires_at).toLocaleString()}
						</p>
					)}
				</div>

				{/* Branch Selector */}
				<div className="mb-6 w-48 relative">
					<div className="absolute inset-y-0 left-4 flex items-center text-gray-400 pointer-events-none">
						<FaCodeBranch size={16} />
					</div>
					<select
						value={selectedBranch}
						onChange={(e) => setSelectedBranch(e.target.value)}
						className="w-full pl-10 pr-10 py-2 rounded-xl bg-white/5 border border-white/10 text-white cursor-pointer outline-none appearance-none hover:bg-white/10 transition duration-300"
					>
						{branches.map((b) => (
							<option
								key={b}
								value={b}
								className="bg-[#0f1829] text-white"
							>
								{b}
							</option>
						))}
					</select>
				</div>

				{/* Grid */}
				<div className="grid grid-cols-[350px_1fr] gap-6">
					<div className="p-4 bg-white/5 border border-white/10">
						<FileTree nodes={nestedTree} onFileClick={openFile} />
					</div>
					<div
						ref={fileViewerRef}
						className="bg-white/5 border border-white/10 h-full flex flex-col relative"
					>
						{fileContent && !isBinary && (
							<div className="absolute top-2 right-2 flex gap-2 z-20">
								<button
									onClick={() => {
										navigator.clipboard.writeText(
											fileContent
										);
										toast.success("Code copied!");
									}}
									title="Copy Code"
									className="p-2 rounded-md bg-white/10 hover:bg-white/20 transition cursor-pointer"
								>
									<FiCopy size={18} />
								</button>
								<button
									onClick={() => {
										const a = document.createElement("a");
										a.href = URL.createObjectURL(
											new Blob([fileContent], {
												type: "text/plain",
											})
										);
										a.download = selectedFileName;
										a.click();
									}}
									title="Download File"
									className="p-2 rounded-md bg-white/10 hover:bg-white/20 transition cursor-pointer"
								>
									<FiDownload size={18} />
								</button>
								<button
									onClick={async () => {
										const res = await fetch(
											`/api/shares/${token}/zip?branch=${encodeURIComponent(
												selectedBranch
											)}`
										);
										const blob = await res.blob();
										const a = document.createElement("a");
										a.href = URL.createObjectURL(blob);
										a.download = `${selectedBranch}.zip`;
										a.click();
									}}
									title="Download Repo ZIP"
									className="p-2 rounded-md bg-white/10 hover:bg-white/20 transition cursor-pointer"
									disabled={!selectedBranch}
								>
									<FiArchive size={18} />
								</button>
							</div>
						)}
						{!isBinary && fileContent && (
							<CodeMirror
								value={fileContent}
								height="100%"
								theme={oneDark}
								editable={false}
								extensions={[
									selectedFileName
										? getLanguageMode(selectedFileName)
										: null,
									largeFontTheme,
								].filter(Boolean)}
								basicSetup={{ lineNumbers: true }}
								onCreateEditor={(view) => {
									codeMirrorRef.current = view;
								}}
							/>
						)}
						{isBinary && (
							<div className="text-gray-300 italic p-4">
								This file is binary or non-text and cannot be
								rendered.
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
