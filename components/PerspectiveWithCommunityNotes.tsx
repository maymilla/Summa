"use client";

import PerspectiveCard from './PerspectiveCard';
import styled from 'styled-components';
import { useState } from 'react';

interface CommunityNote {
  idcomm: number;
  idpers: number;
  notes: string;
  userEmail: string;
  upvote?: number;
  downvote?: number;
}

interface PerspectiveWithCommunityNotesProps {
  perspectiveId: number;
  title: string;
  content: string;
  sourcesColor: string;
  sources?: string[];
  communityNotes: CommunityNote[];
  onAddNoteClick?: (perspectiveId: number) => void;
}

const StyledWrapper = styled.div`
  .perspective-container {
    position: relative;
    width: 100%;
    max-width: 419px;
    min-width: 320px;
  }

  .perspective-card-wrapper {
    position: relative;
    z-index: 2;
    transition: all 0.3s ease;
  }

  .perspective-container:hover .perspective-card-wrapper {
    transform: translateY(-4px);
  }

  .community-notes-indicator {
    position: absolute;
    bottom: -12px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 3;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 1;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    cursor: pointer;
  }

  .community-notes-indicator:hover {
    opacity: 1;
    transform: translateX(-50%) translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .perspective-container:hover .community-notes-indicator {
    opacity: 0;
    visibility: hidden;
    transform: translateX(-50%) translateY(-10px);
  }

  .indicator-arrow {
    width: 16px;
    height: 16px;
    stroke: #374151;
    stroke-width: 4;
    transition: transform 0.2s ease;
  }

  .community-notes-indicator:hover .indicator-arrow {
    transform: translateY(1px);
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.05); }
  }

  .community-notes-layer {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 1;
    margin-top: 16px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-20px);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .perspective-container:hover .community-notes-layer {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .community-card {
    width: 100%;
    min-height: 200px;
    border-radius: 15px;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    box-shadow: 0px 4px 8px 0px rgba(0,0,0,0.25);
  }

  .community-card::before {
    content: "";
    height: 100px;
    width: 100px;
    position: absolute;
    top: -40%;
    left: -20%;
    border-radius: 50%;
    border: 35px solid rgba(255, 255, 255, 0.102);
    transition: all .8s ease;
    filter: blur(.5rem);
  }

  .community-card:hover::before {
    width: 140px;
    height: 140px;
    top: -30%;
    left: 50%;
    filter: blur(0rem);
  }

  .community-header {
    padding: 15px 15px 0 15px;
  }

  .community-title {
    font-size: 1.2em;
    font-weight: 900;
    color: white;
    margin-bottom: 8px;
  }

  .notes-count {
    font-size: 0.6em;
    font-weight: 300;
    color: rgba(240, 248, 255, 0.691);
  }

  .community-content {
    flex-grow: 1;
    padding: 0 15px;
    margin-bottom: 10px;
  }

  .note-item {
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.2s ease;
  }

  .note-item:last-child {
    border-bottom: none;
  }

  .note-text {
    color: white;
    font-size: 1rem;
    line-height: 1.4;
    margin-bottom: 4px;
    font-weight: 400;
  }

  .note-author {
    color: rgb(245, 245, 245);
    font-size: 0.8rem;
    font-weight: 300;
    flex: 1;
  }

  .note-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 4px;
  }

  .note-voting {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .note-footer {
    padding: 8px 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .note-vote-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.7rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .note-vote-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .note-vote-btn.upvote:hover {
    background: rgba(34, 197, 94, 0.3);
    border-color: rgba(34, 197, 94, 0.5);
  }

  .note-vote-btn.downvote:hover {
    background: rgba(239, 68, 68, 0.3);
    border-color: rgba(239, 68, 68, 0.5);
  }

  .community-icons {
    display: flex;
    justify-items: center;
    align-items: center;
    width: 100%;
    border-radius: 0px 0px 15px 15px;
    overflow: hidden;
  }

  .community-btn {
    border: none;
    flex: 1;
    height: 35px;
    background-color: rgba(247, 234, 234, 0.589);
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    transition: all 0.2s ease;
    position: relative;
    cursor: pointer;
    gap: 4px;
  }

  .community-btn:hover {
    background-color: rgb(247, 234, 234);
  }

  .community-btn.upvote:hover {
    background-color: rgba(34, 197, 94, 0.2);
  }

  .community-btn.downvote:hover {
    background-color: rgba(239, 68, 68, 0.2);
  }

  .community-btn.add-note:hover {
    background-color: rgba(59, 130, 246, 0.2);
  }

  .community-svg-icon {
    width: 20px;
    height: 20px;
    stroke: rgb(38, 59, 126);
    transition: all 0.2s ease;
  }

  .vote-count {
    font-size: 0.7rem;
    font-weight: 600;
    color: rgb(38, 59, 126);
    min-width: 16px;
    text-align: center;
  }

  .tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.65rem;
    font-weight: 500;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s ease;
    pointer-events: none;
    z-index: 10;
  }

  .tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.8);
  }

  .community-btn:hover .tooltip {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(-4px);
  }

  .empty-state {
    padding: 24px 16px;
    text-align: center;
    color: #64748b;
  }

  .empty-icon {
    font-size: 2rem;
    margin-bottom: 8px;
    opacity: 0.6;
  }

  .empty-text {
    font-size: 0.85rem;
    font-weight: 500;
    margin-bottom: 4px;
  }

  .empty-subtext {
    font-size: 0.75rem;
    opacity: 0.7;
  }

  @media (max-width: 640px) {
    .perspective-container {
      max-width: 320px;
    }
    
    .community-notes-layer {
      margin-top: 12px;
    }
    
    .community-header {
      padding: 12px 16px;
    }
    
    .community-title {
      font-size: 0.85rem;
    }
    
    .note-item {
      padding: 12px 16px;
    }
    
    .note-text {
      font-size: 0.85rem;
    }
  }
`;

