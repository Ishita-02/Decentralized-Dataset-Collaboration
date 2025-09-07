"use client"

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User as UserIcon,
  Coins, 
  Award, 
  TrendingUp,
  Database,
  Users,
  ShieldCheck,
  Calendar,
  Download
} from "lucide-react";
import { format } from "date-fns";
import Web3Service from "../components/services/Web3Service";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [userDatasets, setUserDatasets] = useState([]);
  const [userContributions, setUserContributions] = useState([]);
  const [userVerifications, setUserVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const currentUser = await Web3Service.getCurrentUser();
      setUser(currentUser);

      const [datasets, contributions, verifications] = await Promise.all([
        Web3Service.getAllDatasets(),
        Promise.resolve([]),
        Promise.resolve([])
      ]);

      setUserDatasets(datasets);
      setUserContributions(contributions);
      setUserVerifications(verifications);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-white/10 rounded w-48 mb-4"></div>
            <div className="grid md:grid-cols-4 gap-4">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-white/5 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white">
                {user?.full_name?.[0] || user?.email[0].toUpperCase()}
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {user?.full_name || user?.email.split('@')[0]}
                </h1>
                <p className="text-white/60 mb-4">{user?.email}</p>
                
                <div className="flex flex-wrap gap-3">
                  <Badge className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-300 border-blue-500/20">
                    <UserIcon className="w-3 h-3 mr-1" />
                    {user?.role === 'both' ? 'Contributor & Verifier' : user?.role}
                  </Badge>
                  {user?.specializations?.map((spec, index) => (
                    <Badge key={index} variant="outline" className="border-white/20 text-white/70">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2 text-2xl font-bold text-yellow-400 mb-2">
                  <Coins className="w-6 h-6" />
                  {user?.tokens_balance || 0} DCT
                </div>
                <p className="text-white/60 text-sm">Available Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-6 text-center">
              <Database className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">{userDatasets.length}</div>
              <p className="text-white/60 text-sm">Datasets Uploaded</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">{userContributions.length}</div>
              <p className="text-white/60 text-sm">Contributions Made</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-6 text-center">
              <ShieldCheck className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">{userVerifications.length}</div>
              <p className="text-white/60 text-sm">Verifications Done</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-6 text-center">
              <Award className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">{user?.reputation_score || 0}</div>
              <p className="text-white/60 text-sm">Reputation Score</p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Tabs */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardContent className="p-6">
            <Tabs defaultValue="datasets">
              <TabsList className="bg-white/10 mb-6">
                <TabsTrigger value="datasets" className="data-[state=active]:bg-white/20">
                  My Datasets ({userDatasets.length})
                </TabsTrigger>
                <TabsTrigger value="contributions" className="data-[state=active]:bg-white/20">
                  Contributions ({userContributions.length})
                </TabsTrigger>
                <TabsTrigger value="verifications" className="data-[state=active]:bg-white/20">
                  Verifications ({userVerifications.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="datasets" className="space-y-4">
                {userDatasets.length === 0 ? (
                  <div className="text-center py-8">
                    <Database className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/60">No datasets uploaded yet</p>
                  </div>
                ) : (
                  userDatasets.map((dataset) => (
                    <Card key={dataset.id} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-white mb-1">{dataset.title}</h3>
                            <p className="text-white/60 text-sm mb-2">{dataset.description}</p>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="text-xs border-white/20 text-white/70">
                                {dataset.category.replace('_', ' ')}
                              </Badge>
                              <Badge variant="outline" className="text-xs border-white/20 text-white/70">
                                {dataset.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right text-sm text-white/60">
                            <div>{dataset.contributors_count || 0} contributors</div>
                            <div>{dataset.downloads || 0} downloads</div>
                            <div className="text-xs mt-1">
                              {format(new Date(dataset.created_date), 'MMM d, yyyy')}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="contributions" className="space-y-4">
                {userContributions.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/60">No contributions made yet</p>
                  </div>
                ) : (
                  userContributions.map((contribution) => (
                    <Card key={contribution.id} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-white mb-1">{contribution.title}</h3>
                            <p className="text-white/60 text-sm mb-2">{contribution.description}</p>
                            <Badge variant="outline" className="text-xs border-white/20 text-white/70">
                              {contribution.contribution_type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <Badge className={`mb-2 ${
                              contribution.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                              contribution.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            }`}>
                              {contribution.status}
                            </Badge>
                            {contribution.tokens_earned > 0 && (
                              <div className="text-yellow-400 text-sm font-medium">
                                +{contribution.tokens_earned} DCT
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="verifications" className="space-y-4">
                {userVerifications.length === 0 ? (
                  <div className="text-center py-8">
                    <ShieldCheck className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/60">No verifications completed yet</p>
                  </div>
                ) : (
                  userVerifications.map((verification) => (
                    <Card key={verification.id} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-white mb-1">Verification Task</h3>
                            <p className="text-white/60 text-sm mb-2">{verification.feedback}</p>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="text-xs border-white/20 text-white/70">
                                {verification.decision}
                              </Badge>
                              {verification.quality_score && (
                                <Badge variant="outline" className="text-xs border-white/20 text-white/70">
                                  {verification.quality_score}/5 ⭐
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 mb-2">
                              {verification.status}
                            </Badge>
                            {verification.tokens_earned > 0 && (
                              <div className="text-yellow-400 text-sm font-medium">
                                +{verification.tokens_earned} DCT
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}