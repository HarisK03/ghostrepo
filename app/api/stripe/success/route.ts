import Stripe from "stripe";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SK!, {
	apiVersion: "2025-12-15.clover",
});

export async function GET(req: Request) {
	try {
		const url = new URL(req.url);
		const session_id = url.searchParams.get("session_id");
		const token = url.searchParams.get("token");

		if (!session_id || !token) {
			return NextResponse.json(
				{ error: "Missing session or token" },
				{ status: 400 }
			);
		}

		// Retrieve Stripe session
		const session = await stripe.checkout.sessions.retrieve(session_id);

		const email = session.metadata?.email;

		if (session.payment_status === "paid") {
			const { data, error } = await supabase
				.from("repo_unlocks")
				.update({ paid: true })
				.eq("unlock_token", token);

			if (error) {
				console.error("Failed to mark repo as paid:", error);
			} else {
				console.log("Repo marked as paid:", data);
			}
		}

		// Redirect to share page with token and email for validation
		return NextResponse.redirect(
			`${
				process.env.NEXT_PUBLIC_BASE_URL
			}/share/${token}?email=${encodeURIComponent(email || "")}`
		);
	} catch (err: any) {
		console.error("Error checking Stripe session:", err);
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
