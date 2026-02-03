import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "关于",
  description: `了解 ${siteConfig.name} 的定位、功能与使用方式。`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <div className="mb-8 space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">关于</h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
          {siteConfig.name} 是一个专注于体验与隐私的 Base64 在线工具：支持文本编码/解码，以及图片 Base64
          直接渲染预览。
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>为什么做它</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>把常用的 Base64 操作做得更顺手：界面更简洁，移动端也好用。</p>
            <p>高级选项可折叠，避免信息过载，默认只展示最常用的功能。</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>隐私与安全</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>输入内容在浏览器本地处理，不会因为操作而上传。</p>
            <p>如果你粘贴敏感信息，请仍然自行评估风险并做好脱敏。</p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2">
          <CardHeader>
            <CardTitle>功能概览</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <div>文本 Base64 编码/解码</div>
            <div>支持 URL-safe 编码与移除 “=”</div>
            <div>解码时可忽略空白字符</div>
            <div>图片 Base64 / Data URL 预览</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