export default function PerspectiveWithCommunityNotes({
  perspectiveId,
  title,
  content,
  sourcesColor,
  sources = [],
  communityNotes,
  onAddNoteClick
}: PerspectiveWithCommunityNotesProps) {
  const perspectiveNotes = communityNotes.filter(note => note.idpers === perspectiveId);
  
  const [noteVotes, setNoteVotes] = useState<{[key: number]: {upvote: number, downvote: number}}>(() => {
    const initialVotes: {[key: number]: {upvote: number, downvote: number}} = {};
    perspectiveNotes.forEach(note => {
      initialVotes[note.idcomm] = {
        upvote: note.upvote || 0,
        downvote: note.downvote || 0
      };
    });
    return initialVotes;
  });

  const getCurrentTopScoringNotes = () => {
    const notesWithCurrentVotes = perspectiveNotes.map(note => ({
      ...note,
      upvote: noteVotes[note.idcomm]?.upvote || note.upvote || 0,
      downvote: noteVotes[note.idcomm]?.downvote || note.downvote || 0,
      score: (noteVotes[note.idcomm]?.upvote || note.upvote || 0) - 
             (noteVotes[note.idcomm]?.downvote || note.downvote || 0)
    }));
    
    if (notesWithCurrentVotes.length === 0) return [];
    
    const maxScore = Math.max(...notesWithCurrentVotes.map(note => note.score));
    const topNote = notesWithCurrentVotes.find(note => note.score === maxScore);
    return topNote ? [topNote] : [];
  };
  
  const currentTopScoringNotes = getCurrentTopScoringNotes();

  const handleVote = async (noteId: number, action: 'upvote' | 'downvote') => {
    try {
      setNoteVotes(prev => ({
        ...prev,
        [noteId]: {
          ...prev[noteId],
          [action]: prev[noteId][action] + 1
        }
      }));

      const response = await fetch(`/api/comm/${noteId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        setNoteVotes(prev => ({
          ...prev,
          [noteId]: {
            ...prev[noteId],
            [action]: prev[noteId][action] - 1
          }
        }));
        console.error('Failed to vote');
      }
    } catch (error) {
      setNoteVotes(prev => ({
        ...prev,
        [noteId]: {
          ...prev[noteId],
          [action]: prev[noteId][action] - 1
        }
      }));
      console.error('Error voting:', error);
    }
  };

  return (
    <StyledWrapper>
      <div className="perspective-container">
        {/* Main Perspective Card */}
        <div className="perspective-card-wrapper">
          <PerspectiveCard
            title={title}
            content={content}
            sourcesColor={sourcesColor}
            sources={sources}
          />
          
          {/* Community Notes Indicator */}
          {currentTopScoringNotes.length > 0 && (
            <div className="community-notes-indicator items-center">
              <svg className="indicator-arrow" viewBox="0 0 24 24" fill="none">
                <path d="M6 9L12 15L18 9" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>

        {/* Community Notes Layer (appears on hover) */}
        {currentTopScoringNotes.length > 0 && (
          <div className="community-notes-layer">
            <div className="community-card" style={{ background: sourcesColor }}>
              <div className="community-header">
                <div className="community-title">Community Notes</div>
              </div>
              
              <div className="community-content">
                {currentTopScoringNotes.map((note) => (
                  <div key={note.idcomm} className="note-item">
                    <div className="note-text">{note.notes}</div>
                  </div>
                ))}
              </div>
              
              {/* Author and voting section above the + button */}
              {currentTopScoringNotes.length > 0 && (
                <div className="note-footer">
                  <div className="note-meta">
                    <div className="note-author">— {currentTopScoringNotes[0].userEmail}</div>
                    <div className="note-voting">
                      <button 
                        className="note-vote-btn upvote" 
                        onClick={() => handleVote(currentTopScoringNotes[0].idcomm, 'upvote')}
                      >
                        ↑ {noteVotes[currentTopScoringNotes[0].idcomm]?.upvote || 0}
                      </button>
                      <button 
                        className="note-vote-btn downvote" 
                        onClick={() => handleVote(currentTopScoringNotes[0].idcomm, 'downvote')}
                      >
                        ↓ {noteVotes[currentTopScoringNotes[0].idcomm]?.downvote || 0}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="community-icons">
                <button 
                  className="community-btn add-note"
                  onClick={() => onAddNoteClick?.(perspectiveId)}
                >
                  <svg className="community-svg-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5V19M5 12H19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div className="tooltip">Add Note</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StyledWrapper>
  );
}
