"use client"

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Trophy, 
  Medal, 
  Award,
  TrendingUp
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Web3Service from "../services/Web3Service";

export default function LeaderboardCard({ isLoading }) {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      // With no DB, synthesize a minimal list from available wallet only
      const me = await Web3Service.getCurrentUser();
      setTopUsers([me]);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    }
    setLoading(false);
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 2:
        return <Award className="w-5 h-5 text-orange-400" />;
      default:
        return <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs text-white font-bold">{index + 1}</div>;
    }
  };

  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-yellow-400" />
          Top Contributors
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading || isLoading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-6 h-6 rounded-full bg-white/10" />
                <Skeleton className="w-8 h-8 rounded-full bg-white/10" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 bg-white/10" />
                  <Skeleton className="h-3 w-16 mt-1 bg-white/10" />
                </div>
                <Skeleton className="h-4 w-12 bg-white/10" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {topUsers.map((user, index) => (
              <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-all duration-200">
                {getRankIcon(index)}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                  index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400' :
                  index === 2 ? 'bg-gradient-to-r from-orange-400 to-red-400' :
                  'bg-gradient-to-r from-blue-500 to-purple-500'
                }`}>
                  {user.full_name?.[0] || user.email[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white text-sm">
                    {user.full_name || user.email.split('@')[0]}
                  </p>
                  <p className="text-xs text-white/60">
                    {user.contributions_count || 0} contributions
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-yellow-400 text-sm">
                    {user.total_earned || 0} DCT
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}