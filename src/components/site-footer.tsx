import Link from "next/link";

import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {siteConfig.name} · 不记录输入内容
        </p>
        <div className="flex items-center gap-4">
          <Link href="/about" className="hover:text-foreground">
            关于
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            隐私政策
          </Link>
        </div>
      </div>
    </footer>
  );
}

