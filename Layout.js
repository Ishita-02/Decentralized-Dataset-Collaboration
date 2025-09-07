import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Database, 
  LayoutDashboard, 
  Upload, 
  Users, 
  ShieldCheck, 
  Download,
  Coins,
  User as UserIcon,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Browse Datasets",
    url: createPageUrl("Browse"),
    icon: Database,
  },
  {
    title: "Upload Dataset",
    url: createPageUrl("Upload"),
    icon: Upload,
  },
  {
    title: "My Contributions",
    url: createPageUrl("Contributions"),
    icon: Users,
  },
  {
    title: "Verify Work",
    url: createPageUrl("Verify"),
    icon: ShieldCheck,
  },
  {
    title: "Downloads",
    url: createPageUrl("Downloads"),
    icon: Download,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const NavContent = () => (
    <>
      <div className="flex items-center gap-3 p-6 border-b border-white/10">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
          <Database className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-xl text-white">DataChain</h2>
          <p className="text-xs text-white/70">Decentralized Datasets</p>
        </div>
      </div>
      
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.title}
              to={item.url}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                location.pathname === item.url
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
          to={createPageUrl("Profile")}
          onClick={() => setMobileMenuOpen(false)}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.1),transparent_50%)]"></div>
      </div>
      
      <div className="flex relative z-10">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-80 bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-xl border-r border-white/10">
          <div className="h-screen flex flex-col">
            <NavContent />
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-800/90 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-bold text-white">DataChain</h1>
            </div>
            
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
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
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0 pt-16 lg:pt-0">
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}