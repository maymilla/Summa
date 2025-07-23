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
                <div className="absolute bottom-full right-0 mb-2 w-64 bg-white border border-gray-200 rounded-[16px] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 p-3 pointer-events-none">
                  <div className="text-xs font-semibold text-gray-700 mb-2">Sources:</div>
                  <div className="space-y-2">
                    {sources.map((source, index) => (
                      <a
                        key={index}
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2 bg-gray-50 rounded-[12px] hover:bg-gray-100 transition-colors pointer-events-auto"
                      >
                        <div className="text-xs text-gray-400 truncate">{source}</div>
                      </a>
                    ))}
                  </div>
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
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowSourcesPopup(false)}
          />
          
          <div className="absolute top-12 right-0 z-50 w-80 bg-white rounded-[20px] shadow-lg border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-black">Sources</h3>
              <button
                onClick={() => setShowSourcesPopup(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              {sources.map((source, index) => (
                <a
                  key={index}
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 border border-gray-200 rounded-[16px] hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-black font-medium truncate group-hover:text-gray-800">
                        {source}
                      </p>
                    </div>
                    <svg 
                      className="w-4 h-4 text-gray-400 group-hover:text-gray-600 ml-2 flex-shrink-0" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
