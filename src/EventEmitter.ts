/**
 * Minimal, dependency-free, strongly-typed event emitter.
 *
 * Used internally by `XPSystem` and `Player` to notify consumers about
 * XP gains, level changes, prestige, and achievement unlocks — without
 * pulling in Node's `events` module (keeping the package browser-safe
 * and zero-dependency).
 */
export class TypedEmitter<Events extends object> {
  private listenerMap: { [K in keyof Events]?: Set<(payload: Events[K]) => void> } = {};

  /**
   * Subscribes to an event. Returns an unsubscribe function for convenience.
   */
  on<K extends keyof Events>(
    event: K,
    listener: (payload: Events[K]) => void
  ): () => void {
    let set = this.listenerMap[event];
    if (!set) {
      set = new Set();
      this.listenerMap[event] = set;
    }
    set.add(listener);
    return () => this.off(event, listener);
  }

  /** Subscribes to an event for a single occurrence, then auto-unsubscribes. */
  once<K extends keyof Events>(
    event: K,
    listener: (payload: Events[K]) => void
  ): void {
    const wrapped = (payload: Events[K]): void => {
      this.off(event, wrapped);
      listener(payload);
    };
    this.on(event, wrapped);
  }

  /** Removes a previously registered listener. */
  off<K extends keyof Events>(
    event: K,
    listener: (payload: Events[K]) => void
  ): void {
    this.listenerMap[event]?.delete(listener);
  }

  /** Removes every listener for `event`, or every listener for all events. */
  removeAllListeners<K extends keyof Events>(event?: K): void {
    if (event) {
      delete this.listenerMap[event];
    } else {
      this.listenerMap = {};
    }
  }

  /** Emits `event` synchronously to every subscriber. */
  protected emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    const set = this.listenerMap[event];
    if (!set || set.size === 0) return;
    // Copy to avoid re-entrancy issues if a listener subscribes/unsubscribes.
    Array.from(set).forEach((listener) => listener(payload));
  }
}
