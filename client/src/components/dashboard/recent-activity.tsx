import { useQuery } from "@tanstack/react-query";
import { Mic, Video, FileText, CheckCircle, Bot } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function RecentActivity() {
  const { data: activity, isLoading } = useQuery({
    queryKey: ['/api/user/recent-activity'],
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'audio':
        return <Mic className="text-brand-emerald" size={20} />;
      case 'video':
        return <Video className="text-brand-blue" size={20} />;
      default:
        return <FileText className="text-brand-purple" size={20} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'audio':
        return 'bg-emerald-50';
      case 'video':
        return 'bg-blue-50';
      default:
        return 'bg-purple-50';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-brand-emerald';
    if (score >= 70) return 'text-brand-blue';
    return 'text-brand-amber';
  };

  const getStatusBadge = (score: number) => {
    if (score >= 85) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-brand-emerald">
          <CheckCircle size={12} className="mr-1" />
          AI Approved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-brand-blue">
        <Bot size={12} className="mr-1" />
        AI Reviewed
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <p className="text-sm text-gray-600">Your latest explanations and feedback</p>
        </div>
        <div className="divide-y divide-gray-100">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6">
              <div className="animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!activity || activity.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <p className="text-sm text-gray-600">Your latest explanations and feedback</p>
        </div>
        <div className="p-8 text-center">
          <p className="text-gray-500">No explanations yet. Start explaining to see your activity!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <p className="text-sm text-gray-600">Your latest explanations and feedback</p>
      </div>
      <div className="divide-y divide-gray-100">
        {activity.map((item: any) => (
          <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start space-x-4">
              <div className={`w-10 h-10 ${getTypeColor(item.type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                {getTypeIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">{item.topic.title}</p>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {item.topic.subject} • {item.type.charAt(0).toUpperCase() + item.type.slice(1)} explanation
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <span className={`text-lg font-bold ${getScoreColor(item.score)}`}>{item.score || 0}</span>
                    <span className="text-sm text-gray-600">score</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium text-brand-amber">+{item.xpEarned || 0} XP</span>
                  </div>
                  {getStatusBadge(item.score || 0)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
