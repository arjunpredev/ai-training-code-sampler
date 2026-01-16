import { useEffect } from "react";
import {
	BrowserRouter,
	Routes,
	Route,
	useNavigate,
	useLocation,
} from "react-router-dom";
import { useZipHandler } from "./hooks/use-zip-handler";
import { UploadDropzone } from "./components/UploadDropzone";
import { EditorView } from "./components/EditorView";
import { HelpButton } from "./components/HelpButton";
import type { FileEntry, RepositoryStats } from "./types/file-types";

/**
 * Landing page with file upload
 */
function LandingPage() {
	const navigate = useNavigate();
	const {
		isLoading: isZipLoading,
		error: zipError,
		progress,
		handleZipUpload,
	} = useZipHandler();

	const handleFileSelect = async (file: File) => {
		const result = await handleZipUpload(file);

		// Navigate immediately after successful upload (no extra render cycle)
		if (result.success && result.files.length > 0) {
			const filesWithOriginal = result.files.map((f) => ({
				...f,
				originalContent: f.content,
			}));
			const repoName = result.files[0]?.path.split("/")[0] || "repository";
			navigate("/editor", {
				replace: true,
				state: { files: filesWithOriginal, repoName, stats: result.stats },
			});
		}
	};

	return (
		<div className="w-full h-screen overflow-hidden">
			<UploadDropzone
				isLoading={isZipLoading}
				progress={progress}
				error={zipError}
				onFileSelect={handleFileSelect}
			/>
			{/* Info popover positioned absolute over the upload zone */}
			<div className="absolute top-6 right-6 z-10">
				<HelpButton />
			</div>
		</div>
	);
}

/**
 * Editor page with Monaco editor
 */
function EditorPage() {
	const navigate = useNavigate();
	const location = useLocation();

	// Get data from router state
	const state = location.state as {
		files: FileEntry[];
		repoName: string;
		stats?: RepositoryStats;
	} | null;

	// Redirect to landing if no files
	useEffect(() => {
		if (!state?.files) {
			navigate("/", { replace: true });
		}
	}, [state, navigate]);

	if (!state?.files) {
		return (
			<div className="h-screen w-screen flex items-center justify-center bg-zinc-950">
				<div className="text-zinc-400">Loading...</div>
			</div>
		);
	}

	return (
		<EditorView
			files={state.files}
			repoName={state.repoName}
			stats={state.stats}
		/>
	);
}

/**
 * Main App with routing
 */
function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route path="/editor" element={<EditorPage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
