import { useQuery } from "@tanstack/react-query";
import { Plus, Mic, Video, Pen, Medal, Flame, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function QuickActions() {
  const [, setLocation] = useLocation();

  const { data: badges } = useQuery({
    queryKey: ['/api/user/badges'],
  });

  const { data: profileData } = useQuery({
    queryKey: ['/api/user/profile'],
  });

  const latestBadges = badges?.slice(0, 3) || [];
  const user = profileData?.user;

  const weeklyProgress = 70; // This would come from API
  const weeklyGoal = 10;
  const completed = Math.floor((weeklyProgress / 100) * weeklyGoal);

  return (
    <div className="space-y-6">
      {/* Quick Explain */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Explain</h3>
        <p className="text-sm text-gray-600 mb-4">Start explaining a topic right now and earn XP!</p>
        
        <Button 
          onClick={() => setLocation('/explanation-center')}
          className="w-full gradient-blue-purple border-0 hover:opacity-90 mb-3"
        >
          <Plus size={16} className="mr-2" />
          New Explanation
        </Button>
        
        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={() => setLocation('/explanation-center')}
            className="p-3 bg-emerald-50 text-brand-emerald rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <Mic size={20} />
          </button>
          <button 
            onClick={() => setLocation('/explanation-center')}
            className="p-3 bg-blue-50 text-brand-blue rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Video size={20} />
          </button>
          <button 
            onClick={() => setLocation('/explanation-center')}
            className="p-3 bg-purple-50 text-brand-purple rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Pen size={20} />
          </button>
        </div>
      </div>

      {/* Achievement Showcase */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Achievements</h3>
        
        {latestBadges.length > 0 ? (
          <div className="space-y-3">
            {latestBadges.map((userBadge: any) => (
              <div 
                key={userBadge.id} 
                className={`flex items-center space-x-3 p-3 gradient-${userBadge.badge.color || 'amber'}-yellow rounded-lg text-white`}
              >
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Medal size={20} />
                </div>
                <div>
                  <p className="font-medium">{userBadge.badge.name}</p>
                  <p className="text-sm opacity-90">{userBadge.badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <Medal className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-500 text-sm">No badges earned yet. Start explaining to unlock achievements!</p>
          </div>
        )}
      </div>

      {/* Weekly Goal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Goal</h3>
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 relative">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path 
                className="text-gray-200" 
                stroke="currentColor" 
                strokeWidth="3" 
                fill="transparent" 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path 
                className="text-brand-blue" 
                stroke="currentColor" 
                strokeWidth="3" 
                fill="transparent" 
                strokeDasharray={`${weeklyProgress}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-gray-900">{weeklyProgress}%</span>
            </div>
          </div>
          <p className="font-medium text-gray-900">{completed}/{weeklyGoal} explanations</p>
          <p className="text-sm text-gray-600">{weeklyGoal - completed} more to reach your goal!</p>
        </div>
      </div>
    </div>
  );
}
