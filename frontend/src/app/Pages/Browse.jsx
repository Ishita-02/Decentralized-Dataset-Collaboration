import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Database,
  Users,
  Download,
  Coins,
  Eye,
  Plus
} from "lucide-react";
// import { Link } from "react-router-dom";
import { useRouter } from "next/navigation"; 
import { createPageUrl } from "@/components/ui/utils";
import { format } from "date-fns";

import DatasetCard from "../components/browse/DatasetCard";
import Web3Service from "../components/services/Web3Service";

const router = useRouter();


export default function Browse() {
  const [datasets, setDatasets] = useState([]);
  const [filteredDatasets, setFilteredDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const filterAndSortDatasets = useCallback(() => {
    let filtered = datasets.filter(dataset => {
      const matchesSearch = dataset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dataset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dataset.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === "all" || dataset.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort datasets
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_date) - new Date(a.created_date);
        case 'oldest':
          return new Date(a.created_date) - new Date(b.created_date);
        case 'most_downloaded':
          return (b.downloads || 0) - (a.downloads || 0);
        case 'highest_reward':
          return (b.contribution_reward || 0) - (a.contribution_reward || 0);
        default:
          return 0;
      }
    });

    setFilteredDatasets(filtered);
  }, [datasets, searchTerm, selectedCategory, sortBy]);

  useEffect(() => {
    loadDatasets();
  }, []);

  useEffect(() => {
    filterAndSortDatasets();
  }, [filterAndSortDatasets]);

  const loadDatasets = async () => {
    try {
      const data = await Web3Service.getAllDatasets();
      setDatasets(data);
    } catch (error) {
      console.error("Error loading datasets:", error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold text-white">
            Discover
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {" "}Datasets
            </span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Find datasets to contribute to and earn tokens for improving data quality
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                <Input
                  placeholder="Search datasets, tags, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              
              <div className="flex gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="machine_learning">ML</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="most_downloaded">Most Downloaded</SelectItem>
                    <SelectItem value="highest_reward">Highest Reward</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <p className="text-white/60 text-sm">
                {filteredDatasets.length} dataset{filteredDatasets.length !== 1 ? 's' : ''} found
              </p>
              <Button
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                onClick={() => router.push(createPageUrl("Upload"))}
              >
                <Plus className="w-4 h-4 mr-2" />
                Upload Dataset
              </Button>
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
                    <div className="h-4 bg-white/10 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredDatasets.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Database className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No datasets found</h3>
              <p className="text-white/60 mb-6">
                Try adjusting your search terms or filters
              </p>
              <Button
                className="bg-gradient-to-r from-blue-500 to-purple-500"
                onClick={() => router.push(createPageUrl("Upload"))}
              >
                <Plus className="w-4 h-4 mr-2" />
                Upload First Dataset
              </Button>
            </div>
          ) : (
            filteredDatasets.map((dataset) => (
              <DatasetCard key={dataset.id} dataset={dataset} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}