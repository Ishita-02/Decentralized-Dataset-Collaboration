// ### File: src/app/browse/page.jsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  Database,
  Plus
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Web3Service from "../components/services/Web3Service"; // Your Web3 service
import DatasetCard from "../components/browse/DatasetCard"; // Your DatasetCard component

export default function BrowsePage() {
  const [datasets, setDatasets] = useState([]);
  const [filteredDatasets, setFilteredDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  // Add other filters as needed

  // Fetch data directly from the smart contract
  const loadDatasets = async () => {
    setLoading(true);
    try {
      // This now calls your Web3Service to read from the blockchain
      const contractDatasets = await Web3Service.getAllDatasets();
      // We need to fetch metadata for each dataset from IPFS/API
      // For now, we'll just display what we have from the contract
      const formattedDatasets = contractDatasets.map(d => ({
          ...d,
          title: `Dataset #${d.id}`, // Placeholder title
          description: `IPFS URI: ${d.currentURI}`, // Placeholder description
      }));
      setDatasets(formattedDatasets);
      setFilteredDatasets(formattedDatasets);
    } catch (error) {
      console.error("Error loading datasets:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDatasets();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = datasets.filter(d => 
      d.title.toLowerCase().includes(term) || 
      d.description.toLowerCase().includes(term)
    );
    setFilteredDatasets(filtered);
  };
  
  return (
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
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-white/40" />
              <Input
                placeholder="Search datasets..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            {/* Add more filter dropdowns here if needed */}
        </CardContent>
      </Card>

      {/* Datasets Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-white/70 col-span-full text-center">Loading datasets from the blockchain...</p>
        ) : filteredDatasets.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Database className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No datasets found</h3>
          </div>
        ) : (
          filteredDatasets.map((dataset) => (
            <DatasetCard key={dataset.id} dataset={dataset} />
          ))
        )}
      </div>
    </div>
  );
}