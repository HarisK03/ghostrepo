import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
	const { owner, repo, installation_id } = await req.json();

	console.log("owner, repo, installation_id:", owner, repo, installation_id);

	if (!owner || !repo || !installation_id) {
		return NextResponse.json({ error: "Missing fields" }, { status: 400 });
	}

	const token = randomBytes(4).toString("hex");

	await supabase.from("shares").insert({
		token,
		owner,
		repo,
		installation_id,
	});

	return NextResponse.json({ token });
}
