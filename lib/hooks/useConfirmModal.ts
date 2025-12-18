import { useState } from 'react';

export type ModalType = 'success' | 'error' | 'warning' | 'info';

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: ModalType;
  onConfirm?: () => void;
  confirmText?: string;
}

export function useConfirmModal() {
  const [modalState, setModalState] = useState<ConfirmModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: undefined,
    confirmText: undefined,
  });

  const showModal = (
    title: string,
    message: string,
    type: ModalType = 'info',
    onConfirm?: () => void,
    confirmText?: string
  ) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      confirmText,
    });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const showSuccess = (message: string, title = 'Success') => {
    showModal(title, message, 'success');
  };

  const showError = (message: string, title = 'Error') => {
    showModal(title, message, 'error');
  };

  const showWarning = (
    message: string,
    onConfirm: () => void,
    title = 'Warning',
    confirmText = 'Confirm'
  ) => {
    showModal(title, message, 'warning', onConfirm, confirmText);
  };

  const showInfo = (message: string, title = 'Info') => {
    showModal(title, message, 'info');
  };

  return {
    modalState,
    showModal,
    closeModal,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}

