import { useState } from 'react';

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
  const [showSourcesPopup, setShowSourcesPopup] = useState(false);
  return (
    <div className="w-full max-w-[419px] min-w-[320px] h-[611px] bg-white rounded-[20px] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.25)] relative mx-auto hover-lift smooth-transition">
      <div className="p-5">
        {/* Header with title and sources */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-black pr-4 flex-1">{title}</h3>
          {sources.length > 0 && (
            <div className="relative flex-shrink-0">
              <button
                className="group text-sm font-bold underline smooth-transition"
                style={{ color: sourcesColor }}
                onClick={() => setShowSourcesPopup(true)}
              >
                sources
                {/* Sources tooltip */}
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 p-2 pointer-events-none">
                  <div className="text-xs font-semibold text-gray-700 mb-1">Sources:</div>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {sources.map((source, index) => (
                      <li key={index} className="border-b border-gray-100 pb-1 last:border-b-0">
                        {source}
                      </li>
                    ))}
                  </ul>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="text-sm text-black font-normal leading-normal h-[520px] overflow-y-auto overflow-x-hidden scrollbar-hide">
          {content}
        </div>
      </div>

      {/* Sources Popup Modal */}
      {showSourcesPopup && (
        <>
          {/* Invisible overlay to close popup when clicked outside */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowSourcesPopup(false)}
          />
          
          {/* Small popup card positioned near sources */}
          <div className="absolute top-12 right-0 z-50 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-800">Sources</h3>
              <button
                onClick={() => setShowSourcesPopup(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-2">
              {sources.map((source, index) => (
                <div
                  key={index}
                  className="p-2 border border-gray-100 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    const searchQuery = encodeURIComponent(source);
                    window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
                  }}
                >
                  <p className="text-xs text-gray-700 font-medium">{source}</p>
                  <p className="text-xs text-gray-500 mt-1">Click to search</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
