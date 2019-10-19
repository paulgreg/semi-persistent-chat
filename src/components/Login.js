import React, { useState } from "react";

export default function Login(props) {
  const [login, setLogin] = useState("");
  const [validated, setValidated] = useState(false);

  function onChange(e) {
    setLogin(e.target.value);
  }
  function onKeyUp(e) {
    if (e.key === "Enter") {
      setValidated(true);
      props.onLogin && props.onLogin(login);
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
        autoFocus
      />
    </div>
  );
}
