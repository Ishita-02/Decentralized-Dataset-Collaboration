import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coins, Users, ShieldCheck, Download } from "lucide-react";

export default function RewardSettings({ formData, onUpdate }) {
  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Coins className="w-5 h-5 text-yellow-400" />
          Incentive Settings
        </CardTitle>
        <p className="text-white/60 text-sm">
          Set token rewards to incentivize quality contributions and verifications
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-green-400" />
              Contribution Reward (DCT)
            </Label>
            <Input
              type="number"
              min="1"
              value={formData.contribution_reward}
              onChange={(e) => onUpdate('contribution_reward', parseInt(e.target.value))}
              className="bg-white/5 border-white/10 text-white"
            />
            <p className="text-xs text-white/50">Tokens per approved contribution</p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              Verification Reward (DCT)
            </Label>
            <Input
              type="number"
              min="1"
              value={formData.verification_reward}
              onChange={(e) => onUpdate('verification_reward', parseInt(e.target.value))}
              className="bg-white/5 border-white/10 text-white"
            />
            <p className="text-xs text-white/50">Tokens per verification task</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-white">Total Reward Pool (DCT)</Label>
            <Input
              type="number"
              min="10"
              value={formData.reward_pool}
              onChange={(e) => onUpdate('reward_pool', parseInt(e.target.value))}
              className="bg-white/5 border-white/10 text-white"
            />
            <p className="text-xs text-white/50">Total tokens allocated for this dataset</p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-400" />
              Download Price (DCT)
            </Label>
            <Input
              type="number"
              min="0"
              value={formData.download_price}
              onChange={(e) => onUpdate('download_price', parseInt(e.target.value))}
              className="bg-white/5 border-white/10 text-white"
            />
            <p className="text-xs text-white/50">0 = Free download</p>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">💡 Pro Tip</h4>
          <p className="text-blue-200 text-sm">
            Higher rewards attract more quality contributors. Consider the complexity 
            of your dataset when setting rewards.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}