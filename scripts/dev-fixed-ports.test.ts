import { describe, expect, it } from "vitest";
import { fixedPortsRequested, takeFixedPort } from "./dev-fixed-ports";

const free = async () => true;
const busy = async () => false;

describe("fixed development ports", () => {
  it("is on only when the instance settings ask for it", () => {
    expect(fixedPortsRequested({ ESTACK_DEV_FIXED_PORTS: "1" })).toBe(true);
    expect(fixedPortsRequested({})).toBe(false);
    expect(fixedPortsRequested({ ESTACK_DEV_FIXED_PORTS: "0" })).toBe(false);
  });

  it("takes the configured port when it is free", async () => {
    await expect(takeFixedPort("API", 3300, new Set(), new Set(), free)).resolves.toBe(3300);
  });

  it("stops instead of moving when the port is busy, held by a sibling stack, or already taken", async () => {
    await expect(takeFixedPort("API", 3100, new Set(), new Set(), busy)).rejects.toThrow(/3100 is busy/u);
    await expect(takeFixedPort("API", 3100, new Set(), new Set([3100]), free)).rejects.toThrow(/stops instead/u);
    await expect(takeFixedPort("Signal", 3101, new Set([3101]), new Set(), free)).rejects.toThrow(/Signal port/u);
  });
});
