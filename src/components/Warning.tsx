import React from 'react'
import './Warning.css'

type WarningType = {
    text?: string
}
const Warning: React.FC<WarningType> = ({ text }) => {
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

export default Warning
