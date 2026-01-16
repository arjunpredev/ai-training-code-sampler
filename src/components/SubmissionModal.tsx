import { useState, useMemo } from "react";
import {
	X,
	Download,
	FileCode,
	CheckCircle,
	AlertCircle,
	Folder,
} from "lucide-react";
import type { FileEntry } from "../types/file-types";
import { detectLanguage } from "../lib/language-utils";

interface SubmissionModalProps {
	isOpen: boolean;
	onClose: () => void;
	files: FileEntry[];
	deletedFiles: Set<string>;
	modifiedFiles: Map<string, string>;
	onDownload: () => void;
	isDownloading: boolean;
	downloadProgress: number;
}

export function SubmissionModal({
	isOpen,
	onClose,
	files,
	deletedFiles,
	modifiedFiles,
	onDownload,
	isDownloading,
	downloadProgress,
}: SubmissionModalProps) {
	const [activeTab, setActiveTab] = useState<"overview" | "files">("overview");

	// Calculate stats for included files only
	const includedStats = useMemo(() => {
		const includedFiles = files.filter((file) => {
			if (file.isDirectory) return false;
			if (deletedFiles.has(file.path)) return false;
			if (Array.from(deletedFiles).some((df) => file.path.startsWith(df + "/")))
				return false;
			return true;
		});

		// Calculate total lines with modifications
		let totalLines = 0;
		let totalChars = 0;
		const languageBreakdown: Record<
			string,
			{ files: number; lines: number; chars: number }
		> = {};

		for (const file of includedFiles) {
			const content = modifiedFiles.get(file.path) || file.content;
			const lines = content ? content.split("\n").length : 0;
			const chars = content ? content.length : 0;
			totalLines += lines;
			totalChars += chars;

			const language = detectLanguage(file.path);
			if (!languageBreakdown[language]) {
				languageBreakdown[language] = { files: 0, lines: 0, chars: 0 };
			}
			languageBreakdown[language].files++;
			languageBreakdown[language].lines += lines;
			languageBreakdown[language].chars += chars;
		}

		// Sort languages by line count
		const sortedLanguages = Object.entries(languageBreakdown)
			.sort((a, b) => b[1].lines - a[1].lines)
			.map(([language, stats]) => ({
				language,
				...stats,
				percentage: totalLines > 0 ? (stats.lines / totalLines) * 100 : 0,
			}));

		return {
			totalFiles: includedFiles.length,
			totalLines,
			totalChars,
			languages: sortedLanguages,
			includedFiles,
		};
	}, [files, deletedFiles, modifiedFiles]);

	const MIN_LINES = 5000;
	const isReady = includedStats.totalLines >= MIN_LINES;

	// Format file size dynamically (KB or MB)
	const formatSize = (bytes: number): string => {
		const kb = bytes / 1024;
		if (kb >= 1024) {
			return `${(kb / 1024).toFixed(1)}MB`;
		}
		return `${kb.toFixed(1)}KB`;
	};
	const progressPercentage = Math.min(
		(includedStats.totalLines / MIN_LINES) * 100,
		100
	);

	if (!isOpen) return null;

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-2xl bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 flex flex-col max-h-[85vh]">
				{/* Header */}
				<div className="flex items-center justify-between p-5 border-b border-zinc-800">
					<div className="flex items-center gap-3">
						<div
							className={`p-2 rounded-lg ${
								isReady ? "bg-emerald-500/20" : "bg-amber-500/20"
							}`}
						>
							{isReady ? (
								<CheckCircle className="w-5 h-5 text-emerald-400" />
							) : (
								<AlertCircle className="w-5 h-5 text-amber-400" />
							)}
						</div>
						<div>
							<h2 className="text-lg font-semibold text-zinc-100">
								{isReady ? "Ready for Evaluation" : "Almost Ready"}
							</h2>
							<p className="text-xs text-zinc-500">
								{isReady
									? "Your code sample meets the requirements"
									: `You need ${(
											MIN_LINES - includedStats.totalLines
									  ).toLocaleString()} more lines`}
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
					>
						<X className="w-5 h-5 text-zinc-400" />
					</button>
				</div>

				{/* Progress Bar */}
				<div className="px-5 py-4 border-b border-zinc-800 bg-zinc-900/50">
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm text-zinc-400">Lines of code</span>
						<span
							className={`text-sm font-mono font-medium ${
								isReady ? "text-emerald-400" : "text-amber-400"
							}`}
						>
							{includedStats.totalLines.toLocaleString()} /{" "}
							{MIN_LINES.toLocaleString()}
						</span>
					</div>
					<div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
						<div
							className={`h-full transition-all duration-500 ${
								isReady ? "bg-emerald-500" : "bg-amber-500"
							}`}
							style={{ width: `${progressPercentage}%` }}
						/>
					</div>
				</div>

				{/* Tabs */}
				<div className="flex border-b border-zinc-800">
					<button
						onClick={() => setActiveTab("overview")}
						className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
							activeTab === "overview"
								? "text-zinc-100 border-b-2 border-blue-500"
								: "text-zinc-500 hover:text-zinc-300"
						}`}
					>
						Overview
					</button>
					<button
						onClick={() => setActiveTab("files")}
						className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
							activeTab === "files"
								? "text-zinc-100 border-b-2 border-blue-500"
								: "text-zinc-500 hover:text-zinc-300"
						}`}
					>
						Files ({includedStats.totalFiles})
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-3 sm:p-5">
					{activeTab === "overview" ? (
						<div className="space-y-4 sm:space-y-6">
							{/* Summary Stats */}
							<div className="grid grid-cols-3 gap-2 sm:gap-4">
								<div className="bg-zinc-800/50 rounded-lg p-2.5 sm:p-4 text-center">
									<p className="text-lg sm:text-2xl font-semibold text-zinc-100">
										{includedStats.totalFiles}
									</p>
									<p className="text-xs text-zinc-500">Files</p>
								</div>
								<div className="bg-zinc-800/50 rounded-lg p-2.5 sm:p-4 text-center">
									<p className="text-lg sm:text-2xl font-semibold text-zinc-100">
										{includedStats.totalLines.toLocaleString()}
									</p>
									<p className="text-xs text-zinc-500">Lines</p>
								</div>
								<div className="bg-zinc-800/50 rounded-lg p-2.5 sm:p-4 text-center">
									<p className="text-lg sm:text-2xl font-semibold text-zinc-100">
										{formatSize(includedStats.totalChars)}
									</p>
									<p className="text-xs text-zinc-500">Size</p>
								</div>
							</div>

							{/* Language Breakdown */}
							<div>
								<h3 className="text-sm font-medium text-zinc-300 mb-2 sm:mb-3">
									Language Breakdown
								</h3>
								<div className="space-y-2">
									{includedStats.languages.slice(0, 8).map((lang) => (
										<div
											key={lang.language}
											className="flex items-center gap-2 sm:gap-3"
										>
											<div className="w-16 sm:w-24 text-xs sm:text-sm text-zinc-400 truncate">
												{lang.language}
											</div>
											<div className="flex-1 h-1.5 sm:h-2 bg-zinc-800 rounded-full overflow-hidden">
												<div
													className="h-full bg-blue-500"
													style={{ width: `${lang.percentage}%` }}
												/>
											</div>
											<div className="w-14 sm:w-20 text-xs text-zinc-500 text-right">
												{lang.lines.toLocaleString()}
											</div>
										</div>
									))}
									{includedStats.languages.length > 8 && (
										<p className="text-xs text-zinc-600">
											+{includedStats.languages.length - 8} more languages
										</p>
									)}
								</div>
							</div>

							{/* What's Included */}
							<div className="bg-zinc-800/30 rounded-lg p-4">
								<h3 className="text-sm font-medium text-zinc-300 mb-2">
									Your download will include:
								</h3>
								<ul className="text-xs text-zinc-500 space-y-1">
									<li className="flex items-center gap-2">
										<FileCode className="w-3.5 h-3.5 text-emerald-400" />
										JSONL-encoded source files
									</li>
									<li className="flex items-center gap-2">
										<Folder className="w-3.5 h-3.5 text-amber-400" />
										Language statistics report
									</li>
									<li className="flex items-center gap-2">
										<Download className="w-3.5 h-3.5 text-blue-400" />
										Ready-to-submit ZIP package
									</li>
								</ul>
							</div>
						</div>
					) : (
						<div className="space-y-1">
							{includedStats.includedFiles.map((file) => (
								<div
									key={file.path}
									className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800/50 text-sm"
								>
									<FileCode className="w-4 h-4 text-zinc-500 flex-shrink-0" />
									<span className="text-zinc-300 truncate">{file.path}</span>
									<span className="text-xs text-zinc-600 flex-shrink-0">
										{file.lineCount || file.content?.split("\n").length || 0}{" "}
										lines
									</span>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="border-t border-zinc-800 p-5 bg-zinc-900/50">
					<button
						onClick={onDownload}
						disabled={isDownloading}
						className={`
              w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium
              transition-all
              ${
								isDownloading
									? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
									: "bg-blue-600 hover:bg-blue-500 text-white"
							}
            `}
					>
						{isDownloading ? (
							<>
								<div className="w-5 h-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
								<span>Preparing... {downloadProgress}%</span>
							</>
						) : (
							<>
								<Download className="w-5 h-5" />
								<span>Download Package</span>
							</>
						)}
					</button>
				</div>
			</div>
		</>
	);
}
