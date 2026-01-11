import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request, { params }: any) {
	const token = params.token;
	const { email } = await req.json();

	// Check if this email has unlocked this repo
	const { data, error } = await supabase
		.from("purchases")
		.select("*")
		.eq("share_token", token)
		.eq("email", email)
		.single();

	if (error || !data) {
		return NextResponse.json({ valid: false });
	}

	return NextResponse.json({ valid: true });
}
