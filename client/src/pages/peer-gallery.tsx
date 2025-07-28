import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Play, FileText, Mic, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PeerExplanations from "@/components/gallery/peer-explanations";

export default function PeerGallery() {
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("this-week");

  const { data: explanations, isLoading } = useQuery({
    queryKey: ['/api/explanations/public'],
  });

  const filteredExplanations = explanations?.filter((explanation: any) => {
    const matchesSearch = explanation.topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         explanation.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         explanation.user.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = subjectFilter === "all" || explanation.topic.subject === subjectFilter;
    
    // For time filter, you'd implement date filtering logic here
    // For now, we'll just show all results
    
    return matchesSearch && matchesSubject;
  }) || [];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'audio':
        return <Mic size={16} className="text-brand-emerald" />;
      case 'video':
        return <Video size={16} className="text-brand-blue" />;
      default:
        return <FileText size={16} className="text-brand-purple" />;
    }
  };

  const getTypeDuration = (type: string) => {
    // In a real app, you'd get actual duration from the explanation data
    if (type === 'text') return 'Text';
    return `${Math.floor(Math.random() * 10) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Peer Gallery</h2>
          <p className="text-gray-600">Learn from top-rated explanations by fellow students</p>
        </div>
      </header>

      <main className="p-8">
        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search size={20} />
              Discover Explanations
            </CardTitle>
            <CardDescription>
              Find the best explanations from your peers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by topic, user, or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="biology">Biology</SelectItem>
                  <SelectItem value="history">History</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="This Week" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="all-time">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {filteredExplanations.length > 0 
                    ? `${filteredExplanations.length} Explanations Found`
                    : 'No Explanations Found'
                  }
                </CardTitle>
                <CardDescription>
                  {searchTerm || subjectFilter !== "all" 
                    ? `Filtered results for your search`
                    : `Latest high-quality explanations from the community`
                  }
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Filter size={16} className="mr-2" />
                More Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <PeerExplanations 
              explanations={filteredExplanations} 
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
