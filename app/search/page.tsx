"use client";

import Header from "../../components/Header";
import TopicCard from "../../components/TopicCard";
import { useState } from "react";
import { topics } from "../../data/topics";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTopics = topics.filter(topic =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="gradient-bg">
      {/* Header */}
      <Header />

      {/* Search Bar */}
      <div className="flex justify-center pt-6 pb-12 px-4">
        <div className="relative w-full max-w-[603px] min-w-[280px] h-[33px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics..."
            className="w-full h-[33px] px-[22px] bg-white py-2 rounded-[20px] opacity-80 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] border-none outline-none text-black text-xs font-normal"
          />
        </div>
      </div>

      {/* Topic Cards */}
      <div className="flex justify-center px-4 pb-16">
        <div className="container-responsive">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center">
            {filteredTopics.map((topic) => (
              <TopicCard
                key={topic.id}
                id={topic.id}
                title={topic.title}
                description={topic.description}
              />
            ))}
            {filteredTopics.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-8">
                No topics found matching your search.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
