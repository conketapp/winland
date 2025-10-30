"use client";

import { useState } from "react";
import {
    X, ChevronLeft, ChevronRight, BadgeAlert, CheckSquare, Square, Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { formatCurrency } from "@/lib/utils";
import { toastNotification } from '@/app/utils/toastNotification';
import { useDeviceDetect } from "@/hooks/useDeviceDetect";
import { getModalResponsiveClasses } from "@/app/utils/responsive";

type UnitModalProps = {
    unit: any;
    onClose: () => void;
};

export default function BookingModal({ unit, onClose }: UnitModalProps) {
    if (!unit) return null;

    const deviceInfo = useDeviceDetect();
    const responsive = getModalResponsiveClasses(deviceInfo);

    // Use the image array from unit data (3-5 images)
    const unitImages = unit.image;

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [BookingForm, setForm] = useState({
        name: "",
        phone: "",
        id: "",
        email: "",
        date: "",
        startTime: "",
        endTime: "",
    });

    const [phoneError, setPhoneError] = useState("");
    const [timeError, setTimeError] = useState("");

    // Time options for booking
    const timeOptions = [
        "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
        "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
    ];

    // Time validation function
    const validateTimeRange = (startTime: string, endTime: string) => {
        if (startTime && endTime) {
            const start = new Date(`2000-01-01 ${startTime}`);
            const end = new Date(`2000-01-01 ${endTime}`);
            return end > start;
        }
        return true; // If either time is empty, don't show error yet
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // Filter numeric-only inputs for phone
        let filteredValue = value;
        if (name === 'phone') {
            filteredValue = value.replace(/\D/g, ''); // Remove all non-digit characters
        }
        
        const updatedForm = { ...BookingForm, [name]: filteredValue };
        setForm(updatedForm);

        // Validate time range when start or end time changes
        if (name === 'startTime' || name === 'endTime') {
            const startTime = name === 'startTime' ? value : BookingForm.startTime;
            const endTime = name === 'endTime' ? value : BookingForm.endTime;

            if (startTime && endTime) {
                if (!validateTimeRange(startTime, endTime)) {
                    setTimeError('Giờ kết thúc phải lớn hơn giờ bắt đầu');
                } else {
                    setTimeError('');
                }
            } else {
                setTimeError('');
            }
        }

        // Validate phone number in real-time
        if (name === 'phone') {
            if (filteredValue.trim() === '') {
                setPhoneError('');
            } else {
                if (filteredValue.length > 11) {
                    setPhoneError('Số điện thoại không hợp lệ, độ dài số tối đa là 11 chữ số');
                } else if (!isValidVietnamesePhone(filteredValue)) {
                    setPhoneError('Số điện thoại không hợp lệ. Vui lòng nhập số di động (03x, 05x, 07x, 08x, 09x) hoặc số cố định (02x)');
                } else {
                    setPhoneError('');
                }
            }
        }
    };

    // Vietnamese phone number validation
    const isValidVietnamesePhone = (phone: string): boolean => {
        // Remove all spaces, dashes, and other non-digit characters
        const cleanPhone = phone.replace(/\D/g, '');

        // Check mobile numbers (10-11 digits)
        // Mobile prefixes: 03, 05, 07, 08, 09
        const mobilePattern = /^(03|05|07|08|09)\d{8}$/;

        // Check landline numbers (10-11 digits)
        // Landline prefix: 02 + area code + subscriber number
        // Hanoi/HCMC: 02 + 1 digit area code + 8 digits = 11 digits
        // Other provinces: 02 + 2 digit area code + 7 digits = 11 digits
        const landlinePattern = /^02\d{8,9}$/;

        return mobilePattern.test(cleanPhone) || landlinePattern.test(cleanPhone);
    };

    // Check if all required fields are filled and valid
    const isFormValid = () => {
        return BookingForm.name.trim() !== "" &&
            BookingForm.phone.trim() !== "" &&
            isValidVietnamesePhone(BookingForm.phone) &&
            BookingForm.email.trim() !== "" &&
            BookingForm.date.trim() !== "" &&
            BookingForm.startTime.trim() !== "" &&
            BookingForm.endTime.trim() !== "" &&
            validateTimeRange(BookingForm.startTime, BookingForm.endTime) &&
            timeError === "";
    };

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
                className={`bg-white w-full ${responsive.containerMaxWidth} ${responsive.containerMaxHeight} rounded-3xl shadow-2xl overflow-hidden flex flex-col`}
            >
                {/* Header */}
                <div className="relative bg-gradient-to-r from-blue-500 to-blue-700 p-4 text-white">
                    <h3 className={`font-bold ${responsive.titleSize}`}>{unit.code}</h3>
                    <p className="text-sm">
                        Block {unit.code.slice(0, 3)} · Tầng {unit.floor}
                    </p>
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 bg-white/20 p-1.5 rounded-full hover:bg-white/30"
                    >
                        <X size={18} />
                    </button>
                </div>
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Deposit Receipt Section */}
                    <div className="px-4 pt-4 pb-0">
                        <h3 className={`font-bold ${responsive.titleSize} text-black-800`}>Booking</h3>
                    </div>
                    {/* Body */}
                    <div className="px-2 pb-3 space-y-3">
                        <div className="bg-white rounded-2xl boder p-4 shadow-sm hover:shadow-xl transition ">
                            {/* Image section */}
                            <div className={`relative ${responsive.imageContainerPadding}`}>
                                <img
                                    src={unitImages[currentImageIndex]}
                                    alt={`${unit.code} - Image ${currentImageIndex + 1}`}
                                    className={`w-full ${responsive.imageHeight} rounded-xl object-cover mb-3`}
                                />
                                <div className="absolute inset-y-0 left-0 flex items-center px-3">
                                    <button
                                        onClick={prevImage}
                                        className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-white shadow-lg transition-all"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                </div>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3">
                                    <button
                                        onClick={nextImage}
                                        className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-white shadow-lg transition-all"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                                {/* Image indicators */}
                                <div className="absolute bottom-7 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                    {unitImages.map((_: string, index: number) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`w-3 h-3 rounded-full transition-all border-2 ${index === currentImageIndex
                                                ? 'bg-white border-orange-500 shadow-lg'
                                                : 'bg-white/70 border-white/50 hover:bg-white/90'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="p-1">
                                <p className="text-xs">Dự án:</p>
                                <p className="text-lg font-bold">{unit.project}</p>
                            </div>
                            <div className="p-1">
                                <p className="text-xs">Căn hộ:</p>
                                <p className="text-lg font-bold"> {unit.code} (block {unit.code.slice(0, 3)} - tầng {unit.floor})</p>
                            </div>
                            <div className="p-1">
                                <p className="text-xs">Giá căn hộ:</p>
                                <p className="text-lg font-bold">{formatCurrency(unit.price, { style: 'standard', locale: 'en-US' })}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-0">
                                <div className="bg-white p-1 text-center">
                                    <p className="text-xs text-gray-500">Phòng ngủ</p>
                                    <p className="font-semibold text-lg text-black-500">{unit.numRoom}</p>
                                </div>
                                <div className="bg-white p-1 text-center">
                                    <p className="text-xs text-gray-500">Phòng tắm</p>
                                    <p className="font-semibold text-lg text-black-500">{unit.numWC}</p>
                                </div>
                                <div className="bg-white p-1 text-center">
                                    <p className="text-xs text-gray-500">Diện tích</p>
                                    <p className="font-semibold text-lg text-black-500">{unit.area}</p>
                                </div>
                                <div className="bg-white p-1 text-center">
                                    <p className="text-xs text-gray-500">Hướng</p>
                                    <p className="font-semibold text-lg text-black-500">{unit.direction}</p>
                                </div>
                            </div>
                            <div className="bg-white p-2 text-center">
                                <p className="text-xs text-gray-500">Tầm nhìn</p>
                                <p className="font-semibold text-blue-600">{unit.view}</p>
                            </div>
                            <div className="py-2">
                                <p className="text-lg font-semibold">Thông tin căn hộ</p>
                                <p className="text-sm opacity-80 py-2">{unit.information}</p>
                            </div>
                            <div className="bg-white py-2">
                                <p className="text-lg font-semibold">Chứng từ</p>
                                <div className="flex items-center gap-2 mb-2 text-center justify-center">
                                    {!unit.legalDocument ? (
                                        <BadgeAlert className="text-orange-500 w-7 h-7 flex-shrink-0" />
                                    ) : null}
                                </div>
                                <p className="text-sm opacity-80 text-center">
                                    {unit.legalDocument || "Căn hộ này chưa có thông tin chứng từ"}
                                </p>
                            </div>
                            {/* Customer Info */}
                            <div>
                                {/* Divider */}
                                <div className="relative my-3">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-100"></div>
                                    </div>
                                    <div className="relative flex justify-center">
                                    </div>
                                </div>
                                <h4 className="text-base font-semibold text-gray-800 mb-2">
                                    Thông tin khách hàng
                                </h4>
                                <div className="space-y-3 text-sm">
                                    {/* Name Input */}
                                    <div>
                                        <label className="text-gray-700">Họ và tên <span className="text-red-500">*</span></label>
                                        <Input
                                            type="text"
                                            name="name"
                                            value={BookingForm.name}
                                            onChange={handleChange}
                                            placeholder="Nhập họ và tên"
                                            className="w-full mt-1 border rounded-lg p-2.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-yellow-700"
                                            required
                                        />
                                    </div>
                                    {/* Phone number Input */}
                                    <div>
                                        <label className="text-gray-700">Số điện thoại <span className="text-red-500">*</span></label>
                                        <Input
                                            type="tel"
                                            name="phone"
                                            value={BookingForm.phone}
                                            onChange={handleChange}
                                            placeholder="Nhập số điện thoại (VD: 0901234567)"
                                            className={`w-full mt-1 border rounded-lg p-2.5 text-gray-700 focus:outline-none focus:ring-1 ${phoneError ? 'border-red-500 focus:ring-red-500' : 'focus:ring-yellow-700'}`}
                                            required
                                        />
                                        {phoneError && (
                                            <p className="text-red-500 text-xs mt-1">{phoneError}</p>
                                        )}
                                    </div>
                                    {/* Email Input */}
                                    <div>
                                        <label className="text-gray-700">Email <span className="text-red-500">*</span></label>
                                        <Input
                                            type="email"
                                            name="email"
                                            value={BookingForm.email}
                                            onChange={handleChange}
                                            placeholder="Nhập email"
                                            className="w-full mt-1 border rounded-lg p-2.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-yellow-700"
                                            required
                                        />
                                    </div>
                                    {/* Date Input */}
                                    <div>
                                        <label className="text-gray-700 flex items-center gap-1">
                                            Ngày xem nhà <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="date"
                                            name="date"
                                            value={BookingForm.date}
                                            onChange={handleChange}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full mt-1 border rounded-lg p-2.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                            required
                                        />
                                    </div>
                                    {/* Time inputs */}
                                    <div className="grid grid-cols-2 gap-3 mt-3">
                                        <div>
                                            <label className="text-gray-700">Giờ bắt đầu <span className="text-red-500">*</span></label>
                                            <select
                                                name="startTime"
                                                value={BookingForm.startTime}
                                                onChange={handleChange}
                                                className="w-full mt-1 border rounded-lg p-2.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-yellow-700"
                                            >
                                                <option value="">Chọn giờ</option>
                                                {timeOptions.map((time) => (
                                                    <option key={time} value={time}>
                                                        {time}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-gray-700">Giờ kết thúc <span className="text-red-500">*</span></label>
                                            <select
                                                name="endTime"
                                                value={BookingForm.endTime}
                                                onChange={handleChange}
                                                className={`w-full mt-1 border rounded-lg p-2.5 text-gray-700 focus:outline-none focus:ring-1 ${timeError ? 'border-red-500 focus:ring-red-500' : 'focus:ring-yellow-700'}`}
                                            >
                                                <option value="">Chọn giờ</option>
                                                {timeOptions.map((time) => (
                                                    <option key={time} value={time}>
                                                        {time}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    {/* Time validation error */}
                                    {timeError && (
                                        <p className="text-red-500 text-xs mt-2">{timeError}</p>
                                    )}
                                </div>
                            </div>
                            {/* Submit Button */}
                            <div className="mt-6">
                                <Button
                                    disabled={!isFormValid()}
                                    onClick={() => {
                                        toastNotification.success("Booking đã được xác nhận thành công!");
                                        onClose();
                                    }}
                                    className={`w-full py-3.5 rounded-xl font-semibold text-white text-base transition ${isFormValid()
                                        ? "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-600"
                                        : "bg-gray-300 cursor-not-allowed"
                                        }`}
                                >
                                    Xác nhận
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
