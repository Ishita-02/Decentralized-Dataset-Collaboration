"use client"

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  FileText, 
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  ArrowLeft,
  Coins,
  Users, Zap
} from "lucide-react";
import { useRouter } from "next/navigation"; 
import { createPageUrl } from "@/components/ui/utils";
import { format } from "date-fns";

import ContributeForm from "../components/contributions/ContributeForm";
import ContributionCard from "../components/contributions/ContributionCard";

import Web3Service from "../components/services/Web3Service"; // Updated import path

export default function Contributions() {
  const [contributions, setContributions] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [web3Connected, setWeb3Connected] = useState(false);
  const [pendingPorposals, setPendingProposals] = useState([]);
  const [approvedPorposals, setApprovedProposals] = useState([]);
  const [rejectedPorposals, setRejectedProposals] = useState([]);
  const [resolvingId, setResolvingId] = useState(null);



  const router = useRouter();


  useEffect(() => {
    loadData();
    checkWeb3Connection();
  }, []);


  const loadData = async () => {
    setLoading(true); // Start loading
    try {
      await Web3Service.init();
      const connected = await Web3Service.isConnected();
      setWeb3Connected(connected);

      if (connected) {
        const currentUser = await Web3Service.getCurrentUser();
        setUser(currentUser);

        const [
          pending, 
          approved, 
          rejected, 
          allDatasets, 
          userContributions
        ] = await Promise.all([
          Web3Service.getPendingProposals(),
          Web3Service.getApprovedProposals(),
          Web3Service.getRejectedProposals(),
          Web3Service.getFavouriteDatasets(),
          Web3Service.userContributions() // This will now work correctly
        ]);

        setPendingProposals(pending);
        setApprovedProposals(approved);
        setRejectedProposals(rejected);
        setContributions(userContributions);
        setDatasets(allDatasets);
        
        console.log("user contributions on contributions page", userContributions);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false); // Stop loading
  };

  const handleResolve = async (proposalId) => {
    setResolvingId(proposalId); // Set loading state for this specific button
    try {
      console.log("proposal id", proposalId)

      await Web3Service.resolveContribution(proposalId);
      alert('Contribution resolved successfully! The data will now refresh.');
      await loadData(); // Refresh all data on the page
    } catch (error) {
      console.error("Failed to resolve contribution:", error);
      const reason = error.reason || "The transaction was rejected or failed.";
      alert(`Failed to resolve contribution: ${reason}`);
    } finally {
      setResolvingId(null); // Clear loading state
    }
  };


  const getCategoryColor = (category) => {
    const colors = {
      machine_learning: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      finance: "bg-green-500/10 text-green-400 border-green-500/20",
      healthcare: "bg-red-500/10 text-red-400 border-red-500/20",
      research: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      education: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      marketing: "bg-pink-500/10 text-pink-400 border-pink-500/20",
      other: "bg-gray-500/10 text-gray-400 border-gray-500/20"
    };
    return colors[category] || colors.other;
  };

  const checkWeb3Connection = async () => {
    const connected = await Web3Service.isConnected();
    setWeb3Connected(connected);
  };

  const handleContributeClick = (dataset) => {
    setSelectedDataset(dataset);
    setShowForm(true);
  };

  const handleContributionSubmit = async (contributionData) => {
    try {
      const ContributionType = {
        data_cleaning: 0,
        data_addition: 1,
        annotation: 2,
        validation: 3,
        documentation: 4,
      };

      console.log("contribution data", contributionData);
      const contributionTypeNumber = ContributionType[contributionData.contribution_type];

      // Submit to blockchain first
      
      const txHash = await Web3Service.proposeContribution(
        selectedDataset.id,
        contributionData.tokenURI,
        contributionData.title,
        contributionData.description,
        contributionTypeNumber
      );

      setShowForm(false);
      setSelectedDataset(null);
      loadData();
    } catch (error) {
      console.error("Error submitting contribution:", error);
    }
  };

  const getStatusStats = () => {
    const pending = contributions.filter(c => c.status === 'pending').length;
    const approved = contributions.filter(c => c.status === 'approved').length;
    const rejected = contributions.filter(c => c.status === 'rejected').length;
    let totalEarned;
    if (!user) {
      totalEarned = 0;
    }
    else {
      totalEarned = user.total_earned || 0;
    }

    console.log("contributions", contributions)

    return { pending, approved, rejected, totalEarned };
  };

  const stats = getStatusStats();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(createPageUrl("/"))}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">My Contributions</h1>
            <p className="text-white/70">Contribute to datasets and earn DATA tokens</p>
          </div>
        </div>

        {/* Web3 Connection Status */}
        {!web3Connected && (
          <Card className="bg-yellow-500/10 border-yellow-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-400 font-medium">Wallet Not Connected</p>
                  <p className="text-yellow-300/70 text-sm">Connect your wallet to interact with the blockchain</p>
                </div>
                <Button 
                  onClick={() => Web3Service.connectWallet()}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  Connect Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">{pendingPorposals.length}</div>
              <p className="text-white/60 text-sm">Pending Review</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">{approvedPorposals.length}</div>
              <p className="text-white/60 text-sm">Approved</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-6 text-center">
              <XCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">{rejectedPorposals.length}</div>
              <p className="text-white/60 text-sm">Rejected</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-6 text-center">
              <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">{stats.totalEarned}</div>
              <p className="text-white/60 text-sm">DATA Earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="my-contributions">
          <TabsList className="bg-white/10">
            <TabsTrigger value="my-contributions" className="data-[state=active]:bg-white/20">
              My Contributions ({contributions.length})
            </TabsTrigger>
            <TabsTrigger value="available-datasets" className="data-[state=active]:bg-white/20">
              Available Datasets ({datasets.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-contributions" className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <Card key={i} className="bg-white/5 backdrop-blur-xl border-white/10 animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="h-6 bg-white/10 rounded w-1/3"></div>
                        <div className="h-4 bg-white/10 rounded w-2/3"></div>
                        <div className="h-4 bg-white/10 rounded w-1/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : contributions.length === 0 ? (
              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardContent className="text-center py-12">
                  <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No Contributions Yet</h3>
                  <p className="text-white/60 mb-6">Start contributing to datasets to earn tokens</p>
                  <Button 
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-500"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Make First Contribution
                  </Button>
                </CardContent>
              </Card>
            ) : (
              
              <div className="space-y-4">
                {contributions.map((contribution) => {
                  const isDeadlinePassed = new Date() > new Date(Number(contribution.voteDeadline) * 1000);
                  
                  let statusElement;
                  const baseClasses = "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold";

                  if (contribution.resolved) {
                      const statusText = contribution.yesVotes > contribution.noVotes ? 'Approved' : 'Rejected';
                      const statusColor = contribution.yesVotes > contribution.noVotes ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-red-400 border-red-500/30 bg-red-500/10';
                      statusElement = <div className={`${baseClasses} ${statusColor}`}>{statusText}</div>;
                  } else if (isDeadlinePassed) {
                      statusElement = <div className={`${baseClasses} text-yellow-400 border-yellow-500/30 bg-yellow-500/10`}>Ready to Resolve</div>;
                  } else {
                      statusElement = <div className={`${baseClasses} text-white/60 border-white/20`}>Voting in Progress</div>;
                  }

                  return (
                    <Card key={contribution.proposalId.toString()} className="bg-white/5 backdrop-blur-xl border-white/10">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-white mb-2">{contribution.title}</h3>
                            <p className="text-white/60 text-sm mb-3">Deadline: {format(new Date(Number(contribution.voteDeadline) * 1000), 'MMM d, yyyy, h:mm a')}</p>
                            {statusElement}
                          </div>
                          <div className="text-right">
                            {/* ?? NEW ADDITION: Conditional "Resolve" button */}
                            {!contribution.resolved && isDeadlinePassed && (
                              <Button
                                size="sm"
                                onClick={() => handleResolve(Number(contribution.proposalId))}
                                disabled={resolvingId === contribution.proposalId.toString()}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Zap className="w-4 h-4 mr-2" />
                                {resolvingId === contribution.proposalId.toString() ? 'Resolving...' : 'Resolve'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="available-datasets" className="space-y-6">
            {datasets.length === 0 ? (
              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardContent className="text-center py-12">
                  <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No Datasets Available</h3>
                  <p className="text-white/60">Check back later for new datasets to contribute to</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {datasets.map((dataset) => (
                  <Card key={dataset.id} className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">{dataset.title}</CardTitle>
                      <p className="text-white/60 text-sm line-clamp-2">{dataset.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(dataset.category)}`}>
                          {dataset.category.replace('_', ' ')}
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Coins className="w-4 h-4" />
                          <span className="font-medium">{Number(dataset.contributionReward)} DATA</span>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleContributeClick(dataset)}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        disabled={!web3Connected}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Contribute
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Contribution Form Modal */}
        {showForm && selectedDataset && (
          <ContributeForm
            dataset={selectedDataset}
            onSubmit={handleContributionSubmit}
            onCancel={() => {
              setShowForm(false);
              setSelectedDataset(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
