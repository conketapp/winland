import { toast, ToastOptions } from 'react-toastify';

// Default toast configuration
const defaultToastOptions: ToastOptions = {
    position: 'top-center',
    closeOnClick: true,
    style: {
        width: '100%',
        maxWidth: '420px',
        textAlign: 'center',
    },
};

// Custom toast service
export const toastNotification = {
    success: (message: string, options?: ToastOptions) => {
        return toast.success(message, {
            ...defaultToastOptions,
            toastId: `success-${Date.now()}`,
            ...options,
        });
    },

    error: (message: string, options?: ToastOptions) => {
    return toast.error(message, {
        ...defaultToastOptions,
        toastId: `error-${Date.now()}`,
        ...options,
    });
    },

    info: (message: string, options?: ToastOptions) => {
    return toast.info(message, {
        ...defaultToastOptions,
        toastId: `info-${Date.now()}`,
        ...options,
    });
    },

    warning: (message: string, options?: ToastOptions) => {
    return toast.warning(message, {
        ...defaultToastOptions,
        toastId: `warning-${Date.now()}`,
        ...options,
    });
    },

  // Dismiss all toasts
    dismissAll: () => {
    toast.dismiss();
    },

  // Dismiss a specific toast
    dismiss: (toastId: string | number) => {
    toast.dismiss(toastId);
    },
};
