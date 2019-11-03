const { validateMessage } = require("./validation")

it("validate correct message", () => {
  const m = validateMessage({ uuid: 1, user: "a", message: "b" })
  expect(m).toMatchObject({
    uuid: "1",
    user: "a",
    message: "b",
    validated: true
  })
  expect(m).toHaveProperty("timestamp")
})

it("should add uuid if missing", () => {
  expect(validateMessage({ message: "a" })).toHaveProperty("uuid")
})

it("should add user if missing", () => {
  expect(validateMessage({ message: "a" })).toMatchObject({ user: "unknown" })
})

it("should trucate user ", () => {
  expect(
    validateMessage({ user: "1234567890-1234567890", message: "a" })
  ).toMatchObject({
    user: "1234567890"
  })
})

it("should throw error if no message ", () => {
  expect(() => validateMessage()).toThrow()
})

it("should throw error if text is missing", () => {
  expect(() => validateMessage({})).toThrow()
})
