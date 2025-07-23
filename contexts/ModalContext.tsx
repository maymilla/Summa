"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
  openModalId: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  isModalOpen: (modalId: string) => boolean;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [openModalId, setOpenModalId] = useState<string | null>(null);

  const openModal = (modalId: string) => {
    setOpenModalId(modalId);
  };

  const closeModal = () => {
    setOpenModalId(null);
  };

  const isModalOpen = (modalId: string) => {
    return openModalId === modalId;
  };

  return (
    <ModalContext.Provider value={{
      openModalId,
      openModal,
      closeModal,
      isModalOpen
    }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
