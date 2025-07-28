import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Crown, Medal, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeaderboardTable from "@/components/leaderboard/leaderboard-table";

export default function Leaderboard() {
  const { user } = useAuth();

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['/api/leaderboard'],
  });

  const { data: userStats } = useQuery({
    queryKey: ['/api/user/stats'],
  });

  // Find current user's position in leaderboard
  const userPosition = leaderboard?.findIndex((entry: any) => entry.id === user?.id) + 1 || 0;

  const topThree = leaderboard?.slice(0, 3) || [];

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leaderboard</h2>
          <p className="text-gray-600">See how you rank against other learners</p>
        </div>
      </header>

      <main className="p-8">
        {/* Top 3 Podium */}
        {!isLoading && topThree.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="text-brand-amber" size={24} />
                Top Performers
              </CardTitle>
              <CardDescription>
                This month's leading explainers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Second Place */}
                {topThree[1] && (
                  <div className="order-2 md:order-1">
                    <div className="bg-gray-100 rounded-lg p-6 text-center">
                      <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-700">2</span>
                      </div>
                      <div className="w-16 h-16 bg-gray-400 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-lg">
                        {topThree[1].firstName?.[0]}{topThree[1].lastName?.[0]}
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        {topThree[1].firstName} {topThree[1].lastName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">Level {topThree[1].level}</p>
                      <p className="text-xl font-bold text-gray-900">{topThree[1].totalXP} XP</p>
                      <Medal className="mx-auto text-gray-400 mt-2" size={24} />
                    </div>
                  </div>
                )}

                {/* First Place */}
                {topThree[0] && (
                  <div className="order-1 md:order-2">
                    <div className="gradient-amber-yellow rounded-lg p-6 text-center text-white transform scale-105">
                      <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Crown className="text-white" size={32} />
                      </div>
                      <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-brand-amber font-bold text-xl">
                        {topThree[0].firstName?.[0]}{topThree[0].lastName?.[0]}
                      </div>
                      <h3 className="font-semibold text-white text-lg">
                        {topThree[0].firstName} {topThree[0].lastName}
                      </h3>
                      <p className="text-sm opacity-90 mb-2">Level {topThree[0].level} • Champion</p>
                      <p className="text-2xl font-bold">{topThree[0].totalXP} XP</p>
                    </div>
                  </div>
                )}

                {/* Third Place */}
                {topThree[2] && (
                  <div className="order-3">
                    <div className="bg-orange-100 rounded-lg p-6 text-center">
                      <div className="w-16 h-16 bg-orange-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-2xl font-bold text-orange-700">3</span>
                      </div>
                      <div className="w-16 h-16 bg-orange-400 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-lg">
                        {topThree[2].firstName?.[0]}{topThree[2].lastName?.[0]}
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        {topThree[2].firstName} {topThree[2].lastName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">Level {topThree[2].level}</p>
                      <p className="text-xl font-bold text-gray-900">{topThree[2].totalXP} XP</p>
                      <Medal className="mx-auto text-orange-400 mt-2" size={24} />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Position Card */}
        {userPosition > 0 && (
          <Card className="mb-8 border-brand-blue bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-brand-blue text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {userPosition}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Your Current Position</h3>
                    <p className="text-sm text-gray-600">
                      You're ranked #{userPosition} with {user?.totalXP || 0} XP
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-brand-blue">{user?.totalXP || 0} XP</p>
                  <p className="text-sm text-gray-600">Level {user?.level || 1}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard Tabs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Full Leaderboard</CardTitle>
                <CardDescription>Complete ranking of all learners</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="text-brand-blue border-brand-blue">
                  Global
                </Button>
                <Button variant="ghost" size="sm">
                  Friends
                </Button>
                <Button variant="ghost" size="sm">
                  School
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="monthly" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="alltime">All Time</TabsTrigger>
              </TabsList>
              
              <TabsContent value="daily" className="mt-6">
                <LeaderboardTable data={leaderboard} isLoading={isLoading} currentUserId={user?.id} />
              </TabsContent>
              
              <TabsContent value="weekly" className="mt-6">
                <LeaderboardTable data={leaderboard} isLoading={isLoading} currentUserId={user?.id} />
              </TabsContent>
              
              <TabsContent value="monthly" className="mt-6">
                <LeaderboardTable data={leaderboard} isLoading={isLoading} currentUserId={user?.id} />
              </TabsContent>
              
              <TabsContent value="alltime" className="mt-6">
                <LeaderboardTable data={leaderboard} isLoading={isLoading} currentUserId={user?.id} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
