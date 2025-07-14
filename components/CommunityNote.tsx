interface CommunityNoteProps {
  content: string;
  backgroundColor: string;
  sources?: string[];
}

export default function CommunityNote({
  content,
  backgroundColor,
  sources = [],
}: CommunityNoteProps) {
  return (
    <div
      className="w-[419px] h-[124px] rounded-[20px] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.25)] relative group"
      style={{ backgroundColor }}
    >
      <div className="p-4 h-full">
        <p className="text-sm text-black font-normal leading-normal h-[96px] overflow-y-auto overflow-x-hidden scrollbar-hide">
          {content}
        </p>
        
        {sources.length > 0 && (
          <div className="absolute bottom-2 right-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full cursor-help">
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 p-2">
                <div className="text-xs font-semibold text-gray-700 mb-1">Sources:</div>
                <ul className="text-xs text-gray-600 space-y-1">
                  {sources.map((source, index) => (
                    <li key={index} className="border-b border-gray-100 pb-1 last:border-b-0">
                      {source}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
