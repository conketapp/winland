/**
 * Dashboard Layout with shadcn/ui Sidebar
 */

import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '../components/ui/sidebar';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { fetchMyNotifications, markAllNotificationsAsRead, Notification as NotificationType } from '../api/notifications.api';

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleLogout = () => {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      logout();
      navigate('/login');
    }
  };

  const loadNotifications = async () => {
    try {
      setIsLoadingNotifications(true);
      const data = await fetchMyNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const handleOpenNotifications = async () => {
    if (!isNotificationOpen) {
      await loadNotifications();
    }
    setIsNotificationOpen((prev) => !prev);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
    } catch (error) {
      console.error('Failed to mark notifications as read', error);
    }
  };

  useEffect(() => {
    // Prefetch notifications on mount (non-blocking)
    loadNotifications().catch(() => undefined);
  }, []);

  const menuSections = [
    {
      label: 'Tổng quan',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          ),
        },
      ],
    },
    {
      label: 'Dự án & Sản phẩm',
      items: [
        {
          title: 'Dự Án',
          url: '/projects',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          ),
        },
        {
          title: 'Căn Hộ',
          url: '/units',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7H4V5zM4 13h6v7H5a1 1 0 01-1-1v-6zM14 5a1 1 0 011-1h4a1 1 0 011 1v7h-6V5zM14 13h6v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z"
              />
            </svg>
          ),
        },
      ],
    },
    {
      label: 'Giữ chỗ & Booking',
      items: [
        {
          title: 'Giữ chỗ',
          url: '/reservations',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        },
        {
          title: 'Duyệt Bookings',
          url: '/bookings',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          ),
          badge: { text: 'Mới', variant: 'destructive' as const },
        },
      ],
    },
    {
      label: 'Cọc & Thanh toán',
      items: [
        {
          title: 'Duyệt Cọc',
          url: '/deposits',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          badge: { text: 'Quan trọng', variant: 'destructive' as const },
        },
        {
          title: 'Giao dịch',
          url: '/transactions',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          ),
        },
        {
          title: 'Giải phóng Căn hộ',
          url: '/cleanup',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          ),
        },
      ],
    },
    {
      label: 'Hoa hồng & CTV',
      items: [
        {
          title: 'Rút hoa hồng',
          url: '/payment-requests',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          ),
        },
        {
          title: 'Users',
          url: '/users',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ),
        },
      ],
    },
    {
      label: 'Hệ thống',
      items: [
        {
          title: 'Cấu hình',
          url: '/system-config',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          ),
        },
        {
          title: 'Nhật ký hệ thống',
          url: '/audit-logs',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-6a2 2 0 012-2h8m-4-4h4v4"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h2m-2 4h2m-2 4h2m4 4H7a2 2 0 01-2-2V5a2 2 0 012-2h8l4 4v10a2 2 0 01-2 2h-4"
              />
            </svg>
          ),
        },
      ],
    },
  ];

  const isActive = (url: string) => {
    if (url === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(url);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          {/* Logo & Trigger */}
          <SidebarHeader>
            <div className="flex items-center justify-between px-2 py-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">BĐS</span>
                </div>
                <span className="font-bold text-gray-900">Admin</span>
              </div>
              <SidebarTrigger />
            </div>
            <Separator />
          </SidebarHeader>

          {/* Navigation Menu */}
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                {menuSections.map((section) => (
                  <div key={section.label} className="mb-1">
                    <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
                    <SidebarMenu>
                      {section.items.map((item) => (
                        <SidebarMenuItem key={item.url}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive(item.url)}
                            tooltip={item.title}
                          >
                            <a
                              href={item.url}
                              onClick={(e) => {
                                e.preventDefault();
                                navigate(item.url);
                              }}
                            >
                              {item.icon}
                              <span>{item.title}</span>
                              {item.badge && (
                                <Badge variant={item.badge.variant} className="ml-auto">
                                  {item.badge.text}
                                </Badge>
                              )}
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </div>
                ))}
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* User Info & Logout */}
          <SidebarFooter>
            <Separator />
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold shrink-0">
                  {user?.fullName?.charAt(0) || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.fullName || 'Admin User'}
                  </p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full"
                size="sm"
              >
                Đăng xuất
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          {/* Top bar with trigger */}
          <div className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-white px-6">
            <SidebarTrigger />
            <div className="flex-1" />
            {/* Notification bell */}
            <div className="relative">
              <button
                type="button"
                onClick={handleOpenNotifications}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-100"
              >
                <span className="sr-only">Thông báo</span>
                <svg
                  className="h-5 w-5 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-semibold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-96 max-h-[480px] overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Thông báo</p>
                      <p className="text-xs text-gray-500">
                        {unreadCount > 0
                          ? `${unreadCount} thông báo chưa đọc`
                          : 'Tất cả thông báo đã đọc'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      disabled={unreadCount === 0}
                      className="text-xs font-medium text-blue-600 disabled:text-gray-400"
                    >
                      Đánh dấu đã đọc
                    </button>
                  </div>

                  <div className="max-h-[420px] overflow-y-auto">
                    {isLoadingNotifications ? (
                      <div className="flex items-center justify-center py-8 text-sm text-gray-500">
                        Đang tải thông báo...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="flex items-center justify-center py-8 text-sm text-gray-500">
                        Không có thông báo nào
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`px-4 py-3 border-b last:border-b-0 ${
                            n.isRead ? 'bg-white' : 'bg-blue-50'
                          }`}
                        >
                          <p className="text-xs text-gray-400 mb-1">
                            {new Date(n.createdAt).toLocaleString('vi-VN')}
                          </p>
                          <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                          <p className="text-sm text-gray-700">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
