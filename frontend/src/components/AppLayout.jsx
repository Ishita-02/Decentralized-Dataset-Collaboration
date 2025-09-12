"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Database, LayoutDashboard, Upload, Users, ShieldCheck, Download,
  Coins, User as UserIcon, Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useWeb3 } from "../app/context/Web3Provider";

const navigationItems = [
    { title: "Dashboard", href: "/", icon: LayoutDashboard },
    { title: "Browse Datasets", href: "/browse", icon: Database },
    { title: "Upload Dataset", href: "/upload", icon: Upload },
    { title: "My Contributions", href: "/contributions", icon: Users },
    { title: "Verify Work", href: "/verify", icon: ShieldCheck },
    { title: "Marketplace", href: "/downloads", icon: Download },
];

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const { account, connectWallet, disconnectWallet, isLoading } = useWeb3();

  const NavContent = () => (
    <>
      <div className="flex items-center gap-3 p-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-xl text-white">DataNexus</h2>
            <p className="text-xs text-white/70">Decentralized Datasets</p>
          </div>
        </Link>
      </div>
      
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                pathname === item.href
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.title}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-6 border-t border-white/10">
        <Link 
          href="/profile"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-3 p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-white text-sm">Profile & Rewards</p>
            <p className="text-xs text-white/70">View earnings</p>
          </div>
          <div className="flex items-center gap-1">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-bold text-yellow-400">0</span>
          </div>
        </Link>
      </div>
    </>
  );

  return (
    <div className="relative z-10">
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-800/90 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
          
            {/* ✅ THIS IS THE MISSING CODE FOR THE MENU ICON */}
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 bg-gradient-to-b from-slate-800 to-slate-900 border-white/10 w-80">
                <div className="h-full flex flex-col">
                  <NavContent />
                </div>
              </SheetContent>
            </Sheet>
            
            <h1 className="font-bold text-white">DataNexus</h1>
          </div>
          
          <div className="flex items-center">
            {account ? (
              <div className="flex items-center gap-3">
                <div className="text-white text-sm bg-white/10 px-4 py-2 rounded-lg font-mono">
                  {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
                </div>
                <Button 
                  onClick={disconnectWallet}
                  variant="secondary"
                  className="bg-white/10 hover:bg-white/20 text-white"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button 
                onClick={connectWallet} 
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-purple-500"
              >
                {isLoading ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 pt-20">
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}