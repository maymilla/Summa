"use client";

import Header from "../../components/Header";
import TopicCard from "../../components/TopicCard";
import { useState } from "react";
import { topics } from "../../data/topics";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Derived state to determine if we are in the "searching" state.
  // We use trim() to ensure that searching doesn't trigger on empty spaces.
  const isSearching = searchQuery.trim() !== "";

  const filteredTopics = isSearching
    ? topics.filter(topic =>
        topic.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []; 

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{
        background: "linear-gradient(180deg, #E2F1FF 0%, #F7F1FF 100%)",
      }}
    >
      {/* Header */}
      <Header />

      {/* Search Container */}
      <div
        className={`w-full transition-all duration-500 ease-in-out ${
          isSearching
            ? "pt-6 pb-12 px-4 flex-grow flex items-center justify-center" 
            : "flex-grow flex items-center justify-center px-4" 
        }`}
      >
        <div className="relative w-full max-w-[603px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics..."
            className="w-full h-[40px] px-[22px] bg-white py-2 rounded-full opacity-80 shadow-lg border-none outline-none text-black text-sm font-normal transition-shadow"
          />
        </div>
      </div>

      {/* Topic Cards Results */}
      {isSearching && (
        <div className="flex-grow flex justify-center px-4 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center max-w-fit">
            {filteredTopics.length > 0 ? (
              filteredTopics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  id={topic.id}
                  title={topic.title}
                  description={topic.description}
                />
              ))
            ) : (
              // if no results are found
              <div className="col-span-full text-center text-gray-600 py-8">
                <h3 className="text-lg font-semibold">No topics found</h3>
                <p>Try a different search term to find what you're looking for.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}