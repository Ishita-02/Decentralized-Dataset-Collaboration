"use client"

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Link } from "react-router-dom";
import { useRouter } from "next/navigation"; 
import { createPageUrl } from "@/components/ui/utils";
import { 
  Upload, 
  Database, 
  Users, 
  ShieldCheck,
  Plus,
  Search,
  FileText,
  CheckCircle
} from "lucide-react";


export default function QuickActions() {
  const actions = [
    {
      title: "Upload Dataset",
      description: "Share your data and earn tokens from contributors",
      icon: Upload,
      color: "from-blue-500 to-cyan-500",
      url: createPageUrl("Upload"),
      cta: "Upload Now"
    },
    {
      title: "Browse & Contribute",
      description: "Find datasets to improve and earn rewards",
      icon: Database,
      color: "from-green-500 to-emerald-500",
      url: createPageUrl("Browse"),
      cta: "Browse Datasets"
    },
    {
      title: "Verify Contributions",
      description: "Review submissions and maintain quality",
      icon: ShieldCheck,
      color: "from-purple-500 to-pink-500",
      url: createPageUrl("Verify"),
      cta: "Start Verifying"
    }
  ];


  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
        <div className="flex items-center gap-2 text-sm text-white/60">
          <FileText className="w-4 h-4" />
          Get started in seconds
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {actions.map((action, index) => (
          <Card key={index} className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300 group">
            <CardHeader>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} bg-opacity-10 flex items-center justify-center mb-3`}>
                <action.icon className={`w-6 h-6 text-transparent bg-gradient-to-r ${action.color} bg-clip-text`} />
              </div>
              <CardTitle className="text-white text-lg">{action.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/70 text-sm">{action.description}</p>
              <Button
                className={`w-full bg-gradient-to-r ${action.color} hover:scale-105 transition-all duration-200`}
                onClick={() => router.push(action.url)}
              >
                <Plus className="w-4 h-4 mr-2" />
                {action.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}