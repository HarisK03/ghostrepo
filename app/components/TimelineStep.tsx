import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface TimelineStepProps {
	side: "left" | "right";
	number: number;
	title: string;
	description: string;
}

export function TimelineStep({
	side,
	number,
	title,
	description,
}: TimelineStepProps) {
	const [open, setOpen] = useState(false);
	const isLeft = side === "left";

	return (
		<div
			className={`relative flex w-full ${
				isLeft ? "justify-start pr-12" : "justify-end pl-12"
			}`}
		>
			{/* Vertical line with smooth height animation */}
			<motion.div
				className="absolute left-1/2 w-px bg-white/20 pointer-events-none"
				style={{ transform: "translateX(-50%)" }}
				animate={{
					height: open ? 190 : 150, // adjust these values to match your spacing
				}}
				transition={{ duration: 0.3, ease: "easeOut" }}
			/>

			{/* Timeline Dot and Step Label */}
			<div
				className="absolute left-1/2 flex flex-col items-center"
				style={{ transform: "translateX(-50%)" }}
			>
				{/* STEP badge */}
				<div className="bg-[#4d443d]/15 backdrop-blur-md px-4 py-2 mb-4 rounded-full border items-center justify-center flex border-white/10 z-20">
					<span className="text-xs font-extrabold text-[#ed8c45]">
						STEP {number}
					</span>
				</div>

				{/* Dot with glow */}
				<div
					className="w-4 h-4 rounded-full bg-white
                shadow-[0_0_8px_rgba(255,255,255,0.5),0_0_16px_rgba(255,255,255,0.3)]"
				></div>
			</div>

			{/* Card */}
			<div
				onClick={() => setOpen(!open)}
				className={`
          group relative w-full max-w-md
          bg-transparent backdrop-blur-md
          border border-white/20
          rounded-2xl p-6
          cursor-pointer
          transition-all duration-300 ease-out
          hover:-translate-y-1 hover:scale-[1.01]
          hover:border-white/20
          ${isLeft ? "ml-[-64px]" : "mr-[-64px]"}
        `}
			>
				{/* Header */}
				<div className="flex items-center justify-between pr-12">
					<h3 className="text-xl font-bold text-white">{title}</h3>
				</div>

				{/* Collapsible content */}
				<AnimatePresence>
					{open && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.3, ease: "easeOut" }}
							className="overflow-hidden pr-12"
						>
							<p className="text-gray-300">{description}</p>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Plus icon with rotation */}
				<motion.div
					animate={{ rotate: open ? 45 : 0 }}
					transition={{ duration: 0.1, ease: "easeOut" }}
					className={`
            absolute right-4 top-1/2 -translate-y-1/2
            w-9 h-9 rounded-full
            flex items-center justify-center
            border
            transition-all duration-300 group-hover:bg-white/5
            border-white/20 text-white/80
          `}
				>
					<FaPlus className="text-sm text-white/50" />
				</motion.div>
			</div>
		</div>
	);
}
