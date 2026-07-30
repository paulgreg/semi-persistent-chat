import React from 'react'
import s from './Warning.module.css'

type WarningType = {
    text?: string
}
const Warning: React.FC<WarningType> = ({ text }) => {
    if (!text) return

    return (
        <div className={s.warning}>
            <span role="img" aria-label="Warning" className={s.warningIcon}>
                ⚠️
            </span>
            {text}
        </div>
    )
}

export default Warning
