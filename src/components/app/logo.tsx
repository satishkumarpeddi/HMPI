import { Droplets } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center justify-center gap-2 text-lg font-bold text-primary">
      <Droplets className="h-6 w-6" />
      <h1 className="font-headline text-2xl">AquaValuate</h1>
    </div>
  );
}
