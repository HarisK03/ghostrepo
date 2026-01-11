"use client";

import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	CartesianGrid,
} from "recharts";

const data = [
	{ day: "Mon", clicks: 120, downloads: 30, earned: 14 },
	{ day: "Tue", clicks: 210, downloads: 52, earned: 25 },
	{ day: "Wed", clicks: 90, downloads: 21, earned: 9 },
	{ day: "Thu", clicks: 300, downloads: 80, earned: 42 },
];

export default function RepoAnalytics() {
	return (
		<div className="min-h-screen bg-[#0f1829] text-white px-8 py-16">
			<h1 className="text-3xl font-bold mb-8">Repo Analytics</h1>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
				<Stat label="Total Clicks" value="720" />
				<Stat label="Downloads" value="183" />
				<Stat label="Earned" value="$92.40" />
			</div>

			<div className="bg-white/5 border border-white/10 rounded-2xl p-6">
				<h2 className="font-bold mb-4">Engagement Over Time</h2>

				<ResponsiveContainer width="100%" height={300}>
					<LineChart data={data}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="day" />
						<YAxis />
						<Tooltip />
						<Line
							type="monotone"
							dataKey="clicks"
							stroke="#ed8c45"
						/>
						<Line
							type="monotone"
							dataKey="downloads"
							stroke="#60a2b5"
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}

function Stat({ label, value }) {
	return (
		<div className="aspect-square bg-white/5 border border-white/10 rounded-xl flex flex-col items-center justify-center">
			<p className="text-sm text-gray-400">{label}</p>
			<p className="text-3xl font-bold">{value}</p>
		</div>
	);
}
