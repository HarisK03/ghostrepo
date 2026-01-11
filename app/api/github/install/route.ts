import { NextResponse } from "next/server";

export async function GET() {
	const appId = process.env.GITHUB_APP_ID;
	const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/github/app-callback`;
	const url = `https://github.com/apps/${process.env.GITHUB_APP_NAME}/installations/new`;

	return NextResponse.redirect(url);
}
