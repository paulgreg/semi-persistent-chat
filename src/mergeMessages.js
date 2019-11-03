export default function mergeMessages(messages = [], newMessages = []) {
  const merged = messages.concat(newMessages)
  const validatedIds = merged
    .filter(({ validated }) => validated)
    .map(({ uuid }) => uuid)
  const withoutUnvalidatedMessages = merged.filter(
    ({ uuid, validated }) => validated || !validatedIds.includes(uuid)
  )
  return withoutUnvalidatedMessages
}
