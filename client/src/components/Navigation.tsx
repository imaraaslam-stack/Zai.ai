import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LogOut, 
  LayoutDashboard, 
  Sparkles, 
  Flame,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useStreak } from "@/hooks/use-study";

export function Navigation() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { data: streak } = useStreak();

  if (!user) return null;

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/topic/new", label: "New Study Set", icon: Sparkles },
  ];

  const isActive = (path: string) => location === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transform transition-transform group-hover:rotate-12">
            <span className="text-white font-display font-bold text-xl">S</span>
          </div>
          <span className="font-display font-bold text-xl text-primary tracking-tight">
            StudyBuddy
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                isActive(item.href) 
                  ? "text-primary bg-primary/10 px-4 py-2 rounded-xl" 
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </div>

        {/* User Stats & Profile */}
        <div className="hidden md:flex items-center gap-6">
          {/* Streak Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-xl">
            <Flame className={`w-5 h-5 ${streak?.currentStreak ? 'text-accent fill-accent' : 'text-muted-foreground'}`} />
            <span className={`font-display font-bold ${streak?.currentStreak ? 'text-accent-foreground' : 'text-muted-foreground'}`}>
              {streak?.currentStreak || 0}
            </span>
          </div>

          <div className="flex items-center gap-3 pl-6 border-l">
            <Avatar className="w-9 h-9 border-2 border-background ring-2 ring-primary/20">
              <AvatarImage src={user.profileImageUrl || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {user.firstName?.[0] || user.email?.[0] || "?"}
              </AvatarFallback>
            </Avatar>
            <button 
              onClick={() => logout()}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-muted-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t p-4 bg-background animate-in slide-in-from-top-2">
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted font-medium"
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="w-5 h-5 text-primary" />
                {item.label}
              </Link>
            ))}
            <button 
              onClick={() => logout()}
              className="flex w-full items-center gap-3 p-3 rounded-xl hover:bg-destructive/10 text-destructive font-medium"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
