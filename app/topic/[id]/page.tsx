"use client";

import Header from "../../../components/Header";
import PerspectiveCard from "../../../components/PerspectiveCard";
import CommunityNote from "../../../components/CommunityNote";
import { topics } from "../../../data/topics";

interface TopicDetailPageProps {
  params: {
    id: string;
  };
}

export default function TopicDetailPage({ params }: TopicDetailPageProps) {
  // Find the current topic based on the ID
  const currentTopic = topics.find(topic => topic.id === params.id);

  if (!currentTopic) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <p className="text-xl text-gray-500">Topic not found</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: "linear-gradient(180deg, #E2F1FF 0%, #F7F1FF 100%)",
      }}
    >
      {/* Header */}
      <Header />

      {/* Main Content Container */}
      <div className="container mx-auto px-4 py-8">
        {/* Main Title */}
        <div className="mb-8 ml-8">
          <h1 className="text-2xl md:text-[28px] font-bold text-black leading-normal text-left">
            {currentTopic.title}
          </h1>
        </div>

        {/* Perspective Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 justify-items-center">
          {currentTopic.perspectives.map((perspective) => (
            <PerspectiveCard
              key={perspective.id}
              title={perspective.title}
              content={perspective.content}
              sourcesColor={perspective.sourcesColor}
              sources={perspective.sources}
            />
          ))}
        </div>

        {/* Community Notes Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-black text-left mb-6 ml-8">
            Community Notes
          </h2>
          
          {/* Community Note Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {currentTopic.communityNotes.map((note) => (
              <CommunityNote
                key={note.id}
                content={note.content}
                backgroundColor={note.backgroundColor}
                sources={note.sources}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
