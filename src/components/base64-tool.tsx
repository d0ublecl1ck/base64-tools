"use client";

import * as React from "react";
import { Check, Copy, Image as ImageIcon, RefreshCw, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SegmentedTabsList, SegmentedTabsTrigger, Tabs, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  decodeBase64ToText,
  encodeBase64Text,
  estimateBase64BytesLength,
  guessImageMimeFromBase64,
  normalizeBase64,
  parseDataUrl,
} from "@/lib/base64";
import { cn } from "@/lib/utils";

type TextAction = "encode" | "decode";

type TextSettings = {
  urlSafe: boolean;
  stripPadding: boolean;
  ignoreWhitespace: boolean;
  autoCopy: boolean;
};

type ImageSettings = {
  guessMime: boolean;
};

async function copyToClipboard(value: string) {
  await navigator.clipboard.writeText(value);
}

function prettyBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"] as const;
  const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const num = bytes / 1024 ** index;
  return `${num >= 10 || index === 0 ? Math.round(num) : num.toFixed(1)} ${units[index]}`;
}

export function Base64Tool() {
  const [activeTab, setActiveTab] = React.useState<"text" | "image">("text");

  const [textInput, setTextInput] = React.useState("");
  const [textOutput, setTextOutput] = React.useState("");
  const [textError, setTextError] = React.useState<string | null>(null);
  const [lastTextAction, setLastTextAction] = React.useState<TextAction>("encode");
  const [textSettings, setTextSettings] = React.useState<TextSettings>({
    urlSafe: false,
    stripPadding: false,
    ignoreWhitespace: true,
    autoCopy: false,
  });
  const [textCopied, setTextCopied] = React.useState(false);

  const [imageInput, setImageInput] = React.useState("");
  const [imageSettings, setImageSettings] = React.useState<ImageSettings>({
    guessMime: true,
  });
  const [imageCopied, setImageCopied] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const onRunText = React.useCallback(
    async (action: TextAction) => {
      setLastTextAction(action);
      setTextError(null);

      try {
        const result =
          action === "encode"
            ? encodeBase64Text(textInput, {
                urlSafe: textSettings.urlSafe,
                stripPadding: textSettings.stripPadding,
              })
            : decodeBase64ToText(textInput, {
                urlSafe: true,
                ignoreWhitespace: textSettings.ignoreWhitespace,
                stripDataUrlPrefix: true,
              });

        setTextOutput(result);

        if (textSettings.autoCopy && result) {
          await copyToClipboard(result);
          toast.success("已复制到剪贴板");
        }
      } catch (err) {
        setTextError(err instanceof Error ? err.message : "处理失败，请检查输入内容。");
      }
    },
    [textInput, textSettings],
  );

  const onSwapText = React.useCallback(() => {
    setTextError(null);
    setTextInput(textOutput);
    setTextOutput(textInput);
  }, [textInput, textOutput]);

  const onCopyTextOutput = React.useCallback(async () => {
    if (!textOutput) return;
    try {
      await copyToClipboard(textOutput);
      setTextCopied(true);
      window.setTimeout(() => setTextCopied(false), 1200);
      toast.success("输出已复制");
    } catch {
      toast.error("复制失败，请检查浏览器权限");
    }
  }, [textOutput]);

  const onClearText = React.useCallback(() => {
    setTextError(null);
    setTextInput("");
    setTextOutput("");
  }, []);

  const onTextKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const isEnter = event.key === "Enter";
      const hasHotkey = (event.metaKey || event.ctrlKey) && isEnter;
      if (!hasHotkey) return;

      event.preventDefault();
      void onRunText(lastTextAction);
    },
    [lastTextAction, onRunText],
  );

  React.useEffect(() => {
    if (!textSettings.urlSafe && textSettings.stripPadding) {
      setTextSettings((s) => ({ ...s, stripPadding: false }));
    }
  }, [textSettings.stripPadding, textSettings.urlSafe]);

  const parsedImageDataUrl = React.useMemo(() => parseDataUrl(imageInput), [imageInput]);

  const imageResult = React.useMemo(() => {
    const raw = imageInput.trim();
    if (!raw) return { preview: null as null, error: null as string | null };

    if (parsedImageDataUrl) {
      return {
        preview: {
          dataUrl: raw,
          mime: parsedImageDataUrl.mime,
          bytes: estimateBase64BytesLength(parsedImageDataUrl.base64, {
            ignoreWhitespace: true,
            stripDataUrlPrefix: false,
            urlSafe: true,
          }),
        },
        error: null,
      };
    }

    try {
      const normalized = normalizeBase64(raw, {
        ignoreWhitespace: true,
        urlSafe: true,
        stripDataUrlPrefix: true,
      });

      const mime = imageSettings.guessMime ? guessImageMimeFromBase64(normalized) : undefined;
      const finalMime = mime ?? "application/octet-stream";

      return {
        preview: {
          dataUrl: `data:${finalMime};base64,${normalized}`,
          mime: finalMime,
          bytes: estimateBase64BytesLength(normalized, {
            ignoreWhitespace: true,
            stripDataUrlPrefix: true,
            urlSafe: true,
          }),
        },
        error: null,
      };
    } catch (err) {
      return {
        preview: null as null,
        error: err instanceof Error ? err.message : "无法解析 Base64。",
      };
    }
  }, [imageInput, imageSettings.guessMime, parsedImageDataUrl]);

  const onPickImage = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onImageFileChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const value = String(reader.result ?? "");
        setImageInput(value);
        toast.success("已读取图片并生成 Data URL");
      };
      reader.onerror = () => toast.error("读取失败，请重试");
      reader.readAsDataURL(file);

      event.target.value = "";
    },
    [],
  );

  const onCopyImageInput = React.useCallback(async () => {
    const raw = imageInput.trim();
    if (!raw) return;
    try {
      await copyToClipboard(raw);
      setImageCopied(true);
      window.setTimeout(() => setImageCopied(false), 1200);
      toast.success("已复制");
    } catch {
      toast.error("复制失败，请检查浏览器权限");
    }
  }, [imageInput]);

  const onClearImage = React.useCallback(() => {
    setImageInput("");
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl tracking-tight">工具</CardTitle>
        <CardDescription>
          快捷键：Ctrl / ⌘ + Enter
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "text" | "image")}>
          <SegmentedTabsList>
            <SegmentedTabsTrigger value="text">文本</SegmentedTabsTrigger>
            <SegmentedTabsTrigger value="image">图片</SegmentedTabsTrigger>
          </SegmentedTabsList>

          <TabsContent value="text">
            <div className="grid gap-6">
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={() => void onRunText("encode")}>编码</Button>
                <Button variant="secondary" onClick={() => void onRunText("decode")}>
                  解码
                </Button>
                <Button variant="outline" onClick={onSwapText}>
                  <RefreshCw className="mr-2 size-4" />
                  交换
                </Button>

                <div className="ml-auto flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="清空"
                    title="清空"
                    onClick={onClearText}
                  >
                    <X />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="复制输出"
                    title="复制输出"
                    onClick={onCopyTextOutput}
                    disabled={!textOutput}
                  >
                    {textCopied ? <Check /> : <Copy />}
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 md:gap-6">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="base64-text-input">输入</Label>
                    <div className="text-xs text-muted-foreground">{textInput.length} 字符</div>
                  </div>
                  <Textarea
                    id="base64-text-input"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={onTextKeyDown}
                    placeholder="粘贴要编码/解码的内容"
                    className="min-h-[240px] resize-y"
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="base64-text-output">输出</Label>
                    <div
                      className={cn(
                        "text-xs",
                        textError ? "text-destructive" : "text-muted-foreground",
                      )}
                    >
                      {textError ? textError : `${textOutput.length} 字符`}
                    </div>
                  </div>
                  <Textarea
                    id="base64-text-output"
                    value={textOutput}
                    onChange={(e) => setTextOutput(e.target.value)}
                    placeholder="结果"
                    className="min-h-[240px] resize-y"
                  />
                </div>
              </div>

              <Accordion type="single" collapsible>
                <AccordionItem value="advanced">
                  <AccordionTrigger>高级设置</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                        <div className="grid gap-0.5">
                          <div className="text-sm font-medium">URL 安全编码</div>
                          <div className="text-xs text-muted-foreground">
                            编码时将 “+ /” 替换为 “- _”
                          </div>
                        </div>
                        <Switch
                          checked={textSettings.urlSafe}
                          onCheckedChange={(checked) =>
                            setTextSettings((s) => ({ ...s, urlSafe: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                        <div className="grid gap-0.5">
                          <div className="text-sm font-medium">移除填充符</div>
                          <div className="text-xs text-muted-foreground">编码后移除末尾 “=”</div>
                        </div>
                        <Switch
                          checked={textSettings.stripPadding}
                          onCheckedChange={(checked) =>
                            setTextSettings((s) => ({ ...s, stripPadding: checked }))
                          }
                          disabled={!textSettings.urlSafe}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                        <div className="grid gap-0.5">
                          <div className="text-sm font-medium">解码忽略空白</div>
                          <div className="text-xs text-muted-foreground">
                            解码时自动忽略换行/空格
                          </div>
                        </div>
                        <Switch
                          checked={textSettings.ignoreWhitespace}
                          onCheckedChange={(checked) =>
                            setTextSettings((s) => ({ ...s, ignoreWhitespace: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                        <div className="grid gap-0.5">
                          <div className="text-sm font-medium">自动复制输出</div>
                          <div className="text-xs text-muted-foreground">
                            运行编码/解码后自动复制
                          </div>
                        </div>
                        <Switch
                          checked={textSettings.autoCopy}
                          onCheckedChange={(checked) =>
                            setTextSettings((s) => ({ ...s, autoCopy: checked }))
                          }
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>

          <TabsContent value="image">
            <div className="grid gap-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm text-muted-foreground">
                  粘贴 Base64 / Data URL，或选择图片文件。
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onImageFileChange}
                  />
                  <Button variant="secondary" onClick={onPickImage}>
                    <Upload className="mr-2 size-4" />
                    选择图片
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onCopyImageInput}
                    disabled={!imageInput.trim()}
                  >
                    {imageCopied ? <Check className="mr-2 size-4" /> : <Copy className="mr-2 size-4" />}
                    复制输入
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="清空" title="清空" onClick={onClearImage}>
                    <X />
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 md:gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="base64-image-input">输入</Label>
                  <Textarea
                    id="base64-image-input"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    placeholder="Base64 / data:image/*;base64,..."
                    className="min-h-[240px] resize-y"
                  />
                  {imageResult.error ? (
                    <p className="text-sm text-destructive">{imageResult.error}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {imageResult.preview
                        ? `${imageResult.preview.mime} · 约 ${prettyBytes(imageResult.preview.bytes)}`
                        : "自动预览"}
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-3">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <ImageIcon className="size-4" />
                    预览
                  </div>
                  <div className="flex items-center justify-center overflow-hidden rounded-lg border border-border bg-background p-4">
                    {imageResult.preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageResult.preview.dataUrl}
                        alt="Base64 图片预览"
                        className="max-h-[360px] w-auto max-w-full rounded-md"
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground">暂无预览</div>
                    )}
                  </div>
                </div>
              </div>

              <Accordion type="single" collapsible>
                <AccordionItem value="advanced-image">
                  <AccordionTrigger>高级设置</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                        <div className="grid gap-0.5">
                          <div className="text-sm font-medium">自动识别图片类型</div>
                          <div className="text-xs text-muted-foreground">
                            识别 PNG/JPG/GIF/WebP 等
                          </div>
                        </div>
                        <Switch
                          checked={imageSettings.guessMime}
                          onCheckedChange={(checked) =>
                            setImageSettings((s) => ({ ...s, guessMime: checked }))
                          }
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
