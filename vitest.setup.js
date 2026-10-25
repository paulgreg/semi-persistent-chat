// Test only: jsdom does not implement WebCrypto's SubtleCrypto. Substitute
// Node's webcrypto (same algorithms as browsers) so crypto tests can run.
// This file is never part of the client or server bundles.
import { webcrypto } from 'node:crypto'

if (!globalThis.crypto?.subtle) {
    Object.defineProperty(globalThis, 'crypto', {
        value: webcrypto,
        configurable: true,
    })
}
