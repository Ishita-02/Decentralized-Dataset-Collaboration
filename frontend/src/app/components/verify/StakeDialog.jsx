
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Coins,
  Shield,
  X,
  AlertCircle,
  Info
} from "lucide-react";
import Web3Service from "../services/Web3Service"; // Adjusted import path as per outline

export default function StakeDialog({ onSuccess, onCancel }) {
  const [stakeAmount, setStakeAmount] = useState("1000");
  const [staking, setStaking] = useState(false);
  const [error, setError] = useState(null);

  const handleStake = async () => {
    setStaking(true);
    setError(null);

    try {
      const amount = parseFloat(stakeAmount);
      if (amount < 1000) {
        throw new Error("Minimum stake amount is 1000 DCT");
      }

      await Web3Service.stakeToVerify(amount);
      onSuccess();
    } catch (error) {
      setError(error.message || "Failed to stake tokens");
    }
    setStaking(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-white/5 backdrop-blur-xl border-white/10 max-w-md w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              Become a Verifier
            </CardTitle>
            <p className="text-white/60 text-sm mt-1">Stake DCT tokens to start verifying</p>
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

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5" />
              <div className="text-sm">
                <p className="text-blue-300 font-medium mb-2">Verifier Benefits:</p>
                <ul className="text-blue-200/80 space-y-1">
                  <li>• Earn 5 DCT per verification</li>
                  <li>• Get rewards from slashed tokens</li>
                  <li>• Help maintain dataset quality</li>
                  <li>• Build reputation in the ecosystem</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Stake Amount */}
          <div className="space-y-2">
            <Label className="text-white">Stake Amount (DCT)</Label>
            <div className="relative">
              <Coins className="absolute left-3 top-3 w-4 h-4 text-yellow-400" />
              <Input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                min="1000"
                step="100"
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                placeholder="1000"
              />
            </div>
            <p className="text-white/60 text-xs">Minimum: 1000 DCT tokens</p>
          </div>

          {/* Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
              <div className="text-sm">
                <p className="text-yellow-400 font-medium">Important:</p>
                <p className="text-yellow-300/80">
                  Staked tokens are locked and can be slashed for incorrect votes. 
                  You can unstake at any time when not actively verifying.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStake}
              disabled={staking || !stakeAmount || parseFloat(stakeAmount) < 1000}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {staking ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Staking...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Stake & Verify
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
