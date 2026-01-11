import Link from "next/link";

export default function InstallSuccess() {
	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center space-y-4">
				<h1 className="text-2xl font-semibold">
					GitHub App Installed 🎉
				</h1>
				<p className="text-gray-600">
					Your repositories are now available for sharing.
				</p>

				<Link
					href="/"
					className="inline-block bg-black text-white px-5 py-2 rounded-md"
				>
					Back to home
				</Link>
			</div>
		</div>
	);
}
