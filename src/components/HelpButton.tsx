import { useState } from "react";
import { Sparkles, FileCode, BarChart3, Package, Scissors } from "lucide-react";

interface HelpButtonProps {
	onClick?: () => void;
	className?: string;
}

/**
 * Sleek info button with hover popover showing what the tool generates
 */
export function HelpButton({ className = "" }: HelpButtonProps) {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<div
			className={`relative ${className}`}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* Trigger button */}
			<button className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-all rounded-lg hover:bg-zinc-800/60 border border-transparent hover:border-zinc-700/50">
				<Sparkles className="w-4 h-4" />
				<span className="font-medium">What you get</span>
			</button>

			{/* Popover */}
			<div
				className={`
          absolute top-full right-0 mt-2 w-72
          transition-all duration-200 ease-out origin-top-right
          ${
						isHovered
							? "opacity-100 scale-100 translate-y-0"
							: "opacity-0 scale-95 -translate-y-1 pointer-events-none"
					}
        `}
			>
				{/* Arrow */}
				<div className="absolute -top-1.5 right-6 w-3 h-3 bg-zinc-900 border-l border-t border-zinc-700/50 rotate-45" />

				{/* Content */}
				<div className="relative bg-zinc-900 border border-zinc-700/50 rounded-xl p-4 shadow-2xl shadow-black/50 backdrop-blur-sm">
					<div className="space-y-4">
						{/* Step 1 - Curate */}
						<div>
							<p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">
								First, you'll
							</p>
							<div className="flex items-start gap-3">
								<div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20">
									<Scissors className="w-4 h-4 text-amber-400" />
								</div>
								<div>
									<p className="text-sm font-medium text-zinc-200">
										Curate Your Sample
									</p>
									<p className="text-xs text-zinc-500">
										Select which lines from files to include in your sample (min
										5,000 lines)
									</p>
								</div>
							</div>
						</div>

						{/* Divider */}
						<div className="border-t border-zinc-800" />

						{/* Outputs */}
						<div>
							<p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">
								Then you'll get
							</p>
							<div className="space-y-2.5">
								{/* Language Breakdown */}
								<div className="flex items-center gap-3">
									<div className="p-1.5 rounded-md bg-blue-500/10 border border-blue-500/20">
										<BarChart3 className="w-3.5 h-3.5 text-blue-400" />
									</div>
									<p className="text-sm text-zinc-300">Language breakdown</p>
								</div>

								{/* JSONL Encoding */}
								<div className="flex items-center gap-3">
									<div className="p-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
										<FileCode className="w-3.5 h-3.5 text-emerald-400" />
									</div>
									<p className="text-sm text-zinc-300">
										JSONL-encoded source files
									</p>
								</div>

								{/* Ready ZIP */}
								<div className="flex items-center gap-3">
									<div className="p-1.5 rounded-md bg-violet-500/10 border border-violet-500/20">
										<Package className="w-3.5 h-3.5 text-violet-400" />
									</div>
									<p className="text-sm text-zinc-300">Ready-to-submit ZIP</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
