import { describe, expect, it } from "vitest";

import {
  normalizeDataEnvelope,
  normalizeItemsEnvelope,
  normalizeRawArray,
  normalizeSuccessEnvelope,
} from "./list-result";

const meta = { page: 1, limit: 20, total: 2, totalPages: 1 };

describe("normalizeItemsEnvelope", () => {
  it("maps { items, meta } to ListResult unchanged", () => {
    expect(normalizeItemsEnvelope({ items: [1, 2], meta })).toEqual({ items: [1, 2], meta });
  });
});

describe("normalizeDataEnvelope", () => {
  it("maps { data, meta } to { items, meta }", () => {
    expect(normalizeDataEnvelope({ data: [1, 2], meta })).toEqual({ items: [1, 2], meta });
  });
});

describe("normalizeSuccessEnvelope", () => {
  it("maps { data, meta } (ignoring success/message) to { items, meta }", () => {
    expect(normalizeSuccessEnvelope({ data: [1, 2], meta })).toEqual({ items: [1, 2], meta });
  });
});

describe("normalizeRawArray", () => {
  it("wraps a raw array with meta: null", () => {
    expect(normalizeRawArray([1, 2, 3])).toEqual({ items: [1, 2, 3], meta: null });
  });

  it("wraps an empty array with meta: null", () => {
    expect(normalizeRawArray([])).toEqual({ items: [], meta: null });
  });
});
