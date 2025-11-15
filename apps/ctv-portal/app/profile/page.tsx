/**
 * 🔑 PROFILE PAGE (CTV Portal)
 *
 * @author Winland Team
 * @route /profile
 * @features User Profile Management, Avatar Upload, Editable Fields
 * @date 28-10-2025
 */

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import {
    LogOut,
    Sun,
    Moon,
    User,
    Mail,
    Phone,
    Edit2,
    Save,
    X,
    Camera,
    Loader2,
    MapPin,
    Users,
    Calendar,
    Briefcase,
    Hash,
    Building2,
    CheckCircle2
} from "lucide-react";
import { AnimatedBottomNavigation } from '@/components/AnimatedBottomNavigation';
import { useNavigation } from '@/hooks/useNavigation';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ToastContainer } from 'react-toastify';
import { toastNotification } from '@/app/utils/toastNotification';

interface UserProfile {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    avatar: string | null;
    gender: string | null;
    address: string | null;
    birthday: string | null;
    cifNumber: string | null;
    sector: string | null;
    workingPlace: string | null;
    role: string;
    isActive: boolean;
    totalDeals: number;
    createdAt: string;
}

export default function ProfilePage(): JSX.Element {
    const router = useRouter();
    const { activeNav, setActiveNav } = useNavigation();
    const { isDark, toggleTheme } = useTheme();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
    const [actualTotalDeals, setActualTotalDeals] = useState<number>(0);

    useEffect(() => {
        const userPhone = sessionStorage.getItem('login:userPhone');
        if (!userPhone) {
            router.push('/login');
            return;
        }
        fetchProfile();
    }, [router]);

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const userPhone = sessionStorage.getItem('login:userPhone');

            if (!userPhone) {
                router.push('/login');
                return;
            }

            const [userRes, reservationsRes, bookingsRes, depositsRes] = await Promise.all([
                fetch('/api/user/me', { headers: { 'x-user-phone': userPhone } }),
                fetch('/api/reservations', { headers: { 'x-user-phone': userPhone } }),
                fetch('/api/bookings', { headers: { 'x-user-phone': userPhone } }),
                fetch('/api/deposits', { headers: { 'x-user-phone': userPhone } })
            ]);

            if (userRes.ok) {
                const data = await userRes.json();
                setProfile(data);
                setEditedProfile(data);

                // Calculate actual total deals from transactions
                const reservations = reservationsRes.ok ? await reservationsRes.json() : [];
                const bookings = bookingsRes.ok ? await bookingsRes.json() : [];
                const deposits = depositsRes.ok ? await depositsRes.json() : [];

                const totalDeals =
                    reservations.filter((r: any) => r.status === 'ACTIVE').length +
                    bookings.filter((b: any) => b.status !== 'CANCELLED').length +
                    deposits.filter((d: any) => d.status !== 'CANCELLED').length;

                setActualTotalDeals(totalDeals);
            } else {
                const errorData = await userRes.json();
                console.error('Failed to fetch profile:', errorData);
                toastNotification.error('Không thể tải thông tin hồ sơ!');
                if (userRes.status === 401 || userRes.status === 404) {
                    router.push('/login');
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toastNotification.error('Đã xảy ra lỗi khi tải thông tin!');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const userPhone = sessionStorage.getItem('login:userPhone');

            // Debug logging (only in development)
            if (process.env.NODE_ENV === 'development') {
                console.group('🔄 Profile Update Request');
                console.log('User Phone:', userPhone);
                console.log('Updated Fields:', {
                    fullName: editedProfile.fullName,
                    email: editedProfile.email,
                    gender: editedProfile.gender,
                    address: editedProfile.address,
                    birthday: editedProfile.birthday,
                    avatar: editedProfile.avatar ? `${editedProfile.avatar.substring(0, 50)}...` : null,
                });
                console.log('Timestamp:', new Date().toISOString());
                console.groupEnd();
            }

            const response = await fetch('/api/user/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-phone': userPhone || '',
                },
                body: JSON.stringify(editedProfile),
            });

            if (response.ok) {
                const updatedProfile = await response.json();

                // Debug logging (only in development)
                if (process.env.NODE_ENV === 'development') {
                    console.group('✅ Profile Update Success');
                    console.log('Updated Profile:', {
                        id: updatedProfile.id,
                        fullName: updatedProfile.fullName,
                        email: updatedProfile.email,
                        phone: updatedProfile.phone,
                        gender: updatedProfile.gender,
                        address: updatedProfile.address,
                        birthday: updatedProfile.birthday,
                        role: updatedProfile.role,
                        totalDeals: updatedProfile.totalDeals,
                    });
                    console.log('Response Time:', new Date().toISOString());
                    console.groupEnd();
                }

                setProfile(updatedProfile);
                setIsEditing(false);
                toastNotification.success('Cập nhật thông tin thành công!');
            } else {
                const errorData = await response.json();
                console.error('Failed to update profile:', errorData);
                toastNotification.error(errorData.error || 'Cập nhật thông tin thất bại!');

                if (process.env.NODE_ENV === 'development') {
                    console.group('❌ Profile Update Failed');
                    console.error('Status:', response.status);
                    console.error('Error:', errorData);
                    console.groupEnd();
                }
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toastNotification.error('Đã xảy ra lỗi khi cập nhật thông tin!');

            if (process.env.NODE_ENV === 'development') {
                console.group('❌ Profile Update Error');
                console.error('Error Details:', error);
                console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
                console.groupEnd();
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditedProfile(profile || {});
        setIsEditing(false);
    };

    const handleLogout = () => {
        sessionStorage.removeItem("login:userPhone");
        router.push("/login");
    };

    // Set greeting on client side only to avoid hydration mismatch
    const [greeting, setGreeting] = useState<string>("Chào buổi");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) {
            setGreeting("Chào buổi sáng");
        } else if (hour < 18) {
            setGreeting("Chào buổi chiều");
        } else {
            setGreeting("Chào buổi tối");
        }
    }, []);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditedProfile({ ...editedProfile, avatar: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div
            className={`min-h-screen flex flex-col transition-colors duration-500 ${isDark ? "bg-[#0C1125] text-white" : "bg-gray-50 text-slate-900"
                }`}
        >
            {/* Header */}
            <header
                className={`rounded-b-3xl shadow-md ${isDark ? "bg-[#10182F]" : "bg-[#041b40] text-white"
                    }`}
            >
                <div className="max-w-[1500px] mx-auto px-6 py-6 flex items-center justify-between">
                    <div className="flex items-center">
                        <h1 className="text-xl font-semibold">Cộng Tác Viên Bất Động Sản Winland</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="flex items-center gap-2 px-4 py-2 rounded-md border border-white/10 hover:bg-white/10 transition"
                        >
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-md border border-white/10 hover:bg-white/10 transition"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 w-full max-w-[1500px] mx-auto px-6 py-8">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                ) : profile ? (
                    <>
                        {/* Greeting Card */}
                        <div className={`rounded-3xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 mb-6 ${isDark ? "bg-[#1B2342]" : "bg-white"}`}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#C6A052]/80 to-[#C6A052]/50 flex items-center justify-center">
                                    <User className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm opacity-70 mb-1">{greeting}</p>
                                    <p className="text-lg font-semibold">Hồ Sơ Cá Nhân</p>
                                    <p className="text-sm opacity-80">Đây là trang thông tin cá nhân của bạn</p>
                                    <p className="text-sm opacity-80 text-green-500 mt-1">Chúc bạn kiếm được thật nhiều lợi nhuận</p>
                                </div>
                            </div>
                        </div>

                        {/* Profile Card */}
                        <div className={`rounded-2xl shadow-lg p-8 ${isDark ? 'bg-[#10182F]' : 'bg-white'}`}>
                            {/* Avatar Section */}
                            <div className="flex flex-col items-center mb-8">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative">
                                        {(isEditing ? editedProfile.avatar : profile.avatar) ? (
                                            <Image
                                                src={(isEditing ? editedProfile.avatar : profile.avatar) || ''}
                                                alt="Avatar"
                                                fill
                                                className="object-cover"
                                                sizes="128px"
                                            />
                                        ) : (
                                            <User className="w-16 h-16 text-white" />
                                        )}
                                    </div>
                                    {isEditing && (
                                        <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition">
                                            <Camera className="w-5 h-5 text-white" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleAvatarChange}
                                            />
                                        </label>
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold mt-4">{profile.fullName}</h2>
                                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                    {profile.role === 'CTV' ? 'Cộng Tác Viên' : profile.role}
                                </p>
                            </div>

                            {/* Edit Button */}
                            <div className="flex justify-end mb-6">
                                {!isEditing ? (
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Chỉnh sửa
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                        >
                                            {isSaving ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Save className="w-4 h-4" />
                                            )}
                                            Lưu
                                        </Button>
                                        <Button
                                            onClick={handleCancel}
                                            variant="outline"
                                            className="flex items-center gap-2"
                                        >
                                            <X className="w-4 h-4" />
                                            Hủy
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Profile Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Full Name */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                        <User className="w-4 h-4 inline mr-2" />
                                        Họ và tên
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedProfile.fullName || ''}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, fullName: e.target.value })}
                                            className={`w-full px-4 py-2 rounded-lg border ${isDark
                                                ? 'bg-[#0C1125] border-slate-700 text-white'
                                                : 'bg-white border-slate-300 text-slate-900'
                                                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        />
                                    ) : (
                                        <p className={`px-4 py-2 rounded-lg ${isDark ? 'bg-[#0C1125]' : 'bg-gray-50'}`}>
                                            {profile.fullName}
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                        <Mail className="w-4 h-4 inline mr-2" />
                                        Email
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={editedProfile.email || ''}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                                            className={`w-full px-4 py-2 rounded-lg border ${isDark
                                                ? 'bg-[#0C1125] border-slate-700 text-white'
                                                : 'bg-white border-slate-300 text-slate-900'
                                                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        />
                                    ) : (
                                        <p className={`px-4 py-2 rounded-lg ${isDark ? 'bg-[#0C1125]' : 'bg-gray-50'}`}>
                                            {profile.email || 'Chưa cập nhật'}
                                        </p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                        <Phone className="w-4 h-4 inline mr-2" />
                                        Số điện thoại
                                    </label>
                                    <p className={`px-4 py-2 rounded-lg ${isDark ? 'bg-[#0C1125]' : 'bg-gray-50'}`}>
                                        {profile.phone || 'Chưa cập nhật'}
                                    </p>
                                </div>

                                {/* Gender */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                        <Users className="w-4 h-4 inline mr-2" />
                                        Giới tính
                                    </label>
                                    {isEditing ? (
                                        <select
                                            value={editedProfile.gender || ''}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, gender: e.target.value })}
                                            className={`w-full px-4 py-2 rounded-lg border ${isDark
                                                ? 'bg-[#0C1125] border-slate-700 text-white'
                                                : 'bg-white border-slate-300 text-slate-900'
                                                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        >
                                            <option value="">Chọn giới tính</option>
                                            <option value="Nam">Nam</option>
                                            <option value="Nữ">Nữ</option>
                                            <option value="Khác">Khác</option>
                                        </select>
                                    ) : (
                                        <p className={`px-4 py-2 rounded-lg ${isDark ? 'bg-[#0C1125]' : 'bg-gray-50'}`}>
                                            {profile.gender || 'Chưa cập nhật'}
                                        </p>
                                    )}
                                </div>

                                {/* Birthday */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                        <Calendar className="w-4 h-4 inline mr-2" />
                                        Ngày sinh
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            value={editedProfile.birthday ? new Date(editedProfile.birthday).toISOString().split('T')[0] : ''}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, birthday: e.target.value })}
                                            className={`w-full px-4 py-2 rounded-lg border ${isDark
                                                ? 'bg-[#0C1125] border-slate-700 text-white'
                                                : 'bg-white border-slate-300 text-slate-900'
                                                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        />
                                    ) : (
                                        <p className={`px-4 py-2 rounded-lg ${isDark ? 'bg-[#0C1125]' : 'bg-gray-50'}`}>
                                            {profile.birthday ? new Date(profile.birthday).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                                        </p>
                                    )}
                                </div>

                                {/* Address */}
                                <div className="md:col-span-2">
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                        <MapPin className="w-4 h-4 inline mr-2" />
                                        Địa chỉ
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            value={editedProfile.address || ''}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                                            rows={3}
                                            className={`w-full px-4 py-2 rounded-lg border ${isDark
                                                ? 'bg-[#0C1125] border-slate-700 text-white'
                                                : 'bg-white border-slate-300 text-slate-900'
                                                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            placeholder="Nhập địa chỉ của bạn"
                                        />
                                    ) : (
                                        <p className={`px-4 py-2 rounded-lg ${isDark ? 'bg-[#0C1125]' : 'bg-gray-50'}`}>
                                            {profile.address || 'Chưa cập nhật'}
                                        </p>
                                    )}
                                </div>

                                {/* Status (Read-only, from isActive) */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                        <CheckCircle2 className="w-4 h-4 inline mr-2" />
                                        Trạng thái
                                    </label>
                                    <p className={`px-4 py-2 rounded-lg flex items-center gap-2 ${isDark ? 'bg-[#0C1125]' : 'bg-gray-50'}`}>
                                        <span className={`w-2 h-2 rounded-full ${profile.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                        <span className={profile.isActive ? 'text-green-600' : 'text-red-600'}>
                                            {profile.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                                        </span>
                                    </p>
                                </div>

                                {/* CIF Number (Read-only) */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                        <Hash className="w-4 h-4 inline mr-2" />
                                        Mã CIF
                                    </label>
                                    <p className={`px-4 py-2 rounded-lg ${isDark ? 'bg-[#0C1125]' : 'bg-gray-50'} font-mono`}>
                                        {profile.cifNumber || 'Chưa có'}
                                    </p>
                                </div>

                                {/* Sector (Read-only, auto-set based on role) */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                        <Briefcase className="w-4 h-4 inline mr-2" />
                                        Bộ phận
                                    </label>
                                    <p className={`px-4 py-2 rounded-lg ${isDark ? 'bg-[#0C1125]' : 'bg-gray-50'}`}>
                                        {profile.sector || 'Chưa cập nhật'}
                                    </p>
                                </div>

                                {/* Working Place */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                        <Building2 className="w-4 h-4 inline mr-2" />
                                        Nơi làm việc
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedProfile.workingPlace || ''}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, workingPlace: e.target.value })}
                                            className={`w-full px-4 py-2 rounded-lg border ${isDark
                                                ? 'bg-[#0C1125] border-slate-700 text-white'
                                                : 'bg-white border-slate-300 text-slate-900'
                                                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            placeholder="Nhập nơi làm việc"
                                        />
                                    ) : (
                                        <p className={`px-4 py-2 rounded-lg ${isDark ? 'bg-[#0C1125]' : 'bg-gray-50'}`}>
                                            {profile.workingPlace || 'Chưa cập nhật'}
                                        </p>
                                    )}
                                </div>

                                {/* Start Working Day (Read-only, from createdAt) */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                        <Calendar className="w-4 h-4 inline mr-2" />
                                        Ngày bắt đầu làm việc
                                    </label>
                                    <p className={`px-4 py-2 rounded-lg ${isDark ? 'bg-[#0C1125]' : 'bg-gray-50'}`}>
                                        {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : 'Chưa có'}
                                    </p>
                                </div>

                                {/* Total Deals */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                        Tổng số giao dịch
                                    </label>
                                    <p className={`px-4 py-2 rounded-lg ${isDark ? 'bg-[#0C1125]' : 'bg-gray-50'} font-semibold text-blue-600`}>
                                        {actualTotalDeals}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12">
                        <p>Không thể tải thông tin hồ sơ</p>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer
                className={`text-center text-sm py-4 ${isDark ? "bg-[#10182F] text-slate-400" : "bg-white text-slate-500 border-t"
                    }`}
            >
                © 2025 <span className="font-semibold">Bất Động Sản Winland</span>. Tất cả quyền được bảo lưu.
            </footer>

            {/* Bottom navigation */}
            <AnimatedBottomNavigation
                activeNav={activeNav}
                setActiveNav={setActiveNav}
                darkMode={isDark}
            />

            {/* Toast Notifications */}
            <ToastContainer />
        </div>
    );
}
