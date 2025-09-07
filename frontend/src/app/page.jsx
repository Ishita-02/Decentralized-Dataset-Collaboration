"use client";

import React, { useState, useEffect } from "react"; // Import useEffect and useState
import Link from "next/link";
import { Activity, Award, ArrowRight } from "lucide-react";

// Your custom components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatsGrid from "./components/dashboard/StataGrid";
import RecentActivity from "./components/dashboard/RecentActivity";
import QuickActions from "./components/dashboard/QuickActions";
import LeaderboardCard from "./components/dashboard/LeaderboardCard";

// Your Web3 Service for interacting with the contract
import Web3Service from "./components/services/Web3Service";

export default function DashboardPage() {
  // State to hold our contract data
  const [stats, setStats] = useState({
    datasets: 0,
    contributions: 15, // Using mock data for now
    verifications: 32, // Using mock data for now
    totalEarned: 450, // Using mock data for now
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // This hook runs when the component mounts
  useEffect(() => {
    // Define an async function to fetch data from the smart contract
    const loadContractData = async () => {
      try {
        // Call your Web3Service to get all datasets
        const datasetsFromContract = await Web3Service.getAllDatasets();
        
        // Update the stats with the new data
        setStats(prevStats => ({
          ...prevStats,
          datasets: datasetsFromContract.length,
        }));
        
      } catch (err) {
        console.error("Failed to fetch contract data:", err);
        setError("Could not connect to the blockchain. Please ensure MetaMask is installed and connected.");
      } finally {
        setIsLoading(false);
      }
    };

    loadContractData();
  }, []); // The empty array ensures this runs only once

  // Mock user data, you can replace this with contract calls later
  const user = {
    role: "Uploader",
    reputation_score: 120,
    tokens_balance: 1500,
  };

  // Display an error message if fetching failed
  if (error) {
    return <div className="text-red-500 text-center p-8">{error}</div>;
  }
  
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium">
          <Activity className="w-4 h-4" />
          Welcome to DataNexus
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
        userTokens={user?.tokens_balance || 0}
        userReputation={user?.reputation_score || 0}
        isLoading={isLoading}
      />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <QuickActions />
          <RecentActivity 
            activity={[]} // Pass real activity data here
            isLoading={isLoading}
          />
        </div>

        <div className="space-y-8">
          <LeaderboardCard isLoading={isLoading} />
          
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
                <Link href="/profile">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                    View Full Profile
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}