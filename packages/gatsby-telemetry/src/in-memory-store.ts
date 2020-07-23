import uuidV4 from "uuid/v4"
import os from "os"
import path from "path"

export class InMemoryConfigStore {
  config: Record<string, unknown>

  constructor() {
    this.config = this.createBaseConfig()
  }

  createBaseConfig(): Record<string, unknown> {
    return {
      "telemetry.enabled": true,
      "telemetry.machineId": `not-a-machine-id-${uuidV4()}`,
    }
  }

  get(key: string): unknown {
    return this.config[key]
  }

  set(key: string, value: any): void {
    this.config[key] = value
  }

  all(): Record<string, unknown> {
    return this.config
  }

  path(): string {
    return path.join(os.tmpdir(), `gatsby`)
  }

  size(): number {
    return Object.keys(this.config).length
  }

  has(key: string): boolean {
    return !!this.config[key]
  }

  delete(key: string): void {
    delete this.config[key]
  }

  clear(): void {
    this.config = this.createBaseConfig()
  }
}
