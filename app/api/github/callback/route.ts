import { NextResponse } from "next/server";
import { Octokit } from "octokit";
import fetch from "node-fetch";
import { supabase } from "@/lib/supabase";

interface OAuthTokenResponse {
	access_token?: string;
	scope?: string;
	token_type?: string;
	error?: string;
}

export async function GET(req: Request) {
	try {
		const url = new URL(req.url);
		const code = url.searchParams.get("code");
		if (!code) throw new Error("Missing code");

		const clientId = process.env.GITHUB_CLIENT_ID!;
		const clientSecret = process.env.GITHUB_CLIENT_SECRET!;

		const tokenRes = await fetch(
			"https://github.com/login/oauth/access_token",
			{
				method: "POST",
				headers: { Accept: "application/json" },
				body: new URLSearchParams({
					client_id: clientId,
					client_secret: clientSecret,
					code,
				}),
			}
		);

		const tokenData = (await tokenRes.json()) as OAuthTokenResponse;
		const oauthToken = tokenData.access_token;
		if (!oauthToken) throw new Error("Failed to get access token");

		const octokit = new Octokit({ auth: oauthToken });
		const { data: user } = await octokit.rest.users.getAuthenticated();

		// Fetch all repos user has access to
		const { data: repos } =
			await octokit.rest.repos.listForAuthenticatedUser({
				visibility: "all",
			});

		for (const repo of repos) {
			await supabase.from("repos").upsert({
				owner: repo.owner.login,
				repo: repo.name,
				installation_id: null,
			});
		}

		// ✅ Set cookie via NextResponse
		const baseUrl = `${url.protocol}//${url.host}`;
		const response = NextResponse.redirect(`${baseUrl}/dashboard`);
		response.cookies.set({
			name: "github_user",
			value: JSON.stringify({
				login: user.login,
				id: user.id,
				token: oauthToken,
			}),
			httpOnly: true,
			path: "/",
			maxAge: 60 * 60 * 24 * 7, // 7 days
		});

		return response;
	} catch (err) {
		console.error("OAuth callback error:", err);
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : err },
			{ status: 500 }
		);
	}
}
