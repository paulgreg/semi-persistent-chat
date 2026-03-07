declare global {
    var port: number
    var messageRetentionHours: number
    var maxMsgSize: number
    var secret: string
    var isProd: boolean
    var baseUrl: string
}

export {}
