import React, { useState } from "react";
import { Dataset, User } from "@/entities/all";
import { UploadFile } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload as UploadIcon, 
  FileText, 
  Coins,
  AlertCircle,
  CheckCircle,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/components/utils";

import FileUploadZone from "../components/upload/FileUploadZone";
import RewardSettings from "../components/upload/RewardSettings";

export default function Upload() {
  const navigate = useNavigate();
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
    setUploading(true);
    setError(null);

    try {
      const user = await User.me();

      if (!file) {
        throw new Error("Please select a file to upload");
      }

      // Upload file
      const { file_url } = await UploadFile({ file });

      // Calculate file size
      const size_mb = (file.size / (1024 * 1024)).toFixed(2);

      // Create dataset
      const dataset = await Dataset.create({
        ...formData,
        owner: user.email,
        file_url,
        file_type: file.type,
        size_mb: parseFloat(size_mb),
        status: "open_for_contributions"
      });

      setSuccess(true);
      
      // Navigate to browse page after success
      setTimeout(() => {
        navigate(createPageUrl("Browse"));
      }, 2000);

    } catch (error) {
      setError(error.message || "Failed to upload dataset");
    }
    setUploading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 max-w-md w-full">
          <CardContent className="text-center p-8">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Dataset Uploaded!</h2>
            <p className="text-white/70 mb-4">
              Your dataset is now live and ready for contributions.
            </p>
            <Button 
              onClick={() => navigate(createPageUrl("Browse"))}
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
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
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
          {/* File Upload */}
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

          {/* Dataset Information */}
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Dataset Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white">Dataset Title *</Label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    placeholder="Enter dataset title"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="machine_learning">Machine Learning</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Description *</Label>
                <Textarea
                  required
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-24"
                  placeholder="Describe your dataset, its purpose, and how contributors can help improve it"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Tags (comma-separated)</Label>
                <Input
                  value={formData.tags.join(', ')}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  placeholder="e.g., nlp, sentiment-analysis, social-media"
                />
              </div>
            </CardContent>
          </Card>

          {/* Reward Settings */}
          <RewardSettings 
            formData={formData}
            onUpdate={handleInputChange}
          />

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(createPageUrl("Dashboard"))}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={uploading || !file}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Upload Dataset
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}