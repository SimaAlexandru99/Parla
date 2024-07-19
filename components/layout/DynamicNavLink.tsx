'use client'
import { LucideIcon } from "lucide-react"; // Import your icon type from lucide-react

interface DynamicNavLinkProps {
  icon: LucideIcon;
  text: string;
  active: boolean; // New prop to control active state manually
  onClick?: () => void; // New optional onClick prop
}

const DynamicNavLink = ({ icon: Icon, text, active, onClick }: DynamicNavLinkProps) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-all hover:text-primary ${active ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
    >
      <Icon className="h-4 w-4" />
      {text}
    </button>
  );
};

export default DynamicNavLink;
