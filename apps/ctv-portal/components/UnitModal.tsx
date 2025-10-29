"use client";

import { useState } from "react";
import { X, DollarSign, Bed, Bath, Maximize2, Compass, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

type UnitModalProps = {
    unit: any;
    onClose: () => void;
};

export default function UnitModal({ unit, onClose }: UnitModalProps) {
    if (!unit) return null;

    // Create multiple images for the unit
    const unitImages = [
        unit.image, // Main image
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1560448075-bb485b067938?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1560449752-c4b8b5c6b9c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ];

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % unitImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + unitImages.length) % unitImages.length);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="relative bg-gradient-to-r from-indigo-500 to-blue-500 p-4 text-white">
                    <h3 className="font-bold text-lg">{unit.code}</h3>
                    <p className="text-sm">
                        Block {unit.code.slice(0, 3)} · Tầng {Math.floor(Math.random() * 15) + 1}
                    </p>
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 bg-white/20 p-1.5 rounded-full hover:bg-white/30"
                    >
                        <X size={18} />
                    </button>
                </div>
                {/* Image section */}
                <div className="relative p-3">
                    <img
                        src={unitImages[currentImageIndex]}
                        alt={`${unit.code} - Image ${currentImageIndex + 1}`}
                        className="w-full h-64 object-cover rounded-2xl"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center px-5">
                        <button
                            onClick={prevImage}
                            className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-white shadow-lg transition-all"
                        >
                            <ChevronLeft size={16} />
                        </button>
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center px-5">
                        <button
                            onClick={nextImage}
                            className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-white shadow-lg transition-all"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                    {/* Image indicators */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {unitImages.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
                {/* Body */}
                <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition text-center">
                            <Bed className="mx-auto text-blue-500 mb-1" />
                            <p className="text-xs text-gray-500">Phòng ngủ</p>
                            <p className="font-semibold text-lg text-gray-500">{unit.numRoom}</p>
                        </div>
                        <div className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition text-center">
                            <Bath className="mx-auto text-purple-500 mb-1" />
                            <p className="text-xs text-gray-500">Phòng tắm</p>
                            <p className="font-semibold text-lg text-gray-500">{unit.numWC}</p>
                        </div>
                        <div className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition text-center">
                            <Maximize2 className="mx-auto text-green-500 mb-1" />
                            <p className="text-xs text-gray-500">Diện tích</p>
                            <p className="font-semibold text-lg text-gray-500">{unit.area}</p>
                        </div>
                        <div className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition text-center">
                            <Compass className="mx-auto text-yellow-500 mb-1" />
                            <p className="text-xs text-gray-500">Hướng</p>
                            <p className="font-semibold text-lg text-gray-500">{unit.direction}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition text-center">
                        <p className="text-xs text-gray-500">Tầm nhìn</p>
                        <p className="font-semibold text-blue-600">{unit.view}</p>
                    </div>

                    <div className="bg-green-100 text-green-800 rounded-xl p-4 flex justify-between items-center">
                        <div>
                            <p className="text-xs">Giá bán</p>
                            <p className="text-2xl font-bold">{formatCurrency(unit.price)}</p>
                        </div>
                        <DollarSign className="text-green-700" />
                    </div>

                    <div className="bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-xl p-4 flex justify-between items-center">
                        <div>
                            <p className="text-xs opacity-80">Hoa hồng CTV</p>
                            <p className="text-xl font-semibold">{formatCurrency(unit.commission)}</p>
                        </div>
                        <Badge className="bg-white/20">≈ {((unit.commission / unit.price) * 100).toFixed(2)}% giá bán</Badge>
                    </div>

                    <Button className="w-full py-4 rounded-full text-white font-semibold flex items-center justify-center gap-2 
                                        bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 transition-all">
                        <Calendar className="w-5 h-5 mr-2" />
                        Giữ chỗ
                    </Button>

                    <div className="flex justify-between mt-2 gap-3">
                        <Button variant="outline" className="flex-1 py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 transition-all">
                            Booking
                        </Button>
                        <Button variant="outline" className="flex-1 py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 transition-all">
                            Đặt cọc
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
