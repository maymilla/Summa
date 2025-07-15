"use client";

import Header from "../../components/Header";
import TopicListItem from "../../components/TopicListItem";
import FeaturedTopic from "../../components/FeaturedTopic";
import { useState } from "react";
import { topics } from "../../data/topics";
import { featuredTopics } from "../../data/topics";

export default function ExplorePage() {
  return (
    <div className="min-h-screen w-full font-sans" style={{ background: "linear-gradient(180deg, #E2F1FF 0%, #F7F1FF 100%)" }}>
      <Header />

      <main className="container mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">
          Explore topics
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 p-15px">
          {/* Left Column: List of Topics */}
          <div className="lg:col-span-3 flex flex-col space-y-5 p-5">
            {topics.map((topic) => (
              <TopicListItem
                key={topic.id}
                topic={topic}
              />
            ))}
          </div>

          {/* Right Column: Featured Topic Carousel */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center">
            <FeaturedTopic items={featuredTopics} />
          </div>
        </div>
      </main>
    </div>
  );
}
