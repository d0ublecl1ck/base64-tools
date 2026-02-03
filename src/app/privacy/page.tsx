import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "隐私政策",
  description: `${siteConfig.name} 的隐私政策与数据处理说明。`,
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <div className="mb-8 space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">隐私政策</h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
          我们尽量减少数据收集。以下内容用于说明本网站如何处理信息。
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>输入内容</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Base64 编码/解码与图片预览在浏览器本地完成。</p>
            <p>我们不保存你输入的文本、Base64 字符串或图片内容。</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cookie 与本地存储</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>为了提升体验，网站可能使用本地存储保存主题偏好（浅色/深色/跟随系统）。</p>
            <p>不使用该偏好也不影响核心功能。</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>第三方链接</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>页面可能包含跳转到第三方站点的链接（例如 GitHub）。</p>
            <p>第三方站点的数据处理方式以其隐私政策为准。</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

