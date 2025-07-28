import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { User, Settings, Award, BarChart3, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const { data: profileData = {} } = useQuery({
    queryKey: ['/api/user/profile'],
    enabled: !!user,
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['/api/user/badges'],
    enabled: !!user,
  });

  const { data: recentActivity = [] } = useQuery({
    queryKey: ['/api/user/recent-activity'],
    enabled: !!user,
  });

  const form = useForm({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      username: user?.username || "",
    },
  });

  // In a real app, you'd have an API endpoint to update user profile
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      // Placeholder for profile update API call
      console.log('Profile update:', data);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditingProfile(false);
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    updateProfileMutation.mutate(data);
  };

  const currentUser = profileData?.user || user;
  const stats = profileData?.stats;

  const getBadgeIcon = (icon: string) => {
    // Map icon class names to actual components
    // In a real app, you might use a proper icon library mapping
    switch (icon) {
      case 'fas fa-baby':
        return '👶';
      case 'fas fa-flask':
        return '🧪';
      case 'fas fa-fire':
        return '🔥';
      case 'fas fa-star':
        return '⭐';
      case 'fas fa-chalkboard-teacher':
        return '👨‍🏫';
      default:
        return '🏆';
    }
  };

  const getBadgeColorClass = (color: string) => {
    switch (color) {
      case 'pink':
        return 'gradient-pink-rose';
      case 'green':
        return 'gradient-emerald-green';
      case 'red':
        return 'gradient-red-orange';
      case 'yellow':
        return 'gradient-amber-yellow';
      case 'blue':
        return 'gradient-blue-purple';
      default:
        return 'gradient-amber-yellow';
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
          <p className="text-gray-600">Manage your account and view your achievements</p>
        </div>
      </header>

      <main className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-brand-blue rounded-full flex items-center justify-center text-white font-bold text-2xl">
                      {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                    </div>
                    <div>
                      <CardTitle className="text-2xl">
                        {currentUser?.firstName} {currentUser?.lastName}
                      </CardTitle>
                      <CardDescription className="text-lg">
                        Level {currentUser?.level} • @{currentUser?.username}
                      </CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                  >
                    {isEditingProfile ? <X size={16} /> : <Edit size={16} />}
                    {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isEditingProfile ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-2">
                        <Button 
                          type="submit" 
                          disabled={updateProfileMutation.isPending}
                          className="gradient-blue-purple border-0"
                        >
                          <Save size={16} className="mr-2" />
                          {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsEditingProfile(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Contact Information</h4>
                      <p className="text-gray-600 mb-1">Email: {currentUser?.email}</p>
                      <p className="text-gray-600">Username: @{currentUser?.username}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Learning Stats</h4>
                      <p className="text-gray-600 mb-1">
                        Total XP: {currentUser?.totalXP?.toLocaleString() || 0}
                      </p>
                      <p className="text-gray-600 mb-1">Current Level: {currentUser?.level}</p>
                      <p className="text-gray-600">Streak: {currentUser?.streak} days</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Tabs */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Overview</CardTitle>
                <CardDescription>Your learning activity and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="activity" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                    <TabsTrigger value="stats">Statistics</TabsTrigger>
                    <TabsTrigger value="achievements">Achievements</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="activity" className="mt-6">
                    {recentActivity && recentActivity.length > 0 ? (
                      <div className="space-y-4">
                        {recentActivity.map((activity: any) => (
                          <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h5 className="font-medium">{activity.topic.title}</h5>
                              <p className="text-sm text-gray-600">
                                {activity.topic.subject} • Score: {activity.score}/100
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-brand-amber">+{activity.xpEarned} XP</p>
                              <p className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BarChart3 className="mx-auto text-gray-400 mb-4" size={32} />
                        <p className="text-gray-500">No recent activity</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="stats" className="mt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-emerald-50 rounded-lg">
                        <p className="text-2xl font-bold text-brand-emerald">
                          {stats?.explanationsCount || 0}
                        </p>
                        <p className="text-sm text-gray-600">Explanations</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-brand-blue">
                          {stats?.averageScore || 0}
                        </p>
                        <p className="text-sm text-gray-600">Avg Score</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-brand-purple">
                          {stats?.badgesCount || 0}
                        </p>
                        <p className="text-sm text-gray-600">Badges</p>
                      </div>
                      <div className="text-center p-4 bg-amber-50 rounded-lg">
                        <p className="text-2xl font-bold text-brand-amber">
                          {currentUser?.streak || 0}
                        </p>
                        <p className="text-sm text-gray-600">Day Streak</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="achievements" className="mt-6">
                    {badges && badges.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {badges.map((userBadge: any) => (
                          <div 
                            key={userBadge.id} 
                            className={`p-4 rounded-lg text-white ${getBadgeColorClass(userBadge.badge.color)}`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-2xl">
                                {getBadgeIcon(userBadge.badge.icon)}
                              </div>
                              <div>
                                <h5 className="font-medium">{userBadge.badge.name}</h5>
                                <p className="text-sm opacity-90">{userBadge.badge.description}</p>
                                <p className="text-xs opacity-75">
                                  Earned {formatDistanceToNow(new Date(userBadge.earnedAt), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Award className="mx-auto text-gray-400 mb-4" size={32} />
                        <p className="text-gray-500">No badges earned yet</p>
                        <p className="text-gray-400 text-sm">Complete explanations to unlock achievements!</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            {/* Quick Stats */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total XP</span>
                    <span className="font-bold">{currentUser?.totalXP?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Level</span>
                    <span className="font-bold">{currentUser?.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Explanations</span>
                    <span className="font-bold">{stats?.explanationsCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Score</span>
                    <span className="font-bold">{stats?.averageScore || 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Badges</CardTitle>
              </CardHeader>
              <CardContent>
                {badges && badges.length > 0 ? (
                  <div className="space-y-3">
                    {badges.slice(0, 3).map((userBadge: any) => (
                      <div key={userBadge.id} className="flex items-center space-x-3 p-2 border rounded-lg">
                        <div className="text-2xl">
                          {getBadgeIcon(userBadge.badge.icon)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{userBadge.badge.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(userBadge.earnedAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Award className="mx-auto text-gray-400 mb-2" size={24} />
                    <p className="text-gray-500 text-sm">No badges yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}

// Helper functions for badge styling and icons
function getBadgeColorClass(color: string) {
  const colorMap: Record<string, string> = {
    gold: 'bg-yellow-500',
    silver: 'bg-gray-400',
    bronze: 'bg-orange-500',
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
  };
  return colorMap[color] || 'bg-gray-500';
}

function getBadgeIcon(icon: string) {
  const iconMap: Record<string, string> = {
    first_explanation: '🎓',
    streak_3: '🔥',
    streak_7: '⚡',
    perfect_score: '💯',
    subject_master: '👑',
    helpful: '⭐',
    consistent: '📈',
  };
  return iconMap[icon] || '🏆';
}
