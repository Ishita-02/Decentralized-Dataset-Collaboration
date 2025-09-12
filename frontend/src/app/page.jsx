"use client"

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Link } from "react-router-dom";
import { useRouter } from "next/navigation"; 
import { createPageUrl } from "@/components/ui/utils";
import { 
  Upload, 
  Database, 
  Users, 
  ShieldCheck, 
  TrendingUp,
  Coins,
  Award,
  Activity,
  Plus,
  ArrowRight
} from "lucide-react";

import StatsGrid from "./components/dashboard/StataGrid";
import RecentActivity from "./components/dashboard/RecentActivity";
import QuickActions from "./components/dashboard/QuickActions";
import LeaderboardCard from "./components/dashboard/LeaderboardCard";
import { useWeb3 } from "../app/context/Web3Provider";
import Web3Service from "./components/services/Web3Service";


export default function Dashboard() {
  const { account } = useWeb3();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    datasets: 0,
    contributions: 0,
    verifications: 0,
    totalEarned: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();


  // useEffect(() => {
  //   loadDashboardData();
  // }, []);

  useEffect(() => {
    // Only load the leaderboard if the wallet is connected
    if (account) {
      loadDashboardData();
    } else {
        setIsLoading(false); // If no wallet, stop loading
    }
  }, [account]);

  const loadDashboardData = async () => {
    try {
      const currentUser = await Web3Service.getCurrentUser();
      console.log("dashboard", currentUser)
      setUser(currentUser);

      // Load stats
      const datasets = await Web3Service.getAllDatasets();
      // const activeContributors = await Web3Service.getActiveContributors();
      // console.log("contributors", activeContributors)
      const contributions = [];
      const verifications = [];

      setStats({
        datasets: datasets.length,
        contributions: currentUser.contributions_count,
        verifications: currentUser.verifications_count,
        totalEarned: currentUser.total_earned || 0
      });

      // Load recent activity (contributions and verifications)
      const userContributions = contributions.slice(0, 3);
      const userVerifications = verifications.slice(0, 3);

      const activity = [
        ...userContributions.map(c => ({ ...c, type: 'contribution' })),
        ...userVerifications.map(v => ({ ...v, type: 'verification' }))
      ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

      setRecentActivity(activity);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium">
            <Activity className="w-4 h-4" />
            Welcome to DataChain
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            Decentralized
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {" "}Dataset{" "}
            </span>
            Collaboration
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Upload, contribute, verify, and earn tokens while building the world's most valuable datasets together.
          </p>
        </div>

        {/* Stats Grid */}
        <StatsGrid 
          stats={stats} 
          userTokens={user?.tokens_balance / 1e18 || 0}
          userReputation={user?.reputation_score || 0}
          isLoading={isLoading}
        />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions & Activity */}
          <div className="lg:col-span-2 space-y-8">
            <QuickActions />
            <RecentActivity 
              activity={recentActivity}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column - Leaderboard & Profile */}
          <div className="space-y-8">
            <LeaderboardCard isLoading={isLoading} />
            
            {/* Profile Quick View */}
            {user && (
              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    Your Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Role</span>
                    <span className="text-white font-medium capitalize">{user.role}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Reputation</span>
                    <span className="text-white font-medium">{user.reputation_score}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Contributions</span>
                    <span className="text-white font-medium">{user.contributions_count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Verifications</span>
                    <span className="text-white font-medium">{user.verifications_count}</span>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    onClick={() => router.push(createPageUrl("Profile"))}
                  >
                    View Full Profile
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}