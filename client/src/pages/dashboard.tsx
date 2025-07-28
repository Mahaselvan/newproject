import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Bell, Flame } from "lucide-react";
import StatsOverview from "@/components/dashboard/stats-overview";
import RecentActivity from "@/components/dashboard/recent-activity";
import QuickActions from "@/components/dashboard/quick-actions";
import TopicRecommendations from "@/components/dashboard/topic-recommendations";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: profileData } = useQuery({
    queryKey: ['/api/user/profile'],
    enabled: !!user,
  });

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-600">
              Welcome back, <span className="font-medium">{user?.firstName}</span>! Ready to teach and learn?
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Streak Counter */}
            <div className="flex items-center space-x-2 bg-amber-50 px-3 py-2 rounded-lg">
              <Flame className="text-brand-amber" size={16} />
              <span className="font-semibold text-brand-amber">{user?.streak || 0}</span>
              <span className="text-sm text-gray-600">day streak</span>
            </div>
            
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            {/* Profile Avatar */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center text-white font-medium">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  Level {user?.level || 1} Explorer
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="p-8">
        <StatsOverview />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>

        <TopicRecommendations />
      </main>
    </>
  );
}
