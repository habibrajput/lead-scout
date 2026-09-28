"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { AppSidebarNav } from "./app-sidebar";
import { BrandMark } from "./brand-mark";

type AppHeaderProps = {
  title: string;
  description?: string;
};

export function AppHeader({ title, description }: AppHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="size-9 lg:hidden"
          aria-label="Open navigation"
          onClick={() => setOpen(true)}
        >
          <Menu className="size-5" aria-hidden />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-semibold">{title}</h1>
          {description && (
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              {description}
            </p>
          )}
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 px-3 py-4">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="px-2 pb-4">
            <BrandMark />
          </div>
          <AppSidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
}
