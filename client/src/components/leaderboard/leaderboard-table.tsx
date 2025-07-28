import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface LeaderboardTableProps {
  data: any[];
  isLoading: boolean;
  currentUserId?: string;
}

export default function LeaderboardTable({ data, isLoading, currentUserId }: LeaderboardTableProps) {
  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-brand-amber text-white">🥇 Champion</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400 text-white">🥈 Runner-up</Badge>;
    if (rank === 3) return <Badge className="bg-orange-400 text-white">🥉 Third</Badge>;
    if (rank <= 10) return <Badge variant="secondary">Top 10</Badge>;
    if (rank <= 50) return <Badge variant="outline">Top 50</Badge>;
    return null;
  };

  const getTrendIcon = () => {
    // Placeholder for trend calculation
    const trends = [TrendingUp, TrendingDown, Minus];
    const randomTrend = trends[Math.floor(Math.random() * trends.length)];
    return randomTrend;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No leaderboard data available</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Rank</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Level</TableHead>
          <TableHead>Total XP</TableHead>
          <TableHead>Streak</TableHead>
          <TableHead>Trend</TableHead>
          <TableHead>Badge</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((user, index) => {
          const rank = index + 1;
          const TrendIcon = getTrendIcon();
          const isCurrentUser = user.id === currentUserId;
          
          return (
            <TableRow 
              key={user.id} 
              className={isCurrentUser ? "bg-blue-50 border-brand-blue" : ""}
            >
              <TableCell className="font-medium">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  rank === 1 ? "bg-brand-amber text-white" :
                  rank === 2 ? "bg-gray-400 text-white" :
                  rank === 3 ? "bg-orange-400 text-white" :
                  isCurrentUser ? "bg-brand-blue text-white" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {rank}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                      {isCurrentUser && <span className="text-brand-blue ml-1">(You)</span>}
                    </p>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-medium">Level {user.level}</span>
              </TableCell>
              <TableCell>
                <div className="font-bold text-lg">
                  {user.totalXP?.toLocaleString() || 0}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-1">
                  <span className="font-medium">{user.streak || 0}</span>
                  <span className="text-sm text-gray-500">days</span>
                </div>
              </TableCell>
              <TableCell>
                <TrendIcon 
                  size={16} 
                  className={
                    TrendIcon === TrendingUp ? "text-green-500" :
                    TrendIcon === TrendingDown ? "text-red-500" :
                    "text-gray-400"
                  } 
                />
              </TableCell>
              <TableCell>
                {getRankBadge(rank)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
