import { Link, useLocation } from "wouter";
import { Brain, Home, Mic, Trophy, Users, BarChart3, User, Settings, LogOut, Flame } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const { data: profileData } = useQuery({
    queryKey: ['/api/user/profile'],
    enabled: !!user,
  });

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard', section: 'MAIN' },
    { path: '/explanation-center', icon: Mic, label: 'Explanation Center', section: 'MAIN' },
    { path: '/leaderboard', icon: Trophy, label: 'Leaderboard', section: 'MAIN' },
    { path: '/peer-gallery', icon: Users, label: 'Peer Gallery', section: 'MAIN' },
    { path: '/reports', icon: BarChart3, label: 'Reports', section: 'MAIN' },
    { path: '/profile', icon: User, label: 'Profile', section: 'ACCOUNT' },
    { path: '/settings', icon: Settings, label: 'Settings', section: 'ACCOUNT' },
  ];

  const sections = navItems.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  return (
    <div className="w-64 bg-white shadow-lg fixed h-full z-40">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 gradient-blue-purple rounded-lg flex items-center justify-center">
            <Brain className="text-white" size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-900">IntelliLearn</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-8">
        {Object.entries(sections).map(([sectionName, items]) => (
          <div key={sectionName}>
            <div className="px-6 mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {sectionName}
              </p>
            </div>
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path || (item.path === '/dashboard' && location === '/');
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors",
                    isActive && "bg-blue-50 border-r-4 border-brand-blue text-brand-blue"
                  )}
                >
                  <Icon size={20} className="mr-3" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}

        {/* Logout */}
        <div className="px-6 mt-8">
          <button
            onClick={logout}
            className="flex items-center w-full px-0 py-3 text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </nav>

      {/* User Stats Card */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="gradient-blue-purple rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Total XP</span>
            <span className="text-lg font-bold">{profileData?.user?.totalXP || 0}</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all" 
              style={{ 
                width: `${Math.min(100, ((profileData?.user?.totalXP || 0) % 1000) / 10)}%` 
              }}
            ></div>
          </div>
          <p className="text-xs mt-1 opacity-90">
            {1000 - ((profileData?.user?.totalXP || 0) % 1000)} XP to next level
          </p>
        </div>
      </div>
    </div>
  );
}
