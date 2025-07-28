import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function TopicRecommendations() {
  const [, setLocation] = useLocation();

  const { data: topics, isLoading } = useQuery({
    queryKey: ['/api/topics/recommended'],
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'hard':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleTopicSelect = (topicId: string) => {
    setLocation(`/explanation-center?topic=${topicId}`);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="p-6 border-b border-gray-100">
          <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
                  <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recommended Topics</h3>
            <p className="text-sm text-gray-600">AI-curated topics based on your learning pattern</p>
          </div>
          <Button 
            variant="ghost" 
            className="text-brand-blue hover:text-blue-500"
            onClick={() => setLocation('/explanation-center')}
          >
            View All
          </Button>
        </div>
      </div>
      
      <div className="p-6">
        {topics && topics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {topics.map((topic: any) => (
              <div 
                key={topic.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-brand-blue hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleTopicSelect(topic.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getSubjectColor(topic.subject)}`}>
                    {topic.subject.charAt(0).toUpperCase() + topic.subject.slice(1)}
                  </span>
                  <span className="text-sm font-medium text-brand-amber">+{topic.xpReward} XP</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">{topic.title}</h4>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{topic.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className={getDifficultyColor(topic.difficulty)}>
                    Difficulty: {topic.difficulty.charAt(0).toUpperCase() + topic.difficulty.slice(1)}
                  </span>
                  <span>~{topic.estimatedMinutes} min</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No recommended topics available. Check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
}
