import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckCircle,
  XCircle,
  ExternalLink,
  FileText,
  Calendar,
  User,
  Coins
} from "lucide-react";
import { format } from "date-fns";

export default function VerificationCard({ contribution, onVote }) {
  const [feedback, setFeedback] = useState("");
  const [voting, setVoting] = useState(false);

  const handleVote = async (approve) => {
    setVoting(true);
    try {
      await onVote(contribution.id, contribution.proposal_id, approve);
    } catch (error) {
      console.error("Error voting:", error);
    }
    setVoting(false);
  };

  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-white text-lg mb-2">{contribution.title}</CardTitle>
            <p className="text-white/60 text-sm mb-3">{contribution.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-white/60">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{contribution.contributor}</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span className="capitalize">{contribution.contribution_type?.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(contribution.created_date), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>
          
          {contribution.file_url && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
            >
              <a href={contribution.file_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                View File
              </a>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Reward Info */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-medium">Verification Reward</span>
            <Badge className="bg-yellow-400/20 text-yellow-300 border-yellow-400/30">
              5 DCT
            </Badge>
          </div>
        </div>

        {/* Feedback Input */}
        <div className="space-y-2">
          <label className="text-white text-sm font-medium">Review Feedback (Optional)</label>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-20"
            placeholder="Provide feedback on the contribution quality..."
          />
        </div>

        {/* Voting Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={() => handleVote(false)}
            disabled={voting}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
          >
            <XCircle className="w-4 h-4 mr-2" />
            {voting ? 'Voting...' : 'Reject'}
          </Button>
          <Button
            onClick={() => handleVote(true)}
            disabled={voting}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {voting ? 'Voting...' : 'Approve'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}