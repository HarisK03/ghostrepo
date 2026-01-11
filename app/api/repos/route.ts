import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Octokit } from "octokit";
import { createAppAuth } from "@octokit/auth-app";

export async function GET() {
	// 1️⃣ Get user OAuth token from cookies
	const cookieStore = await cookies();
	const raw = cookieStore.get("github_user")?.value;

	if (!raw) {
		return NextResponse.json(
			{ error: "Not authenticated with GitHub" },
			{ status: 401 }
		);
	}

	let token: string | undefined;
	try {
		const parsed = JSON.parse(decodeURIComponent(raw));
		token = parsed.token;
	} catch {
		return NextResponse.json(
			{ error: "Invalid GitHub session" },
			{ status: 401 }
		);
	}

	if (!token) {
		return NextResponse.json(
			{ error: "Missing GitHub token" },
			{ status: 401 }
		);
	}

	// 2️⃣ Fetch user repos via OAuth token
	const res = await fetch(
		"https://api.github.com/user/repos?visibility=private&affiliation=owner&per_page=100",
		{
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: "application/vnd.github+json",
				"User-Agent": "repo-viewer",
			},
		}
	);

	if (!res.ok) {
		const text = await res.text();
		console.error("GitHub API error:", res.status, text);
		return NextResponse.json(
			{ error: "Failed to fetch repos from GitHub" },
			{ status: res.status }
		);
	}

	const repos = await res.json();

	// 3️⃣ Create GitHub App Octokit instance
	const appOctokit = new Octokit({
		authStrategy: createAppAuth,
		auth: {
			appId: process.env.GITHUB_APP_ID!,
			privateKey: process.env.GITHUB_PRIVATE_KEY!,
		},
	});

	// 4️⃣ Fetch installation ID for each repo
	const normalized = await Promise.all(
		repos.map(async (r: any) => {
			let installation_id: number | null = null;

			try {
				const instRes = await appOctokit.rest.apps.getRepoInstallation({
					owner: r.owner.login,
					repo: r.name,
				});
				installation_id = instRes.data.id;
			} catch (err: any) {
				if (err.status === 404) {
					// App not installed on this repo
					installation_id = null;
				} else {
					console.error(
						`Failed to get installation for ${r.owner.login}/${r.name}:`,
						err
					);
				}
			}

			return {
				id: String(r.id),
				owner: r.owner.login,
				repo: r.name,
				description: r.description ?? "",
				installation_id,
			};
		})
	);

	return NextResponse.json(normalized);
}
