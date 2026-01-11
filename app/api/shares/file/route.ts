import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getInstallationOctokit } from "@/lib/github";

// app/api/shares/file/route.ts
export async function GET(req: Request) {
	const url = new URL(req.url);

	const token = url.searchParams.get("token"); // read token from query
	const path = url.searchParams.get("path") || ""; // default to root
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

	try {
		const res = await octokit.rest.repos.getContent({
			owner: share.owner,
			repo: share.repo,
			path,
			ref: branch ?? undefined,
		});

		// Folder
		if (Array.isArray(res.data)) {
			return NextResponse.json({
				type: "directory",
				files: res.data.map((f) => ({
					name: f.name,
					path: f.path,
					type: f.type,
				})),
			});
		}

		// File
		if ("content" in res.data) {
			const isBinary = res.data.encoding !== "base64";
			const content = isBinary
				? null
				: Buffer.from(res.data.content, "base64").toString("utf-8");

			return NextResponse.json({
				type: "file",
				name: res.data.name,
				path: res.data.path,
				isBinary,
				content,
			});
		}

		return NextResponse.json(
			{ error: "Unknown response" },
			{ status: 400 }
		);
	} catch (err: any) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
