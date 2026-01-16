export const Watermark = () => {
	return (
		<a
			href="https://pre.dev"
			target="_blank"
			rel="noopener noreferrer"
			className="cursor-pointer px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-black hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 z-40 flex items-center gap-1.5 sm:gap-2"
		>
			<div className="text-white text-xs sm:text-sm hover:text-gray-200">
				built on{" "}
			</div>
			<img
				src="https://pre.dev/predev.png"
				alt="pre.dev"
				className="h-3 sm:h-4"
			/>
			<div className="cursor-pointer text-white text-sm sm:text-md">
				pre.dev
			</div>
		</a>
	);
};
