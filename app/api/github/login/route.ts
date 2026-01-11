import { NextResponse } from "next/server";

export async function GET() {
	const clientId = process.env.GITHUB_CLIENT_ID!;
	const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/github/callback`;

	const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
		redirectUri
	)}&scope=${encodeURIComponent("read:user user:email repo")}`;

	return NextResponse.redirect(githubUrl);
}
