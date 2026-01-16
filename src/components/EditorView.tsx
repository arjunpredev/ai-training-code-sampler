import { useState, useMemo } from "react";
import type { FileEntry, RepositoryStats } from "../types/file-types";
import { EditorSidebar } from "./EditorSidebar";
import { CodeEditor } from "./CodeEditor";
import { GlobalStatusBar } from "./GlobalStatusBar";
import { SubmissionModal } from "./SubmissionModal";
import { useEditorState } from "../hooks/use-editor-state";
import { getMonacoLanguageId } from "../lib/monaco-language-utils";
import { useCombinedDownload } from "../hooks/use-combined-download";
import { Watermark } from "./watermark";

interface EditorViewProps {
	files: FileEntry[];
	repoName: string;
	stats?: RepositoryStats;
}

/**
 * EditorView component - main editor interface with sidebar and Monaco editor
 */
export function EditorView({ files, repoName, stats }: EditorViewProps) {
	const [showSubmissionModal, setShowSubmissionModal] = useState(false);
	const [showMobileSidebar, setShowMobileSidebar] = useState(false);

	const {
		selectedFile,
		modifiedFiles,
		deletedFiles,
		selectFile,
		updateFileContent,
		deleteFile,
	} = useEditorState(files);

	const {
		isDownloading,
		progress,
		error: downloadError,
		downloadAll,
	} = useCombinedDownload();

	const languageId = selectedFile
		? getMonacoLanguageId(selectedFile.name)
		: "plaintext";

	// Calculate global line diff
	const globalLineDiff = useMemo(() => {
		let totalLines = 0;
		let originalTotalLines = 0;

		files.forEach((file) => {
			if (file.isDirectory) return;
			if (deletedFiles.has(file.path)) return;
			if (Array.from(deletedFiles).some((df) => file.path.startsWith(df + "/")))
				return;

			const currentContent = modifiedFiles.get(file.path) || file.content;
			const currentLines = currentContent
				? currentContent.split("\n").length
				: 0;
			totalLines += currentLines;

			const originalLines = file.originalContent
				? file.originalContent.split("\n").length
				: currentLines;
			originalTotalLines += originalLines;
		});

		return totalLines - originalTotalLines;
	}, [files, deletedFiles, modifiedFiles]);

	const handleDownload = async () => {
		const filesWithModifications = files
			.filter(
				(file) =>
					!deletedFiles.has(file.path) &&
					!Array.from(deletedFiles).some((df) => file.path.startsWith(df + "/"))
			)
			.map((file) => {
				if (modifiedFiles.has(file.path)) {
					return {
						...file,
						content: modifiedFiles.get(file.path) || file.content,
					};
				}
				return file;
			});

		await downloadAll(filesWithModifications, repoName, undefined, stats);
	};

	return (
		<div className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
			{/* Global Status Bar with Ready for Submission button */}
			<GlobalStatusBar
				files={files}
				deletedFiles={deletedFiles}
				modifiedFiles={modifiedFiles}
				onSubmitClick={() => setShowSubmissionModal(true)}
			/>

			{/* Download error message */}
			{downloadError && (
				<div className="bg-red-950/50 border-b border-red-900/50 px-4 py-2 text-xs text-red-400">
					{downloadError}
				</div>
			)}

			{/* Main Editor Area */}
			<div className="flex flex-1 overflow-hidden relative">
				{/* Mobile sidebar overlay */}
				{showMobileSidebar && (
					<div
						className="md:hidden fixed inset-0 bg-black/50 z-20"
						onClick={() => setShowMobileSidebar(false)}
					/>
				)}

				{/* Sidebar - hidden on mobile by default, shown as overlay */}
				<div
					className={`
						md:relative md:block
						${showMobileSidebar ? "fixed inset-y-0 left-0 z-20" : "hidden"}
					`}
				>
					<EditorSidebar
						files={files}
						selectedFilePath={selectedFile?.path || null}
						onFileSelect={(file) => {
							selectFile(file);
							setShowMobileSidebar(false);
						}}
						onFileDelete={deleteFile}
						deletedFiles={deletedFiles}
						modifiedFiles={modifiedFiles}
						globalLineDiff={globalLineDiff}
						onCloseMobile={() => setShowMobileSidebar(false)}
					/>
				</div>

				{/* Editor */}
				<div className="flex-1 overflow-hidden">
					<CodeEditor
						file={selectedFile}
						language={languageId}
						onChange={(content) => {
							if (selectedFile) {
								updateFileContent(selectedFile.path, content);
							}
						}}
						onToggleSidebar={() => setShowMobileSidebar(true)}
					/>
				</div>
			</div>

			{/* Submission Modal */}
			<SubmissionModal
				isOpen={showSubmissionModal}
				onClose={() => setShowSubmissionModal(false)}
				files={files}
				deletedFiles={deletedFiles}
				modifiedFiles={modifiedFiles}
				onDownload={handleDownload}
				isDownloading={isDownloading}
				downloadProgress={progress}
			/>

			{/* Watermark - bottom right, hidden on mobile */}
			<div className="fixed bottom-4 right-4 items-center gap-2 z-10 hidden md:flex">
				<Watermark />
			</div>
		</div>
	);
}
