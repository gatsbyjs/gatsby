import { uuid } from "gatsby-core-utils";
import os from "node:os";
import { join } from "node:path";

export class InMemoryConfigStore {
  config: Record<string, unknown>;
  path = join(os.tmpdir(), "gatsby");

  constructor() {
    this.config = this.createBaseConfig();
  }

  createBaseConfig(): Record<string, unknown> {
    return {
      "telemetry.enabled": true,
      "telemetry.machineId": `not-a-machine-id-${uuid.v4()}`,
    };
  }

  get(key: string): unknown {
    return this.config[key];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set(key: string, value: any): void {
    this.config[key] = value;
  }

  all(): Record<string, unknown> {
    return this.config;
  }

  size(): number {
    return Object.keys(this.config).length;
  }

  has(key: string): boolean {
    return !!this.config[key];
  }

  delete(key: string): void {
    delete this.config[key];
  }

  clear(): void {
    this.config = this.createBaseConfig();
  }
}
