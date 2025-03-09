type HightlightSameUserType = {
    login: string
    text: string
}

const HightlightSameUser: React.FC<HightlightSameUserType> = ({
    login,
    text,
}) =>
    new RegExp(`\\b(${login})\\b`, 'gi').test(text) ? (
        <span className="MessageSameUser">{text}</span>
    ) : (
        text
    )

export default HightlightSameUser
