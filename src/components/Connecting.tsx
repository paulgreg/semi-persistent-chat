import s from './Connecting.module.css'

const Connecting = () => {
    return (
        <div className={s.Connecting}>
            Connecting...
            <div className={s['Connecting-pulse']}></div>
        </div>
    )
}
export default Connecting
