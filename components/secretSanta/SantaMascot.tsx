"use client";

import Image from "next/image";
import { isNewYearThemeActive } from "@/components/NewYearTheme/config";

/** Yula above the final call to action on /secret-santa; the footer leaves her out on that page. */
export function SantaMascot() {
    return (
        <Image
            src={isNewYearThemeActive() ? "/yula-mascot-santa.png" : "/yula-mascot.png"}
            alt=""
            width={140}
            height={140}
            sizes="120px"
            className="mx-auto h-auto w-[120px] object-contain drop-shadow-lg animate-float motion-reduce:animate-none"
        />
    );
}
