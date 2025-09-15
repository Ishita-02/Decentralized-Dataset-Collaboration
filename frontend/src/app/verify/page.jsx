// Verify.jsx - FIXED VERSION
"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '../context/Web3Provider'; // Make sure the path is correct
import Web3Service from '../../app/components/services/Web3Service'; // We still need this for now
import { format } from "date-fns"; // ?? NEW ADDITION

// Import your UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Coins, ShieldCheck, Clock, CheckCircle, Award, FileText, XCircle, User } from 'lucide-react';
import StakeDialog from '../components/verify/StakeDialog'; // Assuming you have this
import VerificationCard from '../components/verify/VerificationCard'; // Assuming you have this

const ContributionTypeText = [
  "data_cleaning",
  "data_addition",
  "annotation",
  "validation",
  "documentation",
];

export default function Verify() {
  // ✅ 1. Get ALL web3 state and functions from the hook
  const { account, isVerifier, stakedAmount, connectWallet, web3 } = useWeb3();
  
  const router = useRouter();

  // State for data fetched from the contract
  const [pendingContributions, setPendingContributions] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [myVerifications, setMyVerifications] = useState([]); // You'll need a way to fetch this
  const [reviewCompleted, setReviewCompleted] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);
  const [voteStatuses, setVoteStatuses] = useState({}); 
  const [expiredReviews, setExpiredReviews] = useState([]);// Will store vote status for each proposal, e.g., { 1: true, 2: false }
  const [isLoadingVotes, setIsLoadingVotes] = useState(true);
  const [user, setUser] = useState(null);
  

  
  // State for UI control
  const [showStakeDialog, setShowStakeDialog] = useState(false);
  
  // Track if data has been loaded to prevent duplicate calls
  const [dataLoaded, setDataLoaded] = useState(false);

  // ✅ 2. A single, clean useEffect to load data - ONLY runs after user becomes verifier
  useEffect(() => {
    const loadPageData = async () => {
      // Prevent duplicate calls
      if (dataLoaded) return;
      
      setLoading(true);
      console.log("Loading page data - isVerifier:", isVerifier, "account:", account);
      
      if (isVerifier && account) {
        try {
          console.log("User is verifier, fetching data...");

          const currentUser = await Web3Service.getCurrentUser(); 
          console.log("current user", currentUser);
          setUser(currentUser);
          
          // Fetch data relevant only to verifiers
          const pendingReviews = await Web3Service.getPendingReviews();
          console.log("proposal verify page", pendingReviews);

          const nowInSeconds = Date.now() / 1000;
          const activePendingReviews = [];
          const expiredFromPending = [];
          
          for (const review of pendingReviews) {
            // If deadline has passed, move it to the expired list
            if (Number(review.voteDeadline) < nowInSeconds) {
              expiredFromPending.push(review);
            } else {
              // Otherwise, it's an active pending review
              activePendingReviews.push(review);
            }
          }
          
          console.log("Active pending reviews:", activePendingReviews);
          console.log("Expired reviews:", expiredFromPending);

          setExpiredReviews(expiredFromPending);
          setPendingReviews(activePendingReviews);
          
          // Fetch reviewed proposals
          const reviewedProposals = await Web3Service.getReviewedProposals();
          console.log("reviewed proposal", reviewedProposals);          

          setMyVerifications(reviewedProposals);
          setReviewCompleted(reviewedProposals);

          
          setDataLoaded(true); // Mark data as loaded
          console.log("Data loading completed");
          
        } catch (error) {
          console.error("Error loading verifier data:", error);
        }
      }
      
      setLoading(false);
    };

    if (isVerifier && account && !dataLoaded) {
      loadPageData();
    } else if (!account || !isVerifier) {
      // If no account or not verifier, stop loading
      setLoading(false);
      setDataLoaded(false); // Reset so data can be loaded when they become verifier
    }
  }, [account, isVerifier, dataLoaded]); 
  
  // ✅ 3. Separate useEffect for vote statuses - FIXED to not run duplicate calls
    useEffect(() => {
    // Don't run if the main list is empty or if we're still loading votes
    if (myVerifications.length === 0 || !account) {
      if (myVerifications.length === 0) {
        setIsLoadingVotes(false);
      }
      return;
    }

    const fetchAllVoteStatuses = async () => {
      console.log("Fetching specific votes for", myVerifications.length, "verifications");
      setIsLoadingVotes(true);
      
      try {
        // Create a list of promises to get the specific vote for each verification
        const promises = myVerifications.map(verification => {
          // ?? NEW ADDITION: We now call the new getVerifierVote function
          // NOTE: This assumes you have added 'getVerifierVote' to your Web3Service
          return Web3Service.getVerifierVote(verification.proposalId, account); 
        });
        
        const results = await Promise.all(promises);
        
        const statuses = {};
        myVerifications.forEach((verification, index) => {
          // results[index] will be true for 'Approve', false for 'Reject'
          statuses[verification.proposalId] = results[index];
        });
        
        console.log("Specific vote choices loaded:", statuses);
        setVoteStatuses(statuses);
        
      } catch (error) {
        console.error("Failed to fetch one or more vote statuses:", error);
      }
      
      setIsLoadingVotes(false);
    };

    fetchAllVoteStatuses();
  }, [myVerifications, account]);// Removed isLoadingVotes from dependency to prevent loop

  // ✅ 4. FIXED: handleStakeSuccess - reload data after staking
  const handleStakeSuccess = () => {
    console.log("Stake successful! User should now be verifier.");
    setShowStakeDialog(false);
    
    // Reset data loading state so useEffect will run again
    setDataLoaded(false);
    
    // The useWeb3 hook should automatically update isVerifier.
    // The useEffect will automatically re-fetch data because `isVerifier` will change.
    // Force a small delay to ensure blockchain state is updated
    setTimeout(() => {
      console.log("Checking verifier status after stake...");
      // The useEffect should trigger automatically when isVerifier updates
    }, 2000);
  };

  const handleVote = async (contributionId, proposalId, vote) => {
    try {
      console.log("Voting on proposal:", proposalId, "vote:", vote);
      
      // Refresh data after voting
      setDataLoaded(false); // new additions

    } catch (error) {
      console.error("Error submitting vote:", error);
    }
  };
  
  const getVerificationStats = () => {
    const completed = myVerifications.filter(v => v.status === 'completed').length;
    let totalEarned;
    if (!user) {
      totalEarned = 0;
    }
    else {
      totalEarned = user.total_earned * 1e18 || 0;
    }
    return { completed, totalEarned };
  };

  const stats = getVerificationStats();

  // ✅ 5. Debug logging
  console.log("Verify page render - account:", account, "isVerifier:", isVerifier, "loading:", loading, "dataLoaded:", dataLoaded);

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
                  onClick={() => connectWallet()}
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

        {/* Stats Grid - Only show when user is verifier and data is loaded */}
        {isVerifier && !loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">{pendingReviews.length}</div>
                <p className="text-white/60 text-sm">Pending Reviews</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">{reviewCompleted.length}</div>
                <p className="text-white/60 text-sm">Reviews Completed</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardContent className="p-6 text-center">
                <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">{stats?.totalEarned || 0}</div>
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

        {/* Main Content - Only show when user is verifier */}
        {isVerifier && (
          <Tabs defaultValue="pending-reviews">
            <TabsList className="bg-white/10">
              <TabsTrigger value="pending-reviews" className="data-[state=active]:bg-white/20">
                Pending Reviews ({pendingReviews.length})
              </TabsTrigger>
              <TabsTrigger value="my-verifications" className="data-[state=active]:bg-white/20">
                My Reviews ({myVerifications.length})
              </TabsTrigger>
              <TabsTrigger value="expired-reviews" className="data-[state=active]:bg-white/20">
                Expired Reviews ({expiredReviews.length})
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
              ) : pendingReviews.length === 0 ? (
                <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                  <CardContent className="text-center py-12">
                    <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">No Pending Reviews</h3>
                    <p className="text-white/60">All contributions have been reviewed</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pendingReviews.map((contribution) => (
                    <div key={contribution.proposalId}>
                      <VerificationCard 
                        contribution={contribution}
                        onVote={handleVote}
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-verifications" className="space-y-6">
              {myVerifications.length === 0 ? (
                <Card className="bg-white/5"><CardContent className="text-center py-12"><ShieldCheck className="w-16 h-16 text-white/20 mx-auto mb-4" /><h3 className="text-xl font-medium text-white mb-2">No Reviews Yet</h3></CardContent></Card>
              ) : (
                <div className="space-y-4">
                  {myVerifications.map((verification, index) => {
                    // ?? NEW ADDITION: 'myVote' now correctly holds true for approve, false for reject
                    const myVote = voteStatuses[verification.proposalId];
                    
                    const baseClasses = 'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold';
                    const statusClasses = myVote
                      ? 'bg-green-500/10 text-green-400 border-green-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20';

                    return (
                      <Card key={`${verification.proposalId}-${index}`} className="bg-white/5 backdrop-blur-xl border-white/10">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-white mb-2">Verification Review</h3>
                              <p className="text-white/60 text-sm mb-2">{verification.title}</p>
                              
                              {isLoadingVotes ? (
                                <div className={`${baseClasses} animate-pulse bg-white/10`}>Checking vote...</div>
                              ) : (
                                // ?? NEW ADDITION: The text now accurately reflects your vote
                                <div className={`${baseClasses} ${statusClasses}`}>
                                  {myVote ? 'You Approved' : 'You Rejected'}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              {Number(verification.yesVotes) > 0 && (
                                <div className="text-yellow-400 font-medium">
                                  +{`${Number(verification.yesVotes) / 1e18}`} DATA
                                </div>
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

            <TabsContent value="expired-reviews" className="space-y-6">
              {loading ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => (
                    <Card key={i} className="bg-white/5 backdrop-blur-xl border-white/10 animate-pulse">
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <div className="h-6 bg-white/10 rounded w-1/3"></div>
                          <div className="h-4 bg-white/10 rounded w-2/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : expiredReviews.length === 0 ? (
                <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                  <CardContent className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">No Expired Reviews</h3>
                    <p className="text-white/60">You have voted on all assigned reviews before their deadlines.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {expiredReviews.map((review, index) => (
                    <Card key={`${review.proposalId}-${index}`} className="bg-red-900/20 border-red-500/20">
                      <CardContent className="p-6">
                        <div>
                          <h3 className="font-medium text-white mb-2">{review.title}</h3>
                          <p className="text-white/60 text-sm mb-4">{review.description}</p>
                          <div className="flex items-center justify-between text-sm text-white/60">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                <span>{review.proposer}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                <span className="capitalize">{ContributionTypeText[review.contribType]?.replace('_', ' ')}</span>
                              </div>
                            </div>
                            <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-red-500/20 text-red-400 border-red-500/30">
                              <XCircle className="w-4 h-4 mr-2" />
                              Expired on {format(new Date(Number(review.voteDeadline) * 1000), 'MMM d, yyyy, h:mm:ss a')}
                            </div>
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