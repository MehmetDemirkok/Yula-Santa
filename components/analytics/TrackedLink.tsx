"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { trackAction } from "@/lib/analytics/client";
import type { ToolName } from "@/lib/analytics/events";

/** A Link that records a `cta_click` (tool + page path only) before navigating. */
export function TrackedLink({ tool, onClick, ...props }: ComponentProps<typeof Link> & { tool: ToolName }) {
    return (
        <Link
            {...props}
            onClick={(e) => {
                trackAction("cta_click", tool);
                onClick?.(e);
            }}
        />
    );
}
