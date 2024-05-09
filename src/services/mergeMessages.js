export default function mergeMessages(messages = [], newMessages = []) {
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
            validated: editedMessage?.validated ?? m.validated,
        }
    })

    const validatedIds = merged
        .filter(({ validated }) => validated)
        .map(({ uuid }) => uuid)
    const withoutUnvalidatedMessages = merged.filter(
        ({ uuid, validated }) => validated || !validatedIds.includes(uuid)
    )
    return withoutUnvalidatedMessages
}
