"use client"


import React, { useState, useEffect, useCallback } from "react";
import Web3 from "web3";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Download,
  Search,
  Coins,
  FileText,
  Calendar,
  Users,
  ArrowLeft,
  ExternalLink,
  ShoppingCart
} from "lucide-react";
import { useRouter } from "next/navigation"; 
import { createPageUrl } from "@/components/ui/utils";
import { format } from "date-fns";
import Web3Service from "../components/services/Web3Service";

export default function Downloads() {
  const [datasets, setDatasets] = useState([]);
  const [filteredDatasets, setFilteredDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [purchasing, setPurchasing] = useState({});

  const router = useRouter();

  const filterDatasets = useCallback(() => {
    const filtered = datasets.filter(dataset =>
      dataset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dataset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dataset.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredDatasets(filtered);
  }, [datasets, searchTerm]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterDatasets();
  }, [filterDatasets]);

  const loadData = async () => {
    try {
      await Web3Service.init();

      const currentUser = await Web3Service.getCurrentUser();
      console.log("current user from downloads", currentUser)
      setUser(currentUser);

      // Load verified and published datasets available for download
      const data = await Web3Service.getAllDatasets();
      console.log("data from getAllDatasets", data)
      setDatasets(data);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handlePurchase = async (dataset) => {
    setPurchasing(prev => ({ ...prev, [dataset.id]: true }));
    
    try {
      if (dataset.download_price === 0) {
        window.open(dataset.file_url, '_blank');
      } else {
       
        await Web3Service.approveTokenSpend(dataset.download_price * 1e18 *1e18)
        console.log("dataset", dataset)
        await Web3Service.purchaseDataset(dataset.id);
        window.open(dataset.file_url, '_blank');
      }
      
      loadData();
    } catch (error) {
      console.error("Error purchasing dataset:", error);
      alert("Failed to purchase dataset. Please try again.");
    }
    
    setPurchasing(prev => ({ ...prev, [dataset.id]: false }));
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(createPageUrl("Dashboard"))}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Dataset Marketplace</h1>
            <p className="text-white/70">Download high-quality, verified datasets</p>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-white/40" />
              <Input
                placeholder="Search datasets by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 text-lg py-6"
              />
            </div>
            <div className="flex justify-between items-center mt-4">
              <p className="text-white/60 text-sm">
                {filteredDatasets.length} dataset{filteredDatasets.length !== 1 ? 's' : ''} available
              </p>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span>Your Balance: {user?.tokens_balance / 1e18 || 0} DATA</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Datasets Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <Card key={i} className="bg-white/5 backdrop-blur-xl border-white/10 animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-white/10 rounded mb-2"></div>
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-white/10 rounded"></div>
                    <div className="h-10 bg-white/10 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredDatasets.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Download className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No datasets found</h3>
              <p className="text-white/60 mb-6">
                Try adjusting your search terms
              </p>
            </div>
          ) : (
            filteredDatasets.map((dataset) => (
              <Card key={dataset.id} className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                      {dataset.category.replace('_', ' ')}
                    </Badge>
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                      Verified
                    </Badge>
                  </div>
                  <CardTitle className="text-white text-lg group-hover:text-blue-300 transition-colors">
                    {dataset.title}
                  </CardTitle>
                  <p className="text-white/60 text-sm line-clamp-3">
                    {dataset.description}
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Tags */}
                  {dataset.tags && dataset.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {dataset.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-white/5 text-white/70 border-white/10">
                          {tag}
                        </Badge>
                      ))}
                      {dataset.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs bg-white/5 text-white/40 border-white/10">
                          +{dataset.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="flex items-center gap-1 text-white/60">
                      <Users className="w-3 h-3" />
                      <span>{dataset.contributors_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-white/60">
                      <Download className="w-3 h-3" />
                      <span>{dataset.downloads || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-white/60">
                      <FileText className="w-3 h-3" />
                      <span>{dataset.size ? `${(dataset.size / 1e6).toFixed(2)} MB` : 'N/A'}</span>
                    </div>
                  </div>

                  {/* Price & Download */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className="text-white font-medium">
                          {dataset.download_price === 0 ? 'Free' : `${dataset.download_price} DATA`}
                        </span>
                      </div>
                      {dataset.download_price > 0 && (
                        <span className="text-white/60 text-sm">
                          ~${(dataset.download_price * 0.05).toFixed(2)}
                        </span>
                      )}
                    </div>

                    <Button
                      onClick={() => handlePurchase(dataset)}
                      disabled={purchasing[dataset.id] || (dataset.download_price > (user?.tokens_balance || 0) && dataset.download_price > 0)}
                      className={`w-full ${
                        dataset.download_price === 0
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                          : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                      }`}
                    >
                      {purchasing[dataset.id] ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Processing...
                        </>
                      ) : dataset.download_price === 0 ? (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download Free
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Purchase & Download
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-white/40 pt-2 border-t border-white/10">
                    <span>By {dataset.owner?.split('@')[0]}</span>
                    <span>{format(new Date(dataset.created_date), 'MMM d, yyyy')}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}