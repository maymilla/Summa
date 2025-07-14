interface PerspectiveCardProps {
  title: string;
  content: string;
  sourcesColor: string;
  sources?: string[];
}

export default function PerspectiveCard({
  title,
  content,
  sourcesColor,
  sources = [],
}: PerspectiveCardProps) {
  return (
    <div className="w-full max-w-[419px] min-w-[320px] h-[611px] bg-white rounded-[20px] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.25)] relative mx-auto hover-lift smooth-transition">
      <div className="p-5">
        {/* Header with title and sources */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-black pr-4 flex-1">{title}</h3>
          {sources.length > 0 && (
            <div className="group relative flex-shrink-0 tooltip-container">
              <button
                className="text-sm font-bold underline smooth-transition"
                style={{ color: sourcesColor }}
              >
                sources
              </button>
              {/* Sources tooltip */}
              <div className="tooltip-content absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 p-3">
                <ul className="text-xs text-gray-700 space-y-1">
                  {sources.map((source, index) => (
                    <li key={index} className="border-b border-gray-100 pb-1 last:border-b-0">
                      {source}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="text-sm text-black font-normal leading-normal h-[520px] overflow-y-auto overflow-x-hidden scrollbar-hide">
          {content}
        </div>
      </div>
    </div>
  );
}
