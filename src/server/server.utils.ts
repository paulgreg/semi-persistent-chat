import fs from 'node:fs'
import path from 'node:path'
import { IS_PROD, MAX_MSG_SIZE, MSG_RETENTION_HOURS, PORT, SECRET } from './env'

const transformHtmlWithConfig = async (html: string): Promise<string> => {
    const configScript = `
        <script>
            globalThis.port = ${PORT};
            globalThis.messageRetentionHours = ${MSG_RETENTION_HOURS};
            globalThis.maxMsgSize = ${MAX_MSG_SIZE};
            globalThis.secret = "${SECRET}";
            globalThis.isProd = ${IS_PROD};
        </script>
`

    const viteDevServer = '//localhost:5173'

    const viteRefresh = IS_PROD
        ? ''
        : `
<script type="module">import { injectIntoGlobalHook } from "${viteDevServer}/@react-refresh";
injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;</script>
<script type="module" src="${viteDevServer}/@vite/client"></script>
` // inject vite middleware (subject to change on vite updates) pointing to vite dev server

    return html
        .replace('<!-- VITE_PLACEHOLDER -->', viteRefresh) // dev
        .replace('/src/index.jsx', `${viteDevServer}/src/index.jsx`) // dev
        .replace('<!-- CONFIG_PLACEHOLDER -->', configScript) // dev & prod
}

export const getIndexHtml = async (__dirname: string): Promise<string> => {
    const htmlPath = path.join(
        __dirname,
        IS_PROD ? '../../dist/client/index.html' : '../../index.html'
    )
    const html = fs.readFileSync(htmlPath, 'utf-8')
    return transformHtmlWithConfig(html)
}
