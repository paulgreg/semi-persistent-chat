import debug from 'debug'
const d = debug('merge')

export default function mergeMessages(messages = [], newMessages = []) {
    if (d.enabled) 'mergeMessages', messages, newMessages
    const messagesUuid = messages.map(({ uuid }) => uuid)
    const newMessagesWithoutUuid = newMessages.filter(
        ({ uuid }) => !messagesUuid.includes(uuid)
    )
    const newMessagesWithUuid = newMessages.filter(({ uuid }) =>
        messagesUuid.includes(uuid)
    )

    const newMessagesConcateneted = messages.concat(newMessagesWithoutUuid)

    const merged = newMessagesConcateneted.map((m) => {
        const editedMessage = newMessagesWithUuid.find(
            ({ uuid }) => uuid === m.uuid
        )
        return {
            ...m,
            message: editedMessage?.message ?? m.message,
            emojis: editedMessage?.emojis ?? m.emojis,
            validated: editedMessage?.validated ?? m.validated,
        }
    })
    if (d.enabled) d('- merged', merged)

    const validatedIds = merged
        .filter(({ validated }) => validated)
        .map(({ uuid }) => uuid)
    const withoutUnvalidatedMessages = merged.filter(
        ({ uuid, validated }) => validated || !validatedIds.includes(uuid)
    )
    if (d.enabled) d('- withoutUnvalidatedMessages', withoutUnvalidatedMessages)
    return withoutUnvalidatedMessages
}
