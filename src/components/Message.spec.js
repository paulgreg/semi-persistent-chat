import React from 'react'
import { hightlightSameUser } from './Message'

describe('Message', () => {
    describe('hightlightSameUser', () => {
        test('should highlight Bob in message', () =>
            expect(
                hightlightSameUser({ login: 'Bob', message: 'Hey Bob' })
            ).toEqual(<span className="MessageSameUser">Hey Bob</span>))
        test('should highlight Bob in lowercase', () =>
            expect(
                hightlightSameUser({ login: 'Bob', message: 'Hey bob' })
            ).toEqual(<span className="MessageSameUser">Hey bob</span>))
        test('should NOT highlight Bob if part of a word', () =>
            expect(
                hightlightSameUser({ login: 'Bob', message: 'HeyBobInAWord' })
            ).toEqual('HeyBobInAWord'))
    })
})
