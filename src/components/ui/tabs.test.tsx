import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SegmentedTabsList, SegmentedTabsTrigger, Tabs } from "./tabs";

describe("Segmented tabs", () => {
  it("renders a full-width segmented list with equal columns", () => {
    const html = renderToStaticMarkup(
      <Tabs defaultValue="text">
        <SegmentedTabsList>
          <SegmentedTabsTrigger value="text">文本</SegmentedTabsTrigger>
          <SegmentedTabsTrigger value="image">图片</SegmentedTabsTrigger>
        </SegmentedTabsList>
      </Tabs>,
    );

    expect(html).toContain("grid-flow-col");
    expect(html).toContain("auto-cols-fr");
    expect(html).toContain("w-full");
  });

  it("applies the segmented trigger shape", () => {
    const html = renderToStaticMarkup(
      <Tabs defaultValue="text">
        <SegmentedTabsList>
          <SegmentedTabsTrigger value="text">文本</SegmentedTabsTrigger>
          <SegmentedTabsTrigger value="image">图片</SegmentedTabsTrigger>
        </SegmentedTabsList>
      </Tabs>,
    );

    expect(html).toContain("rounded-none");
    expect(html).toContain("first:rounded-l-md");
    expect(html).toContain("last:rounded-r-md");
  });
});

