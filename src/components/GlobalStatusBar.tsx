import { useState } from "react";
import { CheckCircle, ArrowLeft, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { FileEntry } from "../types/file-types";

interface GlobalStatusBarProps {
	files: FileEntry[];
	deletedFiles?: Set<string>;
	modifiedFiles?: Map<string, string>;
	onSubmitClick: () => void;
}

export function GlobalStatusBar({
	files,
	deletedFiles,
	modifiedFiles,
	onSubmitClick,
}: GlobalStatusBarProps) {
	const navigate = useNavigate();
	const [showConfirmModal, setShowConfirmModal] = useState(false);

	const handleBack = () => {
		setShowConfirmModal(true);
	};

	const confirmBack = () => {
		setShowConfirmModal(false);
		navigate("/");
	};

	// Calculate total lines from all non-deleted files (with modifications)
	let totalLines = 0;

	files.forEach((file) => {
		if (file.isDirectory) return;
		if (deletedFiles?.has(file.path)) return;
		if (
			Array.from(deletedFiles || []).some((df) =>
				file.path.startsWith(df + "/")
			)
		)
			return;

		// Current content (modified or original)
		const currentContent = modifiedFiles?.get(file.path) || file.content;
		const currentLines = currentContent ? currentContent.split("\n").length : 0;
		totalLines += currentLines;
	});

	const MIN_LINES = 5000;
	const isAboveMinimum = totalLines >= MIN_LINES;
	const percentage = Math.min((totalLines / MIN_LINES) * 100, 100);

	return (
		<div className="h-12 bg-zinc-900 border-b border-zinc-800 px-2 sm:px-4 flex items-center justify-between text-xs flex-shrink-0">
			<div className="flex items-center gap-2 sm:gap-6 min-w-0 flex-1">
				{/* Back button */}
				<button
					onClick={handleBack}
					className="p-2 -ml-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors flex-shrink-0"
					title="Back to upload"
				>
					<ArrowLeft className="w-4 h-4" />
				</button>

				{/* Line count */}
				<div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
					<span className="text-zinc-500 hidden sm:inline">Lines</span>
					<div className="flex items-center gap-1 sm:gap-2">
						<span
							className={`font-mono font-medium text-xs sm:text-sm ${
								isAboveMinimum ? "text-emerald-400" : "text-amber-400"
							}`}
						>
							{totalLines.toLocaleString()}
						</span>
						<span className="text-zinc-600">/</span>
						<span className="text-zinc-500 font-mono text-xs sm:text-sm">
							{MIN_LINES.toLocaleString()}
						</span>
					</div>
				</div>

				{/* Progress bar - hidden on mobile */}
				<div className="hidden sm:block w-32 md:w-48">
					<div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
						<div
							className={`h-full transition-all duration-300 ${
								isAboveMinimum ? "bg-emerald-500" : "bg-amber-500"
							}`}
							style={{ width: `${percentage}%` }}
						/>
					</div>
				</div>

				{/* Status text - hidden on mobile */}
				<div className="hidden md:block">
					{isAboveMinimum ? (
						<span className="text-emerald-400">Ready</span>
					) : (
						<span className="text-zinc-500">
							{(MIN_LINES - totalLines).toLocaleString()} more needed
						</span>
					)}
				</div>
			</div>

			{/* Ready for Submission button */}
			<button
				onClick={onSubmitClick}
				disabled={!isAboveMinimum}
				className={`
          flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all flex-shrink-0
          ${
						isAboveMinimum
							? "bg-emerald-600 hover:bg-emerald-500 text-white"
							: "bg-zinc-800 text-zinc-500 cursor-not-allowed"
					}
        `}
			>
				<CheckCircle className="w-4 h-4" />
				<span className="hidden sm:inline">Ready for Evaluation</span>
				<span className="sm:hidden">Submit</span>
			</button>

			{/* Confirmation Modal */}
			{showConfirmModal && (
				<>
					<div
						className="fixed inset-0 bg-black/60 z-50"
						onClick={() => setShowConfirmModal(false)}
					/>
					<div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 border border-zinc-700 rounded-xl p-5 z-50 w-[90%] max-w-sm shadow-xl">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2 rounded-lg bg-amber-500/20">
								<AlertTriangle className="w-5 h-5 text-amber-400" />
							</div>
							<h3 className="text-lg font-semibold text-zinc-100">
								Leave editor?
							</h3>
						</div>
						<p className="text-sm text-zinc-400 mb-6">
							Are you sure you want to go back? All your changes will be lost.
						</p>
						<div className="flex gap-3">
							<button
								onClick={() => setShowConfirmModal(false)}
								className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors"
							>
								Cancel
							</button>
							<button
								onClick={confirmBack}
								className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors"
							>
								Leave
							</button>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
