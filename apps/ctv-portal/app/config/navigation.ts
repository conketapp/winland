import { Home, ShoppingCart, Map, TrendingUp, Bell, User } from 'lucide-react';

export interface NavItem {
    id: string;
    label: string;
    icon: any;
    path: string;
    badge?: number;
    disabled?: boolean;
}

export const navigationItems: NavItem[] = [
    { id: "home", label: "Trang chủ", icon: Home, path: "/dashboard" },
    { id: "cart", label: "Giỏ hàng", icon: ShoppingCart, path: "/project-management" },
    { id: "planning", label: "Quy hoạch", icon: Map, path: "/planning-area" },
    { id: "deal", label: "Giao dịch", icon: TrendingUp, path: "/my-transactions" },
    { id: "notify", label: "Thông báo", icon: Bell, path: "/notification" },
    { id: "profile", label: "Cá nhân", icon: User, path: "/profile" },
];