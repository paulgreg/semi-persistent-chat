import React from 'react'
import HightlightSameUser from './HighligtSameUser'

import { render } from '@testing-library/react'

describe('Message', () => {
    describe('hightlightSameUser', () => {
        test('should highlight Bob in message', () => {
            const { container } = render(
                <HightlightSameUser login="Bob" text="Hey Bob" />
            )
            expect(container.outerHTML).toEqual(
                '<div><span class="MessageSameUser">Hey Bob</span></div>'
            )
        })

        test('should highlight Bob in lowercase', () => {
            const { container } = render(
                <HightlightSameUser login="Bob" text="Hey bob" />
            )

            expect(container.outerHTML).toEqual(
                '<div><span class="MessageSameUser">Hey bob</span></div>'
            )
        })

        test('should NOT highlight Bob if part of a word', () => {
            const { container } = render(
                <HightlightSameUser login="Bob" text="HeyBobInAWord" />
            )
            expect(container.outerHTML).toEqual('<div>HeyBobInAWord</div>')
        })
    })
})
