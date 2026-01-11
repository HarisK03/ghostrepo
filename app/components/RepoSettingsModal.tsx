"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import toast from "react-hot-toast";

interface Repo {
	id: number;
	name: string;
	description?: string;
	pinned?: boolean;
	share_token?: string;
	shareUrl?: string;
	status?: string;
	password_hash?: string | null;
	expires_at?: string | null;
	price?: number; // <-- new
	owner?: string;
	repo?: string;
	installation_id?: number;
}

interface RepoSettingsModalProps {
	open: boolean;
	onClose: () => void;
	repo: Repo | null;
	onSave: (updatedRepo: Repo) => void;
}

export default function RepoSettingsModal({
	open,
	onClose,
	repo,
	onSave,
}: RepoSettingsModalProps) {
	const [expiry, setExpiry] = useState("7D");
	const [passwordEnabled, setPasswordEnabled] = useState(false);
	const [password, setPassword] = useState("");
	const [pinned, setPinned] = useState(false);
	const [price, setPrice] = useState(0); // <-- new

	// Load current repo settings
	useEffect(() => {
		if (repo) {
			setExpiry("7D"); // default; optionally map from repo.expires_at
			setPasswordEnabled(!!repo.password_hash);
			setPassword(repo.password_hash || "");
			setPinned(!!repo.pinned);
			setPrice(repo.price ?? 0); // <-- load price
		}
	}, [repo]);

	// Map relative expiry string to ISO timestamp
	const mapExpiryToTimestamp = (expiry: string) => {
		if (!expiry) return null;
		const now = new Date();
		switch (expiry) {
			case "1D":
				now.setDate(now.getDate() + 1);
				break;
			case "7D":
				now.setDate(now.getDate() + 7);
				break;
			case "30D":
				now.setDate(now.getDate() + 30);
				break;
			case "1Y":
				now.setFullYear(now.getFullYear() + 1);
				break;
			default:
				return null;
		}
		return now.toISOString();
	};

	const handleSave = () => {
		if (passwordEnabled && password.trim() === "") {
			toast.error("Password cannot be empty!");
			return;
		}

		if (!repo) return;

		const updatedRepo: Repo = {
			...repo,
			pinned,
			password_hash: passwordEnabled ? password : null,
			expires_at: mapExpiryToTimestamp(expiry),
			price: price, // <-- save new price
		};

		onSave(updatedRepo);
		toast.success("Settings saved!");
		onClose();
	};

	if (!repo) return null;

	return (
		<Transition appear show={open} as={Fragment}>
			<Dialog as="div" className="relative z-50" onClose={onClose}>
				{/* Backdrop */}
				<Transition.Child
					as={Fragment}
					enter="transition-opacity duration-300 ease-out"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="transition-opacity duration-300 ease-in"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black/30 backdrop-blur-md" />
				</Transition.Child>

				{/* Modal panel */}
				<div className="fixed inset-0 flex items-center justify-center p-4">
					<Transition.Child
						as={Fragment}
						enter="transition-transform duration-300 ease-out opacity-0 scale-95"
						enterFrom="opacity-0 scale-95 translate-y-4"
						enterTo="opacity-100 scale-100 translate-y-0"
						leave="transition-transform duration-300 ease-in"
						leaveFrom="opacity-100 scale-100 translate-y-0"
						leaveTo="opacity-0 scale-95 translate-y-4"
					>
						<Dialog.Panel className="bg-[#0f1829] border border-white/10 rounded-2xl p-6 w-full max-w-md text-white transform transition-all">
							<Dialog.Title className="text-xl font-bold mb-4">
								Settings for {repo.name}
							</Dialog.Title>

							{/* Price */}
							<div className="mb-4">
								<label className="block text-sm text-gray-400 mb-1">
									Price (USD)
								</label>
								<input
									type="number"
									min={0}
									step={0.01}
									value={price}
									onChange={(e) =>
										setPrice(parseFloat(e.target.value))
									}
									className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
								/>
								<p className="text-xs text-gray-500 mt-1">
									Set 0 for free, any positive value for paid
									access
								</p>
							</div>

							{/* Pin */}
							<div className="flex items-center justify-between mb-4">
								<span>Pin Repository</span>
								<input
									type="checkbox"
									checked={pinned}
									onChange={() => setPinned(!pinned)}
								/>
							</div>

							{/* Expiry */}
							<label className="text-sm text-gray-400">
								Expiration
							</label>
							<select
								value={expiry}
								onChange={(e) => setExpiry(e.target.value)}
								className="w-full mt-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 mb-4"
							>
								<option>1D</option>
								<option>7D</option>
								<option>30D</option>
								<option>1Y</option>
							</select>

							{/* Password Protection */}
							<div className="mt-2 flex items-center justify-between">
								<span>Password Protection</span>
								<input
									type="checkbox"
									checked={passwordEnabled}
									onChange={() =>
										setPasswordEnabled(!passwordEnabled)
									}
								/>
							</div>

							{passwordEnabled && (
								<input
									type="password"
									placeholder="Set password"
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
									className="w-full mt-3 bg-white/5 border border-white/10 rounded-lg px-3 py-2"
								/>
							)}

							{/* Actions */}
							<div className="mt-6 flex justify-end gap-3">
								<button
									onClick={onClose}
									className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
								>
									Cancel
								</button>
								<button
									onClick={handleSave}
									className="px-4 py-2 rounded-lg bg-[#ed8c45] text-black font-bold hover:bg-[#f7a15b] transition"
								>
									Save
								</button>
							</div>
						</Dialog.Panel>
					</Transition.Child>
				</div>
			</Dialog>
		</Transition>
	);
}
