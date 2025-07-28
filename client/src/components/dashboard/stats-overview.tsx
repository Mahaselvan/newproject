import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Star, Trophy, Medal } from "lucide-react";

export default function StatsOverview() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/user/stats'],
  });

  const statItems = [
    {
      title: "Explanations Given",
      value: stats?.explanationsCount || 0,
      change: "+12 this week",
      icon: MessageSquare,
      color: "emerald",
      bgColor: "bg-emerald-50",
      iconColor: "text-brand-emerald",
    },
    {
      title: "Average Score",
      value: stats?.averageScore || 0,
      change: "+2.3 from last month",
      icon: Star,
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-brand-blue",
    },
    {
      title: "Global Rank",
      value: "#--",
      change: "↑5 positions",
      icon: Trophy,
      color: "amber",
      bgColor: "bg-amber-50",
      iconColor: "text-brand-amber",
    },
    {
      title: "Badges Earned",
      value: stats?.badgesCount || 0,
      change: "2 new this week",
      icon: Medal,
      color: "purple",
      bgColor: "bg-purple-50",
      iconColor: "text-brand-purple",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{item.title}</p>
                <p className="text-3xl font-bold text-gray-900">{item.value}</p>
                <p className="text-sm text-brand-emerald font-medium">{item.change}</p>
              </div>
              <div className={`w-12 h-12 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                <Icon className={item.iconColor} size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
