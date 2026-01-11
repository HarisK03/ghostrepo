import { Octokit } from "octokit";
import { createAppAuth } from "@octokit/auth-app";

/**
 * Returns an Octokit instance using a GitHub App installation ID
 */
export function getInstallationOctokit(installationId: number) {
	return new Octokit({
		authStrategy: createAppAuth,
		auth: {
			appId: process.env.GITHUB_APP_ID!,
			privateKey: process.env.GITHUB_PRIVATE_KEY!,
			installationId,
		},
	});
}

/**
 * Returns an Octokit instance using a user OAuth token
 */
export function getOctokitFromToken(token: string) {
	if (!token) throw new Error("Missing OAuth token");
	return new Octokit({
		auth: token,
	});
}
