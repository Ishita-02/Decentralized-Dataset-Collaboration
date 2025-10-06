"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Database, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Web3Service from "../components/services/Web3Service";
import DatasetCard from "../components/browse/DatasetCard";
import { useWeb3 } from "../context/Web3Provider";
import { useRouter } from "next/navigation"; 
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/components/ui/utils";



export default function BrowsePage() {
  const [datasets, setDatasets] = useState([]);
  const [filteredDatasets, setFilteredDatasets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [favoriteStatus, setFavoriteStatus] = useState(new Map());
  const [isFetching, setIsFetching] = useState(true);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(new Set());

  const { account, isLoading } = useWeb3();

  const router = useRouter();

  const checkIfFavorited = async (datasetId) => {
    try {
      const isFavorited = await Web3Service.userFavorites(datasetId);
      console.log(`Dataset ${datasetId} favorite status:`, isFavorited);
      return isFavorited;
    } catch (error) {
      console.error(`Error checking favorite status for dataset ${datasetId}:`, error);
      return false;
    }
  };

  const loadFavoriteStatus = async (datasetList) => {
    if (!account || !datasetList.length) return;

    console.log("Loading favorite status for all datasets...");
    const statusMap = new Map();

    const favoritePromises = datasetList.map(async (dataset) => {
      const isFavorited = await checkIfFavorited(dataset.id);
      statusMap.set(dataset.id, isFavorited);
      return { id: dataset.id, isFavorited };
    });

    try {
      await Promise.all(favoritePromises);
      console.log("All favorite statuses loaded:", statusMap);
      setFavoriteStatus(statusMap);
    } catch (error) {
      console.error("Error loading favorite statuses:", error);
    }
  };
  

  const handleToggleFavorite = async (datasetId) => {
    console.log(`Toggling favorite for dataset ID: ${datasetId}`);
    
    if (isTogglingFavorite.has(datasetId)) {
      console.log("Already toggling favorite for this dataset, ignoring...");
      return;
    }

    setIsTogglingFavorite(prev => new Set([...prev, datasetId]));

    try {
      const result = await Web3Service.toggleFavourite(datasetId);
      console.log("Toggle result from contract:", result);

      if (typeof result === 'boolean') {
        console.log(`Successfully ${result ? 'added to' : 'removed from'} favorites!`);
        
        setTimeout(() => {
          console.log("Refreshing page to reflect changes...");
          window.location.reload();
        }, 1000); 
        
      } else {
        console.error("Unexpected result from contract:", result);
        throw new Error("Invalid response from contract");
      }

    } catch (error) {
      console.error("Error toggling favorite status:", error);
      
      setIsTogglingFavorite(prev => {
        const newSet = new Set(prev);
        newSet.delete(datasetId);
        return newSet;
      });

      alert(`Failed to update favorite status: ${error.message || 'Unknown error'}`);
    }    
  };

  const loadData = useCallback(async () => {
    if (!account) return;
    setIsFetching(true);
    
    try {
      console.log("Loading datasets for account:", account);
      
      const contractDatasets = await Web3Service.getAllDatasets();
      console.log("Contract datasets fetched:", contractDatasets);
      
      setDatasets(contractDatasets);
      setFilteredDatasets(contractDatasets);

      await loadFavoriteStatus(contractDatasets);

    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsFetching(false);
    }
  }, [account]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = datasets.filter(d => 
      d.title.toLowerCase().includes(term) || 
      d.description.toLowerCase().includes(term)
    );
    setFilteredDatasets(filtered);
  };

  useEffect(() => {
    if (!isLoading && account) {
      console.log("Provider is ready. Loading data for account:", account);
      loadData();
    } else if (!isLoading && !account) {
      console.log("Provider finished loading, but no wallet connected.");
      setIsFetching(false);
      setDatasets([]);
      setFilteredDatasets([]);
    }
  }, [account, isLoading, loadData]);

  useEffect(() => {
    if (!isLoading && account) {
      console.log("Provider is ready. Loading data for account:", account);
      loadData();
    } else if (!isLoading && !account) {
      console.log("Provider finished loading, but no wallet connected.");
      setIsFetching(false);
      setDatasets([]);
      setFilteredDatasets([]);
      setFavoriteStatus(new Map());
    }
  }, [account, isLoading, loadData]);


  return (
    <div className="max-w-7xl mx-auto space-y-8">

      <div className="mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(createPageUrl("/"))}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>
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
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isFetching ? (
          <p className="text-white/70 col-span-full text-center">Loading datasets from the blockchain...</p>
        ) : filteredDatasets.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Database className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No datasets found</h3>
          </div>
        ) : (
          filteredDatasets.map((dataset) => {
            const isFavorited = favoriteStatus.get(dataset.id) || false;
            const isToggling = isTogglingFavorite.has(dataset.id);
            
            return (
              <DatasetCard 
                key={dataset.id} 
                dataset={dataset}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={isFavorited}
                isToggling={isToggling} 
              />
            );
          })
        )}
      </div>
    </div>
  );
}
