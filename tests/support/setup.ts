import { vi } from "vitest";
import { testDb } from "./db";

vi.mock("@/lib/db", () => ({
  getDb: async () => {
    if (!testDb.current) throw new Error("Call resetTestDb() before using the database in a test.");
    return testDb.current;
  },
}));

vi.mock("next/cache", () => ({
  cacheTag: vi.fn(),
  cacheLife: vi.fn(),
  updateTag: vi.fn(),
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}));
