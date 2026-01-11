import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

if (!process.env.STRIPE_SK) {
	throw new Error("Missing STRIPE_SK environment variable");
}

const stripe = new Stripe(process.env.STRIPE_SK, {
	apiVersion: "2025-12-15.clover",
});

export async function POST(req: Request) {
	try {
		const { token, amount, repoName, email } = await req.json();

		if (!amount || !repoName || !email) {
			throw new Error("Missing required fields");
		}

		// Store unpaid unlock row
		const { data, error } = await supabase.from("repo_unlocks").insert({
			repo_id: 18,
			unlock_token: token,
			buyer_email: email.toLowerCase(),
			paid: false,
		});

		console.log("Insert result:", data);
		if (error) {
			console.error("Insert error:", error);
		} else {
			console.log("Insert successful!");
		}

		const session = await stripe.checkout.sessions.create({
			mode: "payment",

			customer_email: email,
			customer_creation: "always",

			metadata: {
				share_token: token,
				email: email.toLowerCase(),
			},

			line_items: [
				{
					price_data: {
						currency: "usd",
						product_data: { name: `Access to ${repoName}` },
						unit_amount: Math.round(amount * 100),
					},
					quantity: 1,
				},
			],

			success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/stripe/success?token=${token}&session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/share/${token}?canceled=true`,
		});

		return NextResponse.json({ url: session.url });
	} catch (err: any) {
		console.error("Stripe checkout error:", err);
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
