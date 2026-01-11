import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getInstallationOctokit } from "@/lib/github";

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const owner = searchParams.get("owner");
	const repo = searchParams.get("repo");

	if (!owner || !repo) {
		return NextResponse.json({ error: "Missing params" }, { status: 400 });
	}

	const { data: repoRow } = await supabase
		.from("repos")
		.select("*")
		.eq("owner", owner)
		.eq("repo", repo)
		.single();

	if (!repoRow) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	const octokit = getInstallationOctokit(repoRow.installation_id);

	// 1️⃣ Get default branch
	const { data: repoData } = await octokit.rest.repos.get({
		owner,
		repo,
	});

	const branch = repoData.default_branch;

	// 2️⃣ Get full tree
	const { data: tree } = await octokit.rest.git.getTree({
		owner,
		repo,
		tree_sha: branch,
		recursive: "true",
	});

	return NextResponse.json(tree.tree);
}
