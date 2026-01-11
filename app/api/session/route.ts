import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
	const cookieStore = await cookies();
	const githubUser = cookieStore.get("github_user");

	if (!githubUser?.value) {
		return NextResponse.json({ loggedIn: false });
	}

	const user = JSON.parse(githubUser.value);
	return NextResponse.json({ loggedIn: true, user });
}
