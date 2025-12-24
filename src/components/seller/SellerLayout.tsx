import { SellerSidebar } from "./SellerSidebar";

interface SellerLayoutProps {
  children: React.ReactNode;
}

export function SellerLayout({ children }: SellerLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <SellerSidebar />
      <main className="ml-64 min-h-screen p-6 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}