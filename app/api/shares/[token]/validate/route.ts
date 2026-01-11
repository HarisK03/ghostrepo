import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
	const { token, password } = await req.json();

	// Fetch share info from DB
	const { data, error } = await supabase
		.from("shared_repos")
		.select("password_hash, expires_at, price") // <-- include price
		.eq("share_token", token)
		.single();

	if (error || !data) {
		return NextResponse.json(
			{ valid: false, message: "Invalid token" },
			{ status: 404 }
		);
	}

	// Check expiry
	if (data.expires_at && new Date(data.expires_at) < new Date()) {
		return NextResponse.json({
			valid: false,
			expired: true,
			message: "Link expired",
		});
	}

	// Check password
	if (data.password_hash) {
		if (!password) {
			return NextResponse.json({ valid: false, passwordRequired: true });
		}

		if (password !== data.password_hash) {
			return NextResponse.json({
				valid: false,
				passwordRequired: true,
				message: "Incorrect password",
			});
		}
	}

	// Check paywall
	if (data.price && data.price > 0) {
		return NextResponse.json({
			valid: false,
			paywall: true,
			price: data.price,
			message: "This repo is behind a paywall",
		});
	}

	return NextResponse.json({ valid: true });
}
