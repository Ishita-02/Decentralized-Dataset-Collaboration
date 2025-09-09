// Verify.jsx - CORRECTED VERSION
"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '../context/Web3Provider'; // Make sure the path is correct
import Web3Service from '../../app/components/services/Web3Service'; // We still need this for now

// Import your UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Coins, ShieldCheck, Clock, CheckCircle, Award, FileText } from 'lucide-react';
import StakeDialog from '../components/verify/StakeDialog'; // Assuming you have this
import VerificationCard from '../components/verify/VerificationCard'; // Assuming you have this

export default function Verify() {
  // ✅ 1. Get ALL web3 state and functions from the hook
  const { account, isVerifier, stakedAmount, connectWallet, web3 } = useWeb3();
  
  const router = useRouter();

  // State for data fetched from the contract
  const [pendingContributions, setPendingContributions] = useState([]);
  const [myVerifications, setMyVerifications] = useState([]); // You'll need a way to fetch this
  const [loading, setLoading] = useState(true);
  
  // State for UI control
  const [showStakeDialog, setShowStakeDialog] = useState(false);

  // ❌ REMOVED: Conflicting local state like isVerifiers, web3Connected, etc.

  // ✅ 2. A single, clean useEffect to load data
  useEffect(() => {
    const loadPageData = async () => {
      setLoading(true);
      if (isVerifier) {
        console.log("verifier", isVerifier)
        // Fetch data relevant only to verifiers
        // const proposals = await Web3Service.getPendingProposals();
        // setPendingContributions(proposals);
        // TODO: You would also fetch the user's past verifications here
        // const myReviews = await Web3Service.getMyVerifications(account);
        // setMyVerifications(myReviews);
      }
      setLoading(false);
    };

    // Only load data if the user's wallet is connected.
    if (account) {
      loadPageData();
    } else {
      // If no account, we aren't loading anything.
      setLoading(false); 
    }
  }, [account, isVerifier]); // This hook re-runs whenever account or isVerifier status changes

  const handleStakeSuccess = () => {
    // The useWeb3 hook should automatically update isVerifier.
    // We just need to close the dialog.
    setShowStakeDialog(false);
    // The useEffect will automatically re-fetch data because `isVerifier` will change.
  };

  const handleVote = async (contributionId, proposalId, vote) => {
    try {
      await Web3Service.voteOnContribution(proposalId, vote);
      // Refresh pending contributions after voting
      const proposals = await Web3Service.getPendingProposals();
      setPendingContributions(proposals);
    } catch (error) {
      console.error("Error submitting vote:", error);
    }
  };

  // ✅ 3. Correctly format the staked amount from Wei to Ether for display
  const formattedStakedAmount = stakedAmount && web3 ? web3.utils.fromWei(stakedAmount.toString(), 'ether') : 0;

  // The rest of your JSX remains largely the same, but uses the corrected state.
  
  const getVerificationStats = () => {
    const completed = myVerifications.filter(v => v.status === 'completed').length;
    const totalEarned = myVerifications
        .filter(v => v.status === 'completed')
        .reduce((sum, v) => sum + (v.tokens_earned || 0), 0);

    return { completed, totalEarned };
  };

    const stats = getVerificationStats();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Verification Hub</h1>
            <p className="text-white/70">Review contributions and earn rewards for maintaining quality</p>
          </div>
        </div>

        {/* Web3 Connection & Verifier Status */}
        {!account ? (
          <Card className="bg-yellow-500/10 border-yellow-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-400 font-medium">Wallet Not Connected</p>
                  <p className="text-yellow-300/70 text-sm">Connect your wallet to become a verifier</p>
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
        ) : !isVerifier ? (
          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-blue-400 font-medium text-lg mb-2">Become a Verifier</h3>
                  <p className="text-blue-300/70 text-sm mb-1">
                    Stake 1000 DATA tokens to become a verifier and earn rewards
                  </p>
                  <p className="text-blue-300/50 text-xs">
                    Verifiers vote on contribution proposals and earn rewards for accurate reviews
                  </p>
                </div>
                <Button 
                  onClick={() => setShowStakeDialog(true)}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Coins className="w-4 h-4 mr-2" />
                  Stake to Verify
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-green-400 font-medium">Active Verifier</p>
                    <p className="text-green-300/70 text-sm">Staked: {stakedAmount} DATA</p>
                  </div>
                </div>
                <Badge className="bg-green-400/20 text-green-300 border-green-400/30">
                  Verified Status
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        {isVerifier && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">{pendingContributions.length}</div>
                <p className="text-white/60 text-sm">Pending Reviews</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">{stats?.completed}</div>
                <p className="text-white/60 text-sm">Reviews Completed</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardContent className="p-6 text-center">
                <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">{stats?.totalEarned}</div>
                <p className="text-white/60 text-sm">DATA Earned</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardContent className="p-6 text-center">
                <Award className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">{stakedAmount}</div>
                <p className="text-white/60 text-sm">Staked DATA</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        {isVerifier && (
          <Tabs defaultValue="pending-reviews">
            <TabsList className="bg-white/10">
              <TabsTrigger value="pending-reviews" className="data-[state=active]:bg-white/20">
                Pending Reviews ({pendingContributions.length})
              </TabsTrigger>
              <TabsTrigger value="my-verifications" className="data-[state=active]:bg-white/20">
                My Reviews ({myVerifications.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending-reviews" className="space-y-6">
              {loading ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => (
                    <Card key={i} className="bg-white/5 backdrop-blur-xl border-white/10 animate-pulse">
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <div className="h-6 bg-white/10 rounded w-1/3"></div>
                          <div className="h-4 bg-white/10 rounded w-2/3"></div>
                          <div className="h-10 bg-white/10 rounded w-1/4"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : pendingContributions.length === 0 ? (
                <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                  <CardContent className="text-center py-12">
                    <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">No Pending Reviews</h3>
                    <p className="text-white/60">All contributions have been reviewed</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pendingContributions.map((contribution) => (
                    <VerificationCard 
                      key={contribution.id} 
                      contribution={contribution}
                      onVote={handleVote}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-verifications" className="space-y-6">
              {myVerifications.length === 0 ? (
                <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                  <CardContent className="text-center py-12">
                    <ShieldCheck className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">No Reviews Yet</h3>
                    <p className="text-white/60">Start reviewing contributions to earn tokens</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {myVerifications.map((verification) => (
                    <Card key={verification.id} className="bg-white/5 backdrop-blur-xl border-white/10">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-white mb-2">Verification Review</h3>
                            <p className="text-white/60 text-sm mb-2">{verification.feedback}</p>
                            <Badge className={`${
                              verification.decision === 'approve' 
                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                              {verification.decision === 'approve' ? 'Approved' : 'Rejected'}
                            </Badge>
                          </div>
                          <div className="text-right">
                            {verification.tokens_earned > 0 && (
                              <div className="text-yellow-400 font-medium">
                                +{verification.tokens_earned} DATA
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Stake Dialog */}
        {showStakeDialog && (
          <StakeDialog
            onSuccess={handleStakeSuccess}
            onCancel={() => setShowStakeDialog(false)}
          />
        )}
      </div>
    </div>
  );
}