import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getInstallationOctokit } from "@/lib/github";

export async function GET(
	req: Request,
	context: { params: Promise<{ token: string }> }
) {
	// Await the params because it's a Promise
	const { token } = await context.params;

	if (!token) {
		return NextResponse.json({ error: "Missing token" }, { status: 400 });
	}

	const { data: share, error } = await supabase
		.from("shared_repos")
		.select("owner, repo, installation_id")
		.eq("share_token", token)
		.single();

	if (error || !share) {
		return NextResponse.json({ error: "Invalid token" }, { status: 404 });
	}

	const octokit = getInstallationOctokit(share.installation_id);

	const branchesRes = await octokit.rest.repos.listBranches({
		owner: share.owner,
		repo: share.repo,
	});

	return NextResponse.json({
		branches: branchesRes.data.map((b) => b.name),
	});
}
