/**
 * Admin Dashboard Page - Full shadcn/ui + lucide-react
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsApi } from '../api/projects.api';
import LoadingState from '../components/ui/LoadingState';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { PageHeader } from '../components/ui/PageHeader';
import { 
  Building2, 
  Clock, 
  CheckCircle, 
  Home, 
  Plus, 
  FileCheck, 
  CircleDollarSign,
  ChevronRight 
} from 'lucide-react';

interface DashboardStats {
  totalProjects: number;
  upcomingProjects: number;
  openProjects: number;
  totalUnits: number;
  availableUnits: number;
  depositedUnits: number;
  soldUnits: number;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    upcomingProjects: 0,
    openProjects: 0,
    totalUnits: 0,
    availableUnits: 0,
    depositedUnits: 0,
    soldUnits: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load projects
      const projects = await projectsApi.getAll();
      setRecentProjects(projects.slice(0, 5));

      // Calculate stats
      const upcoming = projects.filter(p => p.status === 'UPCOMING').length;
      const open = projects.filter(p => p.status === 'OPEN').length;

      setStats({
        totalProjects: projects.length,
        upcomingProjects: upcoming,
        openProjects: open,
        totalUnits: 0, // TODO: Get from API
        availableUnits: 0,
        depositedUnits: 0,
        soldUnits: 0,
      });
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Đang tải dashboard..." />;
  }

  const statCards = [
    {
      title: 'Tổng Dự Án',
      value: stats.totalProjects,
      icon: Building2,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      valueColor: 'text-gray-900',
    },
    {
      title: 'Sắp Mở Bán',
      value: stats.upcomingProjects,
      icon: Clock,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      valueColor: 'text-yellow-600',
    },
    {
      title: 'Đang Mở Bán',
      value: stats.openProjects,
      icon: CheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      valueColor: 'text-green-600',
    },
    {
      title: 'Tổng Căn',
      value: stats.totalUnits,
      icon: Home,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      valueColor: 'text-gray-900',
    },
  ];

  const quickActions = [
    {
      title: 'Tạo mới',
      subtitle: 'Dự Án',
      icon: Plus,
      gradient: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      onClick: () => navigate('/projects/create'),
    },
    {
      title: 'Duyệt',
      subtitle: 'Bookings',
      icon: FileCheck,
      gradient: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
      onClick: () => navigate('/bookings'),
    },
    {
      title: 'Duyệt',
      subtitle: 'Cọc',
      icon: CircleDollarSign,
      gradient: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      onClick: () => navigate('/deposits'),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader 
        title="Dashboard" 
        description="Tổng quan hệ thống"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className={`text-3xl font-bold mt-2 ${stat.valueColor}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.iconBg} p-3 rounded-lg`}>
                  <stat.icon className={`w-8 h-8 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <Card 
            key={index}
            className={`p-6 bg-gradient-to-br ${action.gradient} text-white cursor-pointer shadow-lg transition transform hover:scale-105`}
            onClick={action.onClick}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-sm opacity-90">{action.title}</p>
                <p className="text-xl font-bold mt-1">{action.subtitle}</p>
              </div>
              <action.icon className="w-12 h-12 opacity-75" />
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Dự Án Gần Đây</CardTitle>
        </CardHeader>
        <CardContent>
          {recentProjects.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Chưa có dự án nào</p>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-600">{project.code} • {project.city}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={
                      project.status === 'UPCOMING' ? 'secondary' :
                      project.status === 'OPEN' ? 'default' :
                      'outline'
                    }>
                      {project.status}
                    </Badge>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
