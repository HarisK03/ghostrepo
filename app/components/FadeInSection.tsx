"use client";

import { motion, useAnimation, MotionProps } from "framer-motion";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

interface FadeInSectionProps extends MotionProps {
	children: React.ReactNode;
	direction?: "up" | "left" | "right";
	delay?: number;
}

export default function FadeInSection({
	children,
	direction = "up",
	delay = 0,
	...props
}: FadeInSectionProps) {
	const controls = useAnimation();
	const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

	const variants = {
		hidden: {
			opacity: 0,
			x: direction === "left" ? -50 : direction === "right" ? 50 : 0,
			y: direction === "up" ? 50 : 0,
		},
		visible: {
			opacity: 1,
			x: 0,
			y: 0,
			transition: { duration: 0.8, delay },
		},
	};

	useEffect(() => {
		if (inView) controls.start("visible");
	}, [controls, inView]);

	return (
		<motion.div
			ref={ref}
			initial="hidden"
			animate={controls}
			variants={variants}
			{...props}
		>
			{children}
		</motion.div>
	);
}
