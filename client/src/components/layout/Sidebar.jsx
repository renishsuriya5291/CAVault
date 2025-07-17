import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Sheet, SheetContent } from '../../components/ui/sheet';
import { 
  LayoutDashboard, 
  FileText, 
  Upload, 
  Search, 
  Settings, 
  HelpCircle,
  Shield
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Upload', href: '/upload', icon: Upload },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help', href: '/help', icon: HelpCircle },
];

const SidebarContent = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-ca-primary rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-ca-dark">CA Portal</h2>
            <p className="text-xs text-ca-neutral">Document Management</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.name} to={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-12",
                    isActive 
                      ? "bg-ca-primary text-white ca-shadow" 
                      : "text-ca-neutral hover:text-ca-dark hover:bg-gray-100"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6">
        <div className="bg-gradient-to-r from-ca-primary to-ca-secondary p-4 rounded-lg text-white">
          <h3 className="font-semibold mb-1">Secure Storage</h3>
          <p className="text-sm opacity-90">Your documents are encrypted and secure</p>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 ca-shadow">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="p-0 w-64">
          <div className="pt-16">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Sidebar;