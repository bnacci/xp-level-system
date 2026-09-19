import { describe, it, expect, vi } from "vitest";
import { TypedEmitter } from "../EventEmitter";

interface TestEvents {
  ping: { value: number };
  [key: string]: unknown;
}

class Emitter extends TypedEmitter<TestEvents> {
  fire(value: number) {
    this.emit("ping", { value });
  }
}

describe("TypedEmitter", () => {
  it("calls subscribed listeners with the emitted payload", () => {
    const emitter = new Emitter();
    const listener = vi.fn();
    emitter.on("ping", listener);
    emitter.fire(42);
    expect(listener).toHaveBeenCalledWith({ value: 42 });
  });

  it("supports multiple listeners for the same event", () => {
    const emitter = new Emitter();
    const a = vi.fn();
    const b = vi.fn();
    emitter.on("ping", a);
    emitter.on("ping", b);
    emitter.fire(1);
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it("does nothing when emitting with no listeners", () => {
    const emitter = new Emitter();
    expect(() => emitter.fire(1)).not.toThrow();
  });

  it("a listener can unsubscribe itself mid-emit without breaking others", () => {
    const emitter = new Emitter();
    const calls: string[] = [];
    const a = () => {
      calls.push("a");
      emitter.off("ping", a);
    };
    const b = () => calls.push("b");
    emitter.on("ping", a);
    emitter.on("ping", b);

    emitter.fire(1);
    expect(calls).toEqual(["a", "b"]);

    emitter.fire(2);
    expect(calls).toEqual(["a", "b", "b"]);
  });

  it("removeAllListeners(event) clears only that event", () => {
    const emitter = new Emitter();
    const listener = vi.fn();
    emitter.on("ping", listener);
    emitter.removeAllListeners("ping");
    emitter.fire(1);
    expect(listener).not.toHaveBeenCalled();
  });
});
