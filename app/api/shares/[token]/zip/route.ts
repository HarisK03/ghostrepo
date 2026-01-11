import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getInstallationOctokit } from "@/lib/github";

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ token: string }> }
) {
	const { token } = await params;
	const url = new URL(req.url);
	const branch = url.searchParams.get("branch") ?? "main";

	if (!token)
		return NextResponse.json({ error: "Missing token" }, { status: 400 });

	const { data: share } = await supabase
		.from("shared_repos")
		.select("owner, repo, installation_id")
		.eq("share_token", token)
		.single();

	if (!share)
		return NextResponse.json({ error: "Invalid token" }, { status: 404 });

	const octokit = getInstallationOctokit(share.installation_id);

	try {
		// GitHub archive URL
		const archiveRes = await octokit.request(
			"GET /repos/{owner}/{repo}/zipball/{ref}",
			{
				owner: share.owner,
				repo: share.repo,
				ref: branch,
				headers: {
					Accept: "application/vnd.github+json",
				},
			}
		);

		// octokit returns URL for zip download, fetch it
		const zipResponse = await fetch(archiveRes.url!);
		const zipBuffer = await zipResponse.arrayBuffer();

		return new Response(zipBuffer, {
			headers: {
				"Content-Type": "application/zip",
				"Content-Disposition": `attachment; filename="${share.repo}-${branch}.zip"`,
			},
		});
	} catch (err: any) {
		console.error(err);
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
