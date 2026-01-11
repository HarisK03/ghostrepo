import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
	const { token, email } = await req.json();

	if (!token || !email) {
		return NextResponse.json({ valid: false });
	}

	const { data, error } = await supabase
		.from("repo_unlocks")
		.select("id")
		.eq("share_token", token)
		.eq("buyer_email", email.toLowerCase())
		.eq("paid", true)
		.maybeSingle();

	if (error || !data) {
		return NextResponse.json({ valid: false });
	}

	return NextResponse.json({ valid: true });
}
