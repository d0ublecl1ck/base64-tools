import Link from "next/link";
import { Github } from "lucide-react";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold tracking-tight">
            {siteConfig.name}
          </Link>
          <Separator orientation="vertical" className="h-5" />
          <nav className="hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
            <Link href="/about" className="hover:text-foreground">
              关于
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              隐私
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon" aria-label="GitHub" title="GitHub">
            <a href={siteConfig.githubUrl} target="_blank" rel="noreferrer">
              <Github />
            </a>
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}

