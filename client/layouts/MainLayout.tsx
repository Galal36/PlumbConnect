import { memo } from "react";
import Navbar from "@/components/Navbar";
import type { BaseProps } from "@/types";

interface MainLayoutProps extends BaseProps {
  showNavbar?: boolean;
}

const MainLayout = memo(function MainLayout({
  children,
  className = "",
  showNavbar = true,
}: MainLayoutProps) {
  return (
    <div className={`min-h-screen bg-background ${className}`} dir="rtl">
      {showNavbar && <Navbar />}
      <main className="flex-1">{children}</main>
    </div>
  );
});

export default MainLayout;
