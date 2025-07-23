"use client";

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  perspectiveId: number;
  onSubmit: () => void;
}

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999 !important;
  opacity: ${props => props.$isOpen ? '1' : '0'} !important;
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'} !important;
  transition: all 0.3s ease;
  padding: 20px;
  box-sizing: border-box;

  @media (max-width: 640px) {
    padding: 16px !important;
  }
`;

const ModalContent = styled.div<{ $isOpen: boolean }>`
  background: white;
  border-radius: 15px;
  padding: 0;
  max-width: 500px;
  width: 100%;
  max-height: calc(100vh - 40px);
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  transform: ${props => props.$isOpen ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)'} !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  @media (max-width: 640px) {
    width: 100% !important;
    max-width: calc(100vw - 32px) !important;
    max-height: calc(100vh - 32px) !important;
    margin: 0 !important;
  }
`;

const ModalHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: black;
  color: white;

  @media (max-width: 640px) {
    padding: 16px;
  }
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;

  @media (max-width: 640px) {
    font-size: 1.1rem;
  }
`;

const ModalClose = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ModalBody = styled.div`
  padding: 24px;

  @media (max-width: 640px) {
    padding: 16px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 8px;
`;

const FormTextarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;
  color: black;

  &:focus {
    outline: none;
    border-color: black;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const ModalFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #f9fafb;

  @media (max-width: 640px) {
    padding: 16px;
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ButtonSecondary = styled(Button)`
  background: black;
  color: white;

  &:hover {
    background: #333333;
  }
`;

const ButtonPrimary = styled(Button)`
  background: black;
  color: white;

  &:hover:not(:disabled) {
    background: #333333;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }

  &:disabled {
    opacity: 1;
    cursor: not-allowed;
  }
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const AuthError = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;

  p {
    color: #dc2626;
    font-size: 14px;
    margin: 0;
  }

  a {
    color: #dc2626;
    font-weight: 600;
    text-decoration: underline;
    
    &:hover {
      color: #b91c1c;
    }
  }
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
  padding: 20px;
`;

export default function AddNoteModal({ isOpen, onClose, perspectiveId, onSubmit }: AddNoteModalProps) {
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<{ email: string; nama: string } | null>(null);
  const [authError, setAuthError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  // Check authentication when modal opens
  useEffect(() => {
    if (isOpen) {
      checkAuthentication();
    }
  }, [isOpen]);

  const checkAuthentication = async () => {
    setIsCheckingAuth(true);
    setAuthError('');
    
    try {
      const response = await fetch('/api/auth/me');
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
        setAuthError('Please log in to add a community note.');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setAuthError('Please log in to add a community note.');
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleClose = () => {
    setNewNote('');
    setAuthError('');
    setUser(null);
    setIsCheckingAuth(true);
    onClose();
  };

  const handleSubmitNote = async () => {
    if (!newNote.trim() || isSubmitting) return;

    if (!user) {
      router.push('/auth/login');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/comm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idpers: perspectiveId,
          notes: newNote.trim(),
          userEmail: user.email,
        }),
      });

      if (response.ok) {
        setNewNote('');
        handleClose();
        onSubmit();
        window.location.reload();
      } else {
        const errorData = await response.json();
        console.error('Failed to submit note:', errorData);
        setAuthError(errorData.error || 'Failed to submit note. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting note:', error);
      setAuthError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay 
      $isOpen={isOpen}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <ModalContent $isOpen={isOpen}>
        <ModalHeader>
          <ModalTitle>Add Community Note</ModalTitle>
          <ModalClose onClick={handleClose}>
            ×
          </ModalClose>
        </ModalHeader>
        
        <ModalBody>
          {isCheckingAuth ? (
            <LoadingState>
              <Spinner />
              Checking authentication...
            </LoadingState>
          ) : (
            <FormGroup>
              {authError && (
                <AuthError>
                  <p>
                    {authError}{' '}
                    <Link href="/auth/login">
                      Log in here
                    </Link>
                  </p>
                </AuthError>
              )}
              
              <FormLabel>Your Note</FormLabel>
              <FormTextarea
                placeholder="Share your thoughts, additional context, or corrections about this perspective..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                maxLength={500}
                disabled={!user}
              />
              <div style={{ 
                fontSize: '12px', 
                color: '#6b7280', 
                textAlign: 'right', 
                marginTop: '4px' 
              }}>
                {newNote.length}/500 characters
              </div>
            </FormGroup>
          )}
        </ModalBody>
        
        <ModalFooter>
          <ButtonSecondary onClick={handleClose}>
            Cancel
          </ButtonSecondary>
          <ButtonPrimary 
            onClick={handleSubmitNote}
            disabled={isSubmitting || isCheckingAuth || (!!user && !newNote.trim())}
          >
            {isSubmitting ? (
              <>
                <Spinner />
                Submitting...
              </>
            ) : !user ? (
              'Please Log In'
            ) : (
              'Submit Note'
            )}
          </ButtonPrimary>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
}
