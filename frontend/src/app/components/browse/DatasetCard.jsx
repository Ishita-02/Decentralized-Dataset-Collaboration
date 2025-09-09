import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Download, 
  Coins,
  Calendar,
  FileText,
  Eye,
  Plus,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
// import { Link } from "react-router-dom";
import { useRouter } from "next/navigation"; 
import { createPageUrl } from "@/components/ui/utils";

export default function DatasetCard({ dataset }) {
  console.log("dataset from DatasetCard", dataset)
  const getCategoryColor = (category) => {
    const colors = {
      machine_learning: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      finance: "bg-green-500/10 text-green-400 border-green-500/20",
      healthcare: "bg-red-500/10 text-red-400 border-red-500/20",
      research: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      education: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      marketing: "bg-pink-500/10 text-pink-400 border-pink-500/20",
      other: "bg-gray-500/10 text-gray-400 border-gray-500/20"
    };
    return colors[category] || colors.other;
  };

  const getStatusColor = (status) => {
    const colors = {
      open_for_contributions: "bg-green-500/10 text-green-400 border-green-500/20",
      under_verification: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      verified: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      published: "bg-purple-500/10 text-purple-400 border-purple-500/20"
    };
    return colors[status] || colors.open_for_contributions;
  };
  const router = useRouter();

  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300 group">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className={getCategoryColor(dataset.category)}>
            {dataset.category.replace('_', ' ')}
          </Badge>
          {/* <Badge variant="outline" className={getStatusColor(dataset.status)}>
            {dataset.status.replace('_', ' ')}
          </Badge> */}
        </div>
        <CardTitle className="text-white text-lg group-hover:text-blue-300 transition-colors">
          {dataset.title}
        </CardTitle>
        <p className="text-white/60 text-sm line-clamp-2">
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
            {dataset.contributors_count || 0}
          </div>
          <div className="flex items-center gap-1 text-white/60">
            <Download className="w-3 h-3" />
            {dataset.downloads || 0}
          </div>
          <div className="flex items-center gap-1 text-white/60">
            <FileText className="w-3 h-3" />
            {dataset.size ? `${dataset.size / 1e6} MB` : 'N/A'}
          </div>
        </div>

        {/* Reward Info */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="text-white text-sm font-medium">
                {dataset.contribution_reward} DATA per contribution
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
       <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1 w-full border-white/20 text-white hover:bg-white/10 text-sm"
            onClick={() => router.push(`${createPageUrl("Dataset")}?id=${dataset.id}`)}
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          
          {dataset.status === 'open_for_contributions' && (
            <Button
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-sm"
              onClick={() => router.push(`${createPageUrl("Contribute")}?dataset=${dataset.id}`)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Contribute
            </Button>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-white/40 pt-2 border-t border-white/10">
          <span>By {dataset.owner?.split('@')[0]}</span>
          <span>{format(new Date(dataset.created_date), 'MMM d, yyyy')}</span>
        </div>
      </CardContent>
    </Card>
  );
}