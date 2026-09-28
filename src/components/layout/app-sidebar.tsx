"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_SECTIONS } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { BrandMark } from "./brand-mark";

export function AppSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex flex-col gap-6">
      {NAV_SECTIONS.map((section, i) => (
        <div key={section.title ?? i} className="flex flex-col gap-1">
          {section.title && (
            <p className="px-3 pb-1 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              {section.title}
            </p>
          )}
          {section.items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            if (item.comingSoon) {
              return (
                <span
                  key={item.href}
                  aria-disabled
                  className="flex h-9 cursor-not-allowed items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground/70"
                >
                  <Icon className="size-4" aria-hidden />
                  <span className="flex-1">{item.label}</span>
                  <span className="rounded-md border border-border px-1.5 py-px text-[10px] font-medium tracking-wide uppercase">
                    Soon
                  </span>
                </span>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150",
                  "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-foreground/80 hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function AppSidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-3 py-4 lg:flex">
      <div className="px-2 pb-6">
        <BrandMark />
      </div>
      <AppSidebarNav />
      <div className="mt-auto rounded-lg border border-border bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
        Leads, outreach and site builder are coming next. Search is live today.
      </div>
    </aside>
  );
}
