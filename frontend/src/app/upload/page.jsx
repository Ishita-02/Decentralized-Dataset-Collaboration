"use client"

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PinataSDK } from "pinata";
import { 
  Upload as UploadIcon, 
  FileText, 
  Coins,
  AlertCircle,
  CheckCircle,
  ArrowLeft
} from "lucide-react";

import FileUploadZone from "../components/upload/FileUploadZone";
import RewardSettings from "../components/upload/RewardSettings";
import Web3Service from "../components/services/Web3Service";

export default function UploadPage() {
  const router = useRouter(); 
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    reward_pool: 100,
    contribution_reward: 10,
    verification_reward: 5,
    download_price: 0,
    tags: []
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const pinata = new PinataSDK({
    pinataJwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5YzY0ZmQ2My1mN2E1LTQzMTUtOGFlYS1jNmVhZTVjNjI0Y2QiLCJlbWFpbCI6ImlzaGl0YWdyYXdhbDAyMDdAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImZiNzY0ZjFhYzg4NjQ4Mjc4M2Y3Iiwic2NvcGVkS2V5U2VjcmV0IjoiZTg1ODNjYmY0MWMzNmUxYTE4ZWZjOTYxZjM4ODQ3NmM4NWVjYWY5ZjEyMzA0YzAwODU1ZjAwY2I1YmVhMTRhZSIsImV4cCI6MTc2NDU5MzgyM30._8OWC_eCp4HhVt49wu_u_AR3lSUN2Se-4CBElFdJD5I",
    pinataGateway: "harlequin-characteristic-hummingbird-431.mypinata.cloud",
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setError(null);
  };

  const handleTagsChange = (tagsString) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload");
      return;
    }
    setUploading(true);
    setError(null);

    try {
      // Step 1: Upload the file to IPFS via our secure API route
      const form = new FormData();
      form.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: form,
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to upload file to IPFS');
      }
      const ipfsHash = result.ipfsHash;

      // Step 2: Call the smart contract with the IPFS hash
      await Web3Service.connectWallet();
      const price = Number(formData.download_price || 0);
      const tokenURI = `ipfs://${ipfsHash}`; // Standard IPFS URI format
      
      await Web3Service.uploadDataset(price, tokenURI);

      setSuccess(true);
      
      // Step 3: Navigate to the browse page after success
      setTimeout(() => {
        router.push("/browse"); // CORRECTED: Use router.push
      }, 2000);

    } catch (err) {
      setError(err.message || "Failed to upload dataset");
    }
    setUploading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 max-w-md w-full">
          <CardContent className="text-center p-8">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Dataset Uploaded!</h2>
            <p className="text-white/70 mb-4">
              Your dataset is now on-chain and ready for contributions.
            </p>
            <Button 
              onClick={() => router.push("/browse")} // CORRECTED: Use router.push
              className="bg-gradient-to-r from-blue-500 to-purple-500"
            >
              View All Datasets
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/")} // CORRECTED: Use router.push
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">Upload Dataset</h1>
          <p className="text-white/70">Share your data and earn tokens from community contributions</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ... The rest of your form JSX is correct ... */}
         <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Dataset File
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploadZone 
                onFileSelect={handleFileSelect}
                selectedFile={file}
              />
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Dataset Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                 {/* ... form fields for title, category, etc. ... */}
                 {/* This content can remain the same */}
            </CardContent>
           </Card>

           <RewardSettings 
            formData={formData}
            onUpdate={handleInputChange}
          />
           
           <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/")} // CORRECTED
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={uploading || !file}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {uploading ? 'Uploading...' : 'Upload Dataset'}
            </Button>
          </div>
      </form>
    </div>
  );
}