"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, ShieldCheck, ShoppingCart, Eye, ArrowLeft, Users, FileText } from "lucide-react";
import Web3Service from '../../components/services/Web3Service';
import { format } from "date-fns";
import { useWeb3 } from '../../context/Web3Provider'; // Import global web3 context

export default function DatasetDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const rawId = params.id;
  console.log("Raw ID from params:", rawId);
  
  let id;
  if (rawId.includes('=') || rawId.includes('%3D')) {
    const decodedId = decodeURIComponent(rawId);
    console.log("Decoded ID:", decodedId);
    
    if (decodedId.includes('=')) {
      id = decodedId.split('=')[1];
    } else {
      id = decodedId;
    }
  } else {
    id = rawId;
  }
  
  console.log("Final parsed ID:", id);

  const { account } = useWeb3();

  const [dataset, setDataset] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false); 

  useEffect(() => {
    if (!id) return;
    
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {

        console.log("dataset id", id)
        let [details, ipfsUrl] = await Promise.all([
          Web3Service.getDatasetById(id),
          Web3Service.getUserDatasetCurrentId(id)
        ]);

        setDataset(details);
        console.log("Dataset Details:", details);
        console.log("IPFS URL:", ipfsUrl);

        if (ipfsUrl) {
          const response = await fetch(ipfsUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
          }
          const csvText = await response.text();
          const parsedData = parseCsvData(csvText);
          setPreviewData(parsedData);
          console.log("Parsed Preview Data:", parsedData);
        }
    
      } catch (err) {
        setError("Failed to load dataset details. Please check the ID and your connection.");
        console.error(err);
      }
      setIsLoading(false);
    };

    if (id && account) {
      loadData();
    }
  }, [id, account]);

  const PREVIEW_ROW_LIMIT = 20;

  const parseCsvData = (csvText) => {
    if (!csvText || typeof csvText !== 'string') {
      return { header: [], rows: [] };
    }
    const lines = csvText.trim().split('\n');
    const header = lines.length > 0 ? lines[0].split(',') : [];
    const rows = lines.slice(1).map(line => line.split(','));
    return { header, rows };
  };

  const handlePurchaseDataset = async () => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    if (!dataset || !id) {
      alert("Dataset information not available");
      return;
    }

    setIsPurchasing(true);
    try {
      console.log("Purchasing dataset with ID:", dataset);
      
      await Web3Service.approveTokenSpend(dataset.price )
      const tx = await Web3Service.purchaseDataset(id);
      
      console.log("Purchase transaction:", tx);
      alert("Dataset purchased successfully! You can now download it.");
      
      if (dataset.currentURI) {
        window.open(dataset.currentURI, '_blank');
      }
      
    } catch (err) {
      console.error("Purchase failed:", err);
      alert(`Failed to purchase dataset: ${err.message || 'Unknown error'}`);
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) return <p className="text-center text-white/70 py-10">Loading dataset from the blockchain...</p>;
  if (error) return <p className="text-center text-red-500 py-10">{error}</p>;
  if (!dataset) return <p className="text-center text-white/70 py-10">Dataset not found.</p>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-4xl font-bold text-white">{dataset.title}</h1>
          <p className="text-white/60 mt-1">Uploaded on {format(new Date(Number(dataset.createdAt) * 1000), 'MMM d, yyyy')}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-white">Dataset Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div><strong className="text-white/80">Creator:</strong> <span className="text-white/60 font-mono text-xs">{`${dataset.creator}`}</span></div>
              <div><strong className="text-white/80">Price:</strong> <span className="text-yellow-400 font-bold">{`${Number(dataset.price) / 1e18}`} DATA</span></div>
              <div><strong className="text-white/80">MIME Type:</strong> <span className="text-white/60">{dataset.mimeType}</span></div>
              <div><strong className="text-white/80">File Size:</strong> <span className="text-white/60">{`${(Number(dataset.size) / (1000000)).toFixed(2)}`} MB</span></div>
              <div><strong className="text-white/80">Storage:</strong> <a href={`${dataset.currentURI}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">View on IPFS</a></div>
            </CardContent>
          </Card>

          {/* Tabs for Preview and History */}

          <Tabs defaultValue="preview">
            <TabsList className="bg-white/10">
              <TabsTrigger value="preview">Dataset Preview</TabsTrigger>
              <TabsTrigger value="history">Contribution History</TabsTrigger>
            </TabsList>
            <TabsContent value="preview">
              <Card>
                <CardContent className="p-2 sm:p-4 overflow-x-auto">
                  {previewData && previewData.header.length > 0 ? (
                    <>
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-white/70 uppercase bg-white/5">
                          <tr>
                            {previewData.header.map((h, i) => <th key={i} className="px-4 py-2 font-medium">{h.trim()}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {/* Use .slice() to create a new array with just the first 20 rows.
                            This prevents the slow rendering of thousands of elements.
                          */}
                          {previewData.rows.slice(0, PREVIEW_ROW_LIMIT).map((row, i) => (
                            <tr key={i} className="border-b border-white/10">
                              {row.map((cell, j) => <td key={j} className="px-4 py-2 text-white/90">{cell.trim()}</td>)}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {/* Add a helpful message to the user if the data is truncated.
                      */}
                      {previewData.rows.length > PREVIEW_ROW_LIMIT && (
                        <p className="text-xs text-white/50 text-center mt-4">
                          Showing the first {PREVIEW_ROW_LIMIT} rows of {previewData.rows.length} total.
                        </p>
                      )}
                    </>
                  ) : <p className="text-white/60 text-center py-8">No data preview is available for this dataset.</p>}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="history">
              <Card>
                <CardContent>
                  <p className="text-white/60 text-center py-8">Contribution history coming soon.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Actions Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader><CardTitle className="text-white">Actions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {/* <Button disabled={!account} className="w-full bg-gradient-to-r from-green-500 to-emerald-500"><Users className="w-4 h-4 mr-2" /> Propose Contribution</Button>
              <Button disabled={!account} className="w-full bg-gradient-to-r from-purple-500 to-pink-500"><ShieldCheck className="w-4 h-4 mr-2" /> Vote on Proposal</Button> */}
              <Button 
                disabled={!account || isPurchasing} 
                onClick={handlePurchaseDataset}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500"
              >
                <ShoppingCart className="w-4 h-4 mr-2" /> 
                {isPurchasing ? "Processing..." : "Purchase & Download"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}