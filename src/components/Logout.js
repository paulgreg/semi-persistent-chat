import React from "react"
import './Logout.css'

export default function Logout(props) {

  function onClick(e) {
    localStorage.removeItem('login')
    window.location.reload()
  }

  return (
    <span className='Logout' onClick={onClick}>
      (<span className='LogoutText'>logout</span>)
    </span>
  )
}
