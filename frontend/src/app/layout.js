import "./globals.css";
import AppLayout from '@/components/AppLayout';
import { Web3Provider } from "./context/Web3Provider";

export const metadata = {
  title: 'DataNexus',
  description: 'Decentralized platform for collaborative data improvement.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Static background from your original layout */}
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.1),transparent_50%)]"></div>
            </div>

            {/* Render the interactive client layout, which contains the sidebar and header */}
            <AppLayout>{children}</AppLayout>
          </div>
        </Web3Provider>
      </body>
    </html>
  );
}