import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getInstallationOctokit } from "@/lib/github";

export async function GET(req: Request) {
	// Extract token from the URL path manually
	const url = new URL(req.url);
	const segments = url.pathname.split("/");
	// ['', 'api', 'shares', 'TOKEN']
	const token = segments[segments.length - 1];

	const branch = url.searchParams.get("branch");

	if (!token) {
		return NextResponse.json({ error: "Missing token" }, { status: 400 });
	}

	const { data: share } = await supabase
		.from("shared_repos")
		.select("owner, repo, installation_id")
		.eq("share_token", token)
		.single();

	if (!share) {
		return NextResponse.json({ error: "Invalid token" }, { status: 404 });
	}

	const octokit = getInstallationOctokit(share.installation_id);

	// Resolve branch to commit SHA
	let commitSha: string;
	if (branch) {
		const refRes = await octokit.rest.git.getRef({
			owner: share.owner,
			repo: share.repo,
			ref: `heads/${branch}`,
		});
		commitSha = refRes.data.object.sha;
	} else {
		const repoRes = await octokit.rest.repos.get({
			owner: share.owner,
			repo: share.repo,
		});
		const defaultBranch = repoRes.data.default_branch;

		const refRes = await octokit.rest.git.getRef({
			owner: share.owner,
			repo: share.repo,
			ref: `heads/${defaultBranch}`,
		});
		commitSha = refRes.data.object.sha;
	}

	// Get the full tree recursively
	const treeRes = await octokit.rest.git.getTree({
		owner: share.owner,
		repo: share.repo,
		tree_sha: commitSha,
		recursive: "true",
	});

	return NextResponse.json({
		owner: share.owner,
		repo: share.repo,
		tree: treeRes.data.tree ?? [],
	});
}
