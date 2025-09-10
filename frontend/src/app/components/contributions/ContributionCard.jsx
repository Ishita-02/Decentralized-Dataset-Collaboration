import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  Coins,
  Calendar
} from "lucide-react";
import { format } from "date-fns";

const ContributionType = {
  data_cleaning: 0,
  data_addition: 1,
  annotation: 2,
  validation: 3,
  documentation: 4,
};

// This array maps numbers back to string names for displaying data FROM the contract
const ContributionTypeText = [
  "data_cleaning",
  "data_addition",
  "annotation",
  "validation",
  "documentation",
];

const contributionStatus = [
  "pending",
  "reviewed"
]

export default function ContributionCard({ key, contribution }) {
  console.log("contribution card", contributionStatus[contribution.status])
  const getStatusIcon = () => {
    switch (contributionStatus[contribution.status]) {
      case 'reviewed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-blue-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusColor = () => {
    switch (contributionStatus[contribution.status]) {
      case 'approved':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'pending':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    }
  };


  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-white text-lg">{contribution.title}</CardTitle>
              <Badge variant="outline" className={getStatusColor()}>
                {getStatusIcon()}
                <span className="ml-2 capitalize">{contributionStatus[contribution.status]}</span>
              </Badge>
            </div>
            <p className="text-white/60 text-sm">{contribution.description}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-white/60">
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span className="capitalize">{ContributionTypeText[contribution.contribType]?.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(Number(contribution.voteDeadline) * 1000), 'MMM d, yyyy')}</span>
            </div>
          </div>
          
          {contribution.proposedURI && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
            >
              <a href={contribution.proposedURI} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                View File
              </a>
            </Button>
          )}
        </div>

        {contribution.status === 'approved' && contribution.tokens_earned > 0 && (
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-green-400" />
                <span className="text-white font-medium">Reward Earned</span>
              </div>
              <span className="text-green-400 font-bold">
                {contribution.tokens_earned} DCT
              </span>
            </div>
          </div>
        )}

        {contribution.verification_feedback && (
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-white/70 text-sm font-medium mb-1">Verifier Feedback:</p>
            <p className="text-white/60 text-sm">{contribution.verification_feedback}</p>
            {contribution.quality_score && (
              <div className="flex items-center gap-1 mt-2">
                <span className="text-white/60 text-sm">Quality Score:</span>
                <span className="text-yellow-400 font-medium">
                  {contribution.quality_score}/5 ⭐
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}