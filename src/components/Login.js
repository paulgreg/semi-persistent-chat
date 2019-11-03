import React, { useState } from "react"
const { maxLength } = require("../config.json")

export default function Login(props) {
  const [login, setLogin] = useState("")
  const [validated, setValidated] = useState(false)

  function onChange(e) {
    setLogin(e.target.value)
  }
  function onKeyUp(e) {
    if (e.key === "Enter" && String(login).length > 1) {
      setValidated(true)
      const cleanedLogin = login.replace(/ /g, "-")
      props.onLogin && props.onLogin(cleanedLogin)
    }
  }

  return validated ? null : (
    <div>
      <label className="loginLabel" htmlFor="login">
        Login :{" "}
      </label>
      <input
        name="login"
        type="text"
        placeholder="Superman"
        value={login}
        onChange={onChange}
        onKeyUp={onKeyUp}
        minLength="1"
        maxLength={maxLength}
        autoFocus
      />
    </div>
  )
}
