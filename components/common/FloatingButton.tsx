import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";

export default function FloatingButton() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handlePopoverOpenChange = (open: boolean) => {
    setIsPopoverOpen(open);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50"> {/* Ensure z-index is high */}
      <Popover onOpenChange={handlePopoverOpenChange}>
        <PopoverTrigger asChild>
          <Button className="rounded-full h-14 w-14 flex items-center justify-center shadow-lg">
            {isPopoverOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="mb-4">
          <div className="p-4">
            <h4 className="text-lg font-semibold">Create New Ticket</h4>
            <p className="text-sm">Place content for the popover here.</p>
            <Link href="/create-ticket">
              <Button className="mt-2 w-full">Go to Ticket Form</Button>
            </Link>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
