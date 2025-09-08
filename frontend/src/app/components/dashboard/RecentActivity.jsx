import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  ShieldCheck, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecentActivity({ activity, isLoading }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'pending':
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-blue-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'pending':
      case 'in_progress':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-white/5">
                <Skeleton className="w-10 h-10 rounded-full bg-white/10" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32 bg-white/10" />
                  <Skeleton className="h-3 w-48 bg-white/10" />
                  <Skeleton className="h-3 w-24 bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ) : activity.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/60">No recent activity</p>
            <p className="text-white/40 text-sm mt-1">Start contributing or verifying to see activity here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activity.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  {item.type === 'contribution' ? (
                    <Users className="w-5 h-5 text-white" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-white">
                      {item.type === 'contribution' ? item.title : 'Verification Task'}
                    </p>
                    <Badge variant="outline" className={`text-xs ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span className="ml-1 capitalize">{item.status}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-white/60 mb-2">
                    {item.type === 'contribution' 
                      ? `${item.contribution_type?.replace('_', ' ')} • ${item.tokens_earned || 0} DATA earned`
                      : `Review completed • ${item.tokens_earned || 0} DATA earned`
                    }
                  </p>
                  <p className="text-xs text-white/40">
                    {format(new Date(item.created_date), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}