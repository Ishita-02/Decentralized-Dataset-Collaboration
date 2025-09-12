import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Database, 
  Users, 
  ShieldCheck, 
  Coins,
  TrendingUp,
  Award
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsGrid({ stats, userTokens, userReputation, isLoading }) {
  const statCards = [
    {
      title: "Total Datasets",
      value: stats.datasets,
      icon: Database,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/10 to-cyan-500/10"
    },
    {
      title: "Active Contributors",
      value: stats.contributions,
      icon: Users,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-500/10 to-emerald-500/10"
    },
    {
      title: "Verifications Done",
      value: stats.verifications,
      icon: ShieldCheck,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-500/10 to-pink-500/10"
    },
    {
      title: "Your Tokens",
      value: `${userTokens} DATA`,
      icon: Coins,
      gradient: "from-yellow-500 to-orange-500",
      bgGradient: "from-yellow-500/10 to-orange-500/10"
    },
    {
      title: "Total Earned",
      value: `${stats.totalEarned * 1e18} DATA`,
      icon: TrendingUp,
      gradient: "from-indigo-500 to-purple-500",
      bgGradient: "from-indigo-500/10 to-purple-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-8 rounded-lg bg-white/10" />
                <Skeleton className="h-4 w-16 bg-white/10" />
                <Skeleton className="h-6 w-12 bg-white/10" />
              </div>
            ) : (
              <>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.bgGradient} flex items-center justify-center mb-4`}>
                  <stat.icon className={`w-6 h-6 text-blue-400`} />
                </div>
                <p className="text-white/60 text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}