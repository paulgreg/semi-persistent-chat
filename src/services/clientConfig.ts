export const clientConfig = {
    port: globalThis.port,
    messageRetentionHours: globalThis.messageRetentionHours,
    maxMsgSize: globalThis.maxMsgSize,
    secret: globalThis.secret,
    baseUrl: globalThis.isProd ? '.' : `http://localhost:${globalThis.port}`,
}
