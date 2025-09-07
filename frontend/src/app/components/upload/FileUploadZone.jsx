import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  FileText, 
  X,
  Database
} from "lucide-react";

export default function FileUploadZone({ onFileSelect, selectedFile }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeFile = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept=".csv,.json,.txt,.xlsx,.xls"
        className="hidden"
      />
      
      {selectedFile ? (
        <div className="border-2 border-dashed border-green-500/30 rounded-xl p-6 bg-green-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="font-medium text-white">{selectedFile.name}</p>
                <p className="text-sm text-white/60">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={removeFile}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-200 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
            <Database className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Upload Your Dataset</h3>
          <p className="text-white/60 mb-4">
            Drag and drop your file here, or click to browse
          </p>
          <Button
            type="button"
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Upload className="w-4 h-4 mr-2" />
            Choose File
          </Button>
          <p className="text-xs text-white/40 mt-4">
            Supports CSV, JSON, TXT, XLSX files up to 100MB
          </p>
        </div>
      )}
    </div>
  );
}