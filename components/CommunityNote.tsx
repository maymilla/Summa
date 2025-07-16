import React from 'react';
import styled from 'styled-components';
import HoverCard, { useHoverContent } from './HoverCard';

interface CommunityNoteProps {
  content: string;
  backgroundColor?: string;
  sources?: string[];
  colorCycle?: number; // Index to determine color rotation
}

const SourcesContainer = styled.div`
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  z-index: 20;

  .sources-tooltip {
    position: absolute;
    bottom: 100%;
    right: 0;
    margin-bottom: 0.5rem;
    width: 12rem;
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    opacity: 0;
    transition: opacity 0.2s;
    padding: 0.5rem;
    z-index: 30;
  }

  .hover-card:hover .sources-tooltip {
    opacity: 1;
  }

  .sources-title {
    font-size: 0.75rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.25rem;
  }

  .sources-list {
    font-size: 0.75rem;
    color: #6b7280;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .sources-list li {
    padding-bottom: 0.25rem;
    border-bottom: 1px solid #f3f4f6;
    margin-bottom: 0.25rem;
  }

  .sources-list li:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const ContentWrapper = styled.div`
  font-size: 0.875rem;
  color: #000000;
  font-weight: 400;
  line-height: 1.5;
  height: 84px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 0.5rem;

  /* Hide scrollbar but keep functionality */
  &::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;
`;

export default function CommunityNote({
  content,
  backgroundColor,
  sources = [],
  colorCycle = 0,
}: CommunityNoteProps) {
  const hoverContent = useHoverContent(
    <ContentWrapper>{content}</ContentWrapper>
  );

  return (
    <HoverCard backgroundColor={backgroundColor} height="124px" colorCycle={colorCycle}>
      {hoverContent}
      
      {sources.length > 0 && (
        <SourcesContainer>
          <div className="sources-tooltip">
            <div className="sources-title">Sources:</div>
            <ul className="sources-list">
              {sources.map((source, index) => (
                <li key={index}>{source}</li>
              ))}
            </ul>
          </div>
        </SourcesContainer>
      )}
    </HoverCard>
  );
}
