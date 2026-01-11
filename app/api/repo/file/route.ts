import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getInstallationOctokit } from "@/lib/github";

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const owner = searchParams.get("owner");
	const repo = searchParams.get("repo");
	const path = searchParams.get("path");

	if (!owner || !repo || !path) {
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

	const { data } = await octokit.rest.repos.getContent({
		owner,
		repo,
		path,
	});

	if (!("content" in data)) {
		return NextResponse.json({ error: "Not a file" }, { status: 400 });
	}

	const content = Buffer.from(data.content, "base64").toString("utf-8");

	return NextResponse.json({ content });
}
