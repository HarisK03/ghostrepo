"use client";

import { useState } from "react";
import { Folder, FolderOpen, File, ChevronRight } from "lucide-react";

type TreeNode = {
	name: string;
	type: "blob" | "tree";
	path?: string;
	children?: TreeNode[];
};

type Props = {
	nodes: TreeNode[];
	onFileClick: (path: string) => void;
	level?: number;
};

export default function FileTree({ nodes, onFileClick, level = 0 }: Props) {
	return (
		<ul className="relative">
			{nodes.map((node, index) => (
				<TreeNodeItem
					key={node.name + node.path}
					node={node}
					onFileClick={onFileClick}
					level={level}
					isLast={index === nodes.length - 1}
				/>
			))}
		</ul>
	);
}

function TreeNodeItem({
	node,
	onFileClick,
	level,
	isLast,
}: {
	node: TreeNode;
	onFileClick: (path: string) => void;
	level: number;
	isLast: boolean;
}) {
	const [open, setOpen] = useState(false);

	const indent = level * 1.5;

	if (node.type === "tree") {
		return (
			<li className="relative">
				<div
					className="flex items-center"
					style={{ paddingLeft: `${indent}rem` }}
				>
					{/* Vertical line */}
					{level > 0 && (
						<span
							className="absolute top-0 bottom-0 left-0 w-[1px] bg-gray-700"
							style={{ left: `${indent - 1.5}rem` }}
						/>
					)}
					{/* Arrow + folder icon + name */}
					<div
						className="flex items-center cursor-pointer select-none py-1.5 px-2 rounded-lg hover:bg-white/10 transition-colors duration-200 text-[15px] font-medium"
						onClick={() => setOpen(!open)}
					>
						<ChevronRight
							className={`w-4 h-4 mr-1 transition-transform duration-200 ${
								open ? "rotate-90" : ""
							}`}
						/>
						{open ? (
							<FolderOpen className="w-5 h-5 mr-1 text-gray-400" />
						) : (
							<Folder className="w-5 h-5 mr-1 text-gray-400" />
						)}
						{node.name}
					</div>
				</div>

				{open && node.children && node.children.length > 0 && (
					<FileTree
						nodes={node.children}
						onFileClick={onFileClick}
						level={level + 1}
					/>
				)}
			</li>
		);
	}

	// Blob (file) node
	return (
		<li className="relative">
			<div
				className="flex items-center"
				style={{ paddingLeft: `${indent}rem` }}
			>
				{level > 0 && (
					<span
						className="absolute top-0 bottom-0 left-0 w-[1px] bg-gray-700"
						style={{ left: `${indent - 1.5}rem` }}
					/>
				)}
				<div
					className="flex items-center cursor-pointer select-none py-1.5 px-2 rounded-lg hover:bg-white/10 transition-colors duration-200 text-[14px]"
					onClick={() => node.path && onFileClick(node.path)}
				>
					<File className="w-4 h-4 mr-1 text-gray-400" />
					{node.name}
				</div>
			</div>
		</li>
	);
}
