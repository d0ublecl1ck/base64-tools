import type { Metadata } from "next";

import { Base64Tool } from "@/components/base64-tool";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Base64 在线编码/解码",
  description: siteConfig.description,
};

export default function HomePage() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(40%_60%_at_50%_0%,hsl(var(--muted))_0%,transparent_60%)]" />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <div className="mb-6 space-y-2">
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Base64 工具
          </h1>
          <p className="max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
            文本编码/解码 · 图片 Base64 预览
          </p>
        </div>

        <Base64Tool />
      </div>
    </div>
  );
}
