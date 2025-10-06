import React, { useState } from "react";
import { UploadFile } from "../../integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload,
  FileText,
  X,
  AlertCircle,
  Coins
} from "lucide-react";
import { PinataSDK } from "pinata";

export default function ContributeForm({ dataset, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contribution_type: "",
    file_url: ""
  });

  const pinataGateway = "harlequin-characteristic-hummingbird-431.mypinata.cloud";

  const pinata = new PinataSDK({
    pinataJwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5YzY0ZmQ2My1mN2E1LTQzMTUtOGFlYS1jNmVhZTVjNjI0Y2QiLCJlbWFpbCI6ImlzaGl0YWdyYXdhbDAyMDdAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImZiNzY0ZjFhYzg4NjQ4Mjc4M2Y3Iiwic2NvcGVkS2V5U2VjcmV0IjoiZTg1ODNjYmY0MWMzNmUxYTE4ZWZjOTYxZjM4ODQ3NmM4NWVjYWY5ZjEyMzA0YzAwODU1ZjAwY2I1YmVhMTRhZSIsImV4cCI6MTc2NDU5MzgyM30._8OWC_eCp4HhVt49wu_u_AR3lSUN2Se-4CBElFdJD5I",
    pinataGateway: pinataGateway,
  });


  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];// Standard IPFS URI format

    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError(null);

    try {
      if (!file) {
        throw new Error("Please select a file to upload");
      }

      const upload = await pinata.upload.public.file(file);
      
      
      if (!upload) {
        throw new Error('Failed to upload file to IPFS');
      }
      const ipfsHash = upload.cid;

      const tokenURI = `https://${pinataGateway}/ipfs/${ipfsHash}?pinataGatewayToken=UhHUR8T7QBjicM5i3ctXsWy89BJ0LHliIaURM3V7j6dhAospZY3pXepcgALAPk9d`; 
      await onSubmit({
        ...formData,
        tokenURI
      });
    } catch (error) {
      setError(error.message || "Failed to submit contribution");
    }
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-white/5 backdrop-blur-xl border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">Contribute to Dataset</CardTitle>
            <p className="text-white/60 text-sm mt-1">{dataset.title}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Reward Info */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-medium">Potential Reward</span>
            </div>
            <p className="text-yellow-400 text-lg font-bold">
              {dataset.contribution_reward} DATA tokens
            </p>
            <p className="text-yellow-300/70 text-sm">
              Earned upon approval by verifiers
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-white">Contribution Title *</Label>
              <Input
                required
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                placeholder="Brief title for your contribution"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Contribution Type *</Label>
              <Select 
                value={formData.contribution_type} 
                onValueChange={(value) => handleInputChange('contribution_type', value)}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select contribution type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="data_addition">Data Addition</SelectItem>
                  <SelectItem value="data_cleaning">Data Cleaning</SelectItem>
                  <SelectItem value="annotation">Annotation</SelectItem>
                  <SelectItem value="validation">Validation</SelectItem>
                  <SelectItem value="documentation">Documentation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Description *</Label>
              <Textarea
                required
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-24"
                placeholder="Describe what you're contributing and how it improves the dataset"
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label className="text-white">Upload Your Contribution *</Label>
              <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-200">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".csv,.json,.txt,.xlsx,.xls,.pdf"
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {file ? (
                    <div className="flex items-center gap-3 justify-center">
                      <FileText className="w-8 h-8 text-green-400" />
                      <div>
                        <p className="font-medium text-white">{file.name}</p>
                        <p className="text-sm text-white/60">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <p className="text-white font-medium">Click to upload file</p>
                      <p className="text-white/60 text-sm mt-1">
                        CSV, JSON, TXT, XLSX, PDF files supported
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={uploading || !file}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Submit Contribution
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}