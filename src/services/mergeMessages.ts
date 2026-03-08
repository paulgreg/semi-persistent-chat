import debug from 'debug'
import { FullMessageType } from '../types/ChatTypes'
const d = debug('merge')

const mergeMessages = (
    messages: Array<FullMessageType> = [],
    newMessages: Array<FullMessageType> = []
): Array<FullMessageType> => {
    if (d.enabled) d('mergeMessages', messages, newMessages)
    const messagesMsgId = new Set(messages.map(({ msgId }) => msgId))
    const newMessagesWithoutmsgId = newMessages.filter(
        ({ msgId }) => !messagesMsgId.has(msgId)
    )
    const newMessagesWithmsgId = newMessages.filter(({ msgId }) =>
        messagesMsgId.has(msgId)
    )

    const newMessagesConcateneted = messages.concat(newMessagesWithoutmsgId)

    const merged: Array<FullMessageType> = newMessagesConcateneted.map((m) => {
        const editedMessage = newMessagesWithmsgId.find(
            ({ msgId }) => msgId === m.msgId
        )
        return {
            ...m,
            text: editedMessage?.text ?? m.text,
            emojis: editedMessage?.emojis ?? m.emojis,
            validated: editedMessage?.validated ?? m.validated,
            version: editedMessage?.version ?? m.version,
        }
    })
    if (d.enabled) d('- merged', merged)

    const validatedIds = new Set(
        merged.filter(({ validated }) => validated).map(({ msgId }) => msgId)
    )

    const withoutUnvalidatedMessages = merged.filter(
        ({ msgId, validated }) => validated || !validatedIds.has(msgId)
    )
    if (d.enabled) d('- withoutUnvalidatedMessages', withoutUnvalidatedMessages)

    return withoutUnvalidatedMessages
}

export default mergeMessages
