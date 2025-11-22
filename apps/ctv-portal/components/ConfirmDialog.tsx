"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
    isOpen: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'warning' | 'danger' | 'info' | 'success';
};

export default function ConfirmDialog({
    isOpen,
    title = "Xác nhận",
    message,
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    onConfirm,
    onCancel,
    type = 'warning'
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const getTypeColor = () => {
        switch (type) {
            case 'danger':
                return 'text-red-600';
            case 'info':
                return 'text-blue-600';
            case 'success':
                return 'text-green-600';
            default:
                return 'text-orange-600';
        }
    };

    const getTypeBackground = () => {
        switch (type) {
            case 'danger':
                return 'bg-red-100';
            case 'info':
                return 'bg-blue-100';
            case 'success':
                return 'bg-green-100';
            default:
                return 'bg-orange-100';
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                >
                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-full ${getTypeBackground()}`}>
                                <AlertTriangle className={`w-6 h-6 ${getTypeColor()}`} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                        </div>
                        <button
                            onClick={onCancel}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            <X size={20} className="text-gray-600" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <p className="text-gray-700 leading-relaxed">{message}</p>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-gray-50 flex gap-3">
                        <Button
                            onClick={onCancel}
                            className="flex-1 py-3 rounded-xl font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
                        >
                            {cancelText}
                        </Button>
                        <Button
                            onClick={onConfirm}
                            className={`flex-1 py-3 rounded-xl font-semibold text-white transition-all ${
                                type === 'danger'
                                    ? 'bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800'
                                    : type === 'info'
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800'
                                    : type === 'success'
                                    ? 'bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800'
                                    : 'bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800'
                            }`}
                        >
                            {confirmText}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
