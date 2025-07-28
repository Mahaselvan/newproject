import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Download, Mail, Calendar, TrendingUp, Award, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("weekly");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery({
    queryKey: ['/api/reports'],
  });

  const { data: userStats } = useQuery({
    queryKey: ['/api/user/stats'],
  });

  const generateReportMutation = useMutation({
    mutationFn: async (type: string) => {
      const response = await apiRequest('POST', '/api/reports/generate', { type });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Report generated",
        description: "Your report has been generated and sent to your email!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
    },
    onError: (error: any) => {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate report",
        variant: "destructive",
      });
    },
  });

  const handleGenerateReport = () => {
    generateReportMutation.mutate(selectedPeriod);
  };

  // Mock data for charts and insights (in a real app, this would come from the API)
  const mockChartData = {
    explanationsPerWeek: [12, 15, 8, 20, 18, 22, 16],
    scoresTrend: [78, 82, 85, 88, 84, 90, 87],
    subjectBreakdown: [
      { subject: 'Mathematics', count: 15, percentage: 35 },
      { subject: 'Science', count: 12, percentage: 28 },
      { subject: 'History', count: 8, percentage: 19 },
      { subject: 'Physics', count: 8, percentage: 18 },
    ]
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Progress Reports</h2>
          <p className="text-gray-600">Track your learning journey and get insights</p>
        </div>
      </header>

      <main className="p-8">
        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats?.explanationsCount || 0}</p>
                  <p className="text-sm text-brand-emerald">+3 from last week</p>
                </div>
                <BarChart3 className="text-brand-emerald" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Score</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats?.averageScore || 0}</p>
                  <p className="text-sm text-brand-blue">+5 points</p>
                </div>
                <TrendingUp className="text-brand-blue" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Study Time</p>
                  <p className="text-2xl font-bold text-gray-900">2.5h</p>
                  <p className="text-sm text-brand-purple">This week</p>
                </div>
                <Clock className="text-brand-purple" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New Badges</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats?.badgesCount || 0}</p>
                  <p className="text-sm text-brand-amber">+2 this month</p>
                </div>
                <Award className="text-brand-amber" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Report Generation */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail size={20} />
                  Generate New Report
                </CardTitle>
                <CardDescription>
                  Create a detailed progress report and receive it via email
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily Report</SelectItem>
                      <SelectItem value="weekly">Weekly Report</SelectItem>
                      <SelectItem value="monthly">Monthly Report</SelectItem>
                      <SelectItem value="yearly">Yearly Report</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleGenerateReport}
                    disabled={generateReportMutation.isPending}
                    className="gradient-blue-purple border-0 hover:opacity-90"
                  >
                    {generateReportMutation.isPending ? "Generating..." : "Generate Report"}
                    <Mail size={16} className="ml-2" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Reports include detailed analytics, AI insights, and personalized recommendations
                </p>
              </CardContent>
            </Card>

            {/* Performance Charts */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Your learning progress over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Explanations Chart */}
                  <div>
                    <h4 className="font-medium mb-4">Explanations per Week</h4>
                    <div className="space-y-2">
                      {mockChartData.explanationsPerWeek.map((count, index) => (
                        <div key={index} className="flex items-center">
                          <span className="text-sm w-12">W{index + 1}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                            <div 
                              className="bg-brand-emerald h-2 rounded-full" 
                              style={{ width: `${(count / 25) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm w-8">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scores Chart */}
                  <div>
                    <h4 className="font-medium mb-4">Average Scores</h4>
                    <div className="space-y-2">
                      {mockChartData.scoresTrend.map((score, index) => (
                        <div key={index} className="flex items-center">
                          <span className="text-sm w-12">W{index + 1}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                            <div 
                              className="bg-brand-blue h-2 rounded-full" 
                              style={{ width: `${score}%` }}
                            ></div>
                          </div>
                          <span className="text-sm w-8">{score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subject Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Subject Distribution</CardTitle>
                <CardDescription>Your explanations by subject area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockChartData.subjectBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${
                          index === 0 ? 'bg-brand-blue' :
                          index === 1 ? 'bg-brand-emerald' :
                          index === 2 ? 'bg-brand-purple' :
                          'bg-brand-amber'
                        }`}></div>
                        <span className="font-medium">{item.subject}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              index === 0 ? 'bg-brand-blue' :
                              index === 1 ? 'bg-brand-emerald' :
                              index === 2 ? 'bg-brand-purple' :
                              'bg-brand-amber'
                            }`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Reports */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>Your previously generated reports</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : reports && reports.length > 0 ? (
                  <div className="space-y-4">
                    {reports.map((report: any) => (
                      <div key={report.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium capitalize">{report.type} Report</h4>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Period: {report.period}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            report.emailSent 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {report.emailSent ? '✓ Emailed' : 'Pending'}
                          </span>
                          <Button variant="ghost" size="sm">
                            <Download size={14} className="mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto text-gray-400 mb-4" size={32} />
                    <p className="text-gray-500 text-sm">No reports generated yet</p>
                    <p className="text-gray-400 text-xs">Generate your first report above</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>AI Insights</CardTitle>
                <CardDescription>Personalized learning recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">💡 Recommendation</h5>
                    <p className="text-sm text-blue-800">
                      You're performing exceptionally well in Mathematics. Consider exploring advanced topics like calculus or statistics.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <h5 className="font-medium text-emerald-900 mb-2">🎯 Goal</h5>
                    <p className="text-sm text-emerald-800">
                      You're 3 explanations away from earning the "Consistent Learner" badge. Keep up the momentum!
                    </p>
                  </div>
                  
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h5 className="font-medium text-amber-900 mb-2">⚡ Improvement</h5>
                    <p className="text-sm text-amber-800">
                      Your explanation clarity has improved by 15% this month. Try explaining more complex topics to challenge yourself.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
