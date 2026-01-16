import { useRef, useState } from "react";
import { Upload, Loader2, Github } from "lucide-react";
import { ErrorDisplay } from "./ErrorDisplay";
import { Watermark } from "./watermark";

interface UploadDropzoneProps {
	isLoading: boolean;
	progress: number;
	error?: string | null;
	onFileSelect: (file: File) => void;
	onRetry?: () => void;
}

/**
 * Full-page drag-and-drop file upload component
 * Beautiful, minimal design with smooth animations
 */
export function UploadDropzone({
	isLoading,
	progress,
	error,
	onFileSelect,
	onRetry,
}: UploadDropzoneProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		const files = e.dataTransfer.files;
		if (files && files.length > 0) {
			const file = files[0];
			if (file.name.toLowerCase().endsWith(".zip")) {
				onFileSelect(file);
			} else {
				// Show error - handled by parent component
			}
		}
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			onFileSelect(file);
		}
		// Reset input so the same file can be selected again
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<div
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			className="relative w-full h-full flex flex-col overflow-hidden bg-gradient-to-br from-zinc-950 via-black to-zinc-900"
		>
			<input
				ref={fileInputRef}
				type="file"
				accept=".zip"
				onChange={handleFileSelect}
				className="hidden"
			/>

			{/* Animated background gradient on drag */}
			{isDragging && (
				<div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-blue-500/5 pointer-events-none animate-pulse" />
			)}

			{/* Loading state */}
			{isLoading ? (
				<div className="flex-1 flex flex-col items-center justify-center gap-8 px-4">
					<div className="flex flex-col items-center gap-6">
						<div className="relative">
							<div className="w-20 h-20 rounded-full border-2 border-zinc-800" />
							<Loader2 className="absolute inset-0 w-20 h-20 text-blue-500 animate-spin" />
						</div>
						<div className="text-center">
							<p className="text-xl text-zinc-100 font-light mb-4">
								Extracting your code...
							</p>
							<div className="w-64 h-1 bg-zinc-800 rounded-full overflow-hidden">
								<div
									className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
									style={{ width: `${progress}%` }}
								/>
							</div>
							<p className="text-sm text-zinc-500 mt-4">{progress}%</p>
						</div>
					</div>
				</div>
			) : error ? (
				<div className="flex-1 flex flex-col items-center justify-center px-4">
					<div className="max-w-md w-full">
						<ErrorDisplay
							error={error}
							onRetry={() => {
								onRetry?.();
								fileInputRef.current?.click();
							}}
							logToConsole={true}
							className="w-full"
						/>
					</div>
				</div>
			) : (
				<div className="flex-1 flex flex-col items-center justify-center px-4">
					{/* Main content */}
					<div className="text-center max-w-2xl">
						{/* Title */}
						<h1 className="text-2xl sm:text-3xl md:text-5xl font-light text-zinc-100 mb-2 sm:mb-4 tracking-tight">
							AI Training Code Sampler
						</h1>

						{/* Subtitle */}
						<p className="text-base sm:text-lg md:text-xl text-zinc-400 font-light mb-8 sm:mb-12">
							Prepare your repository for AI training data evaluation
						</p>

						{/* Drop zone button */}
						<button
							onClick={() => fileInputRef.current?.click()}
							onDragOver={handleDragOver}
							className={`
                relative w-full max-w-xs mx-auto py-10 sm:py-16 px-6 sm:px-8 rounded-xl
                transition-all duration-300 group cursor-pointer
                ${
									isDragging
										? "border-2 border-blue-400 bg-blue-500/5 shadow-lg shadow-blue-500/20"
										: "border-2 border-zinc-700 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-800/50"
								}
              `}
						>
							<div className="flex flex-col items-center gap-3 sm:gap-4">
								<div
									className={`transition-transform duration-300 ${
										isDragging ? "scale-110" : "group-hover:scale-105"
									}`}
								>
									<Upload
										className={`w-10 h-10 sm:w-12 sm:h-12 ${
											isDragging
												? "text-blue-400"
												: "text-zinc-500 group-hover:text-zinc-400"
										}`}
									/>
								</div>
								<div>
									<p
										className={`text-base sm:text-lg font-medium transition-colors ${
											isDragging
												? "text-blue-300"
												: "text-zinc-300 group-hover:text-zinc-200"
										}`}
									>
										{isDragging ? "Drop it here" : "Drop Zipped Repo here"}
									</p>
									<p className="text-xs sm:text-sm text-zinc-600 mt-1">
										or click to browse
									</p>
								</div>
							</div>
						</button>

						{/* Privacy note below dropzone */}
						<p className="mt-4 sm:mt-6 text-xs sm:text-sm text-zinc-500 px-4">
							All processing happens locally in your browser — your code never
							leaves your machine.
						</p>
					</div>
				</div>
			)}

			{/* GitHub link - bottom left */}
			<a
				href="https://github.com/arjunpredev/ai-training-code-sampler"
				target="_blank"
				rel="noopener noreferrer"
				className="fixed bottom-4 left-4 flex items-center gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm text-zinc-500 hover:text-zinc-300 transition-colors rounded-lg hover:bg-zinc-800/50"
			>
				<Github className="w-4 h-4" />
				<span>Fork on GitHub</span>
			</a>
			{/* Watermark */}
			<div className="fixed bottom-4 right-4 flex items-center gap-2 z-10">
				<Watermark />
			</div>
		</div>
	);
}
