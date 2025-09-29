"use client";

import { Droplets } from "lucide-react";

/**
 * Logo component for the AquaValuate app
 * Combines an icon with the app name for the header
 */
export function Logo() {
  return (
    <div className="flex items-center justify-center gap-2 text-lg font-bold text-primary">
      <Droplets className="h-6 w-6" />
      <h1 className="font-headline text-2xl">AquaValuate</h1>
    </div>
  );
}
