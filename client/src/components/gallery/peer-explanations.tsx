import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ThumbsUp, ThumbsDown, Play, Eye, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

interface PeerExplanationsProps {
  explanations: any[];
  isLoading: boolean;
}

export default function PeerExplanations({ explanations, isLoading }: PeerExplanationsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const voteMutation = useMutation({
    mutationFn: async ({ explanationId, isUpvote }: { explanationId: string; isUpvote: boolean }) => {
      return await apiRequest('POST', `/api/explanations/${explanationId}/vote`, { isUpvote });
    },
    onSuccess: () => {
      toast({
        title: "Vote recorded",
        description: "Thank you for your feedback!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/explanations/public'] });
    },
    onError: (error: any) => {
      toast({
        title: "Vote failed",
        description: error.message || "Failed to record vote",
        variant: "destructive",
      });
    },
  });

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'physics':
        return 'bg-blue-100 text-blue-800';
      case 'chemistry':
        return 'bg-green-100 text-green-800';
      case 'biology':
        return 'bg-emerald-100 text-emerald-800';
      case 'mathematics':
        return 'bg-purple-100 text-purple-800';
      case 'history':
        return 'bg-red-100 text-red-800';
      case 'english':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-brand-emerald';
    if (score >= 80) return 'text-brand-blue';
    if (score >= 70) return 'text-brand-amber';
    return 'text-gray-600';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play size={16} className="text-brand-blue" />;
      case 'audio':
        return <Play size={16} className="text-brand-emerald" />;
      default:
        return <Eye size={16} className="text-brand-purple" />;
    }
  };

  const getTypeDuration = (type: string, explanation: any) => {
    if (type === 'text') return 'Read';
    // In a real app, you'd get actual duration from file metadata
    return `${Math.floor(Math.random() * 10) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-16 bg-gray-200 rounded mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-12"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!explanations || explanations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="text-gray-400" size={32} />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No explanations found</h3>
        <p className="text-gray-600">Try adjusting your search criteria or check back later for new content.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {explanations.map((explanation: any) => (
        <Card key={explanation.id} className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            {/* User Info */}
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center text-white font-medium text-sm">
                {explanation.user.firstName?.[0]}{explanation.user.lastName?.[0]}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {explanation.user.firstName} {explanation.user.lastName}
                </p>
                <p className="text-sm text-gray-600">Level {explanation.user.level}</p>
              </div>
            </div>

            {/* Topic Title */}
            <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
              {explanation.topic.title}
            </h4>

            {/* Content Preview */}
            <p className="text-sm text-gray-600 mb-3 line-clamp-3">
              {explanation.content ? 
                explanation.content.substring(0, 120) + (explanation.content.length > 120 ? '...' : '') :
                'Audio/Video explanation available'
              }
            </p>

            {/* Metadata */}
            <div className="flex items-center justify-between mb-3">
              <Badge className={getSubjectColor(explanation.topic.subject)}>
                {explanation.topic.subject.charAt(0).toUpperCase() + explanation.topic.subject.slice(1)}
              </Badge>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                {getTypeIcon(explanation.type)}
                <span>{getTypeDuration(explanation.type, explanation)}</span>
              </div>
            </div>

            {/* Score and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    voteMutation.mutate({ explanationId: explanation.id, isUpvote: true });
                  }}
                  disabled={voteMutation.isPending}
                  className="flex items-center space-x-1 text-brand-emerald hover:text-emerald-600 p-1"
                >
                  <ThumbsUp size={16} />
                  <span className="text-sm font-medium">{explanation.upvotes || 0}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    voteMutation.mutate({ explanationId: explanation.id, isUpvote: false });
                  }}
                  disabled={voteMutation.isPending}
                  className="flex items-center space-x-1 text-gray-400 hover:text-red-500 p-1"
                >
                  <ThumbsDown size={16} />
                  <span className="text-sm font-medium">{explanation.downvotes || 0}</span>
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-lg font-bold ${getScoreColor(explanation.score || 0)}`}>
                  {explanation.score || 0}
                </span>
                <Clock size={12} className="text-gray-400" />
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(explanation.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
