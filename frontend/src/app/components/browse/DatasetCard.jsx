import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Download, 
  Coins,
  FileText,
  Eye,
  Plus,
  Star, // Make sure Star is imported,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation"; 
import { createPageUrl } from "@/components/ui/utils";

// UPDATED: The component now accepts the onToggleFavorite and isFavorite props
export default function DatasetCard({ dataset, onToggleFavorite, isFavorite, isToggling  }) {

  console.log("DatasetCard props:", { 
        datasetId: dataset?.id, 
        hasToggleFunction: typeof onToggleFavorite === 'function',
        isFavorite 
    });
  const router = useRouter();

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

  const handleFavoriteClick = (e) => {
    console.log("=== FAVORITE BUTTON CLICKED ===");
    console.log("Dataset ID:", dataset.id);
    console.log("Current isFavorite:", isFavorite);
    console.log("Is toggling:", isToggling);
    
    // Prevent the click from bubbling up and triggering navigation
    e.stopPropagation(); 
    e.preventDefault();
    
    // Don't allow clicking if already toggling
    if (isToggling) {
      console.log("Already toggling, ignoring click");
      return;
    }
    
    // Call the function passed down from the parent page
    if (typeof onToggleFavorite === 'function') {
      console.log("Calling onToggleFavorite...");
      onToggleFavorite(dataset.id);
    } else {
      console.error("onToggleFavorite is not a function:", typeof onToggleFavorite);
    }
  };

 return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300 group">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(dataset.category)}`}>
            {dataset.category.replace('_', ' ')}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavoriteClick}
            disabled={isToggling} 
            className={`
              h-8 w-8 -mt-1 -mr-2 transition-all duration-200
              ${isToggling 
                ? 'text-white/30 cursor-not-allowed' 
                : isFavorite 
                  ? 'text-yellow-400 hover:text-yellow-300' 
                  : 'text-white/60 hover:text-yellow-400'
              }
              hover:bg-white/10
            `}
            aria-label={`${isFavorite ? 'Remove from' : 'Add to'} favorites`}
            data-dataset-id={dataset.id}
          >
            {isToggling ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Star 
                className={`
                  w-5 h-5 transition-all duration-200
                  ${isFavorite 
                    ? 'text-yellow-400 fill-yellow-400 drop-shadow-sm' 
                    : 'text-current'
                  }
                `} 
              />
            )}
          </Button>
        </div>
        
        <CardTitle className="text-white text-lg group-hover:text-blue-300 transition-colors">
          {dataset.title}
        </CardTitle>
        <p className="text-white/60 text-sm line-clamp-2">
          {dataset.description}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
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
            {dataset.size ? `${Number(dataset.size / 1e6).toFixed(2)} MB` : 'N/A'}
          </div>
        </div>

        {/* Reward Info */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="text-white text-sm font-medium">
                {(Number(dataset.contribution_reward) || '0')} DATA per contribution
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1 w-full border-white/20 text-white hover:bg-white/10 text-sm"
            onClick={() => router.push(`${createPageUrl("Dataset")}/id=${dataset.id}`)}
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
          <span>By {dataset.owner}</span>
          <span>{format(new Date(dataset.created_date), 'MMM d, yyyy')}</span>
        </div>
      </CardContent>
    </Card>
  );
}

