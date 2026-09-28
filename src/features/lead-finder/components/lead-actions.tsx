"use client";

import { Copy, ExternalLink, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SOURCES } from "../constants/sources";
import type { Lead } from "../types/lead.types";

export async function copyText(text: string, what: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${what} copied`);
  } catch {
    toast.error(`Couldn't copy ${what.toLowerCase()}`);
  }
}

/** Compact icon actions for a lead row. Stops propagation so the row click doesn't fire. */
export function LeadRowActions({ lead }: { lead: Lead }) {
  const phone = lead.internationalPhone ?? lead.phone;
  const listingLabel = SOURCES[lead.source].listingLabel;

  return (
    <div className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
      {phone && (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-9"
                aria-label={`Copy phone number for ${lead.name}`}
                onClick={() => copyText(phone, "Phone number")}
              />
            }
          >
            <Copy aria-hidden />
          </TooltipTrigger>
          <TooltipContent>Copy phone</TooltipContent>
        </Tooltip>
      )}
      {phone && (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-9"
                aria-label={`Call ${lead.name}`}
                nativeButton={false}
                render={<a href={`tel:${phone.replace(/\s+/g, "")}`} />}
              />
            }
          >
            <Phone aria-hidden />
          </TooltipTrigger>
          <TooltipContent>Call</TooltipContent>
        </Tooltip>
      )}
      {lead.listingUrl && (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-9"
                aria-label={`${listingLabel}: ${lead.name}`}
                nativeButton={false}
                render={<a href={lead.listingUrl} target="_blank" rel="noopener noreferrer" />}
              />
            }
          >
            <ExternalLink aria-hidden />
          </TooltipTrigger>
          <TooltipContent>{listingLabel}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
