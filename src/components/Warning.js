import React from 'react'
import './Warning.css'

export default function Warning(props = {}) {
    const { text } = props
    if (!text) return

    return (
        <div className="warning">
            <span role="img" aria-label="Warning" className="warningIcon">
                ⚠️
            </span>
            {text}
        </div>
    )
}
