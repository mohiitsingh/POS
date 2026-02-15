import React from 'react';
import Toast, { type ToastProps } from './Toast';
import './ToastContainer.css';

interface ToastContainerProps {
    toasts: ToastProps[];
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <Toast key={toast.id} {...toast} />
            ))}
        </div>
    );
};

export default ToastContainer;
