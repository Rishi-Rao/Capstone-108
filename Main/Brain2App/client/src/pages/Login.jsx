import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const submit = async () => {
    if (!username || !password) { alert('Fill both fields'); return; }
    try {
      const res = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        onLoginSuccess(username);
      } else {
        alert(data?.message || 'Login failed');
      }
    } catch (err) {
      alert('Server error: ' + err.message);
    }
  };

  return (
    <div style={{textAlign: 'center', marginTop: 40}}>
      <h1>Login</h1>
      <div style={{marginTop:16}}>
        <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
      </div>
      <div style={{marginTop:8}}>
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      </div>
      <div style={{marginTop:12}}>
        <button onClick={submit}>Login</button>
      </div>
      <div style={{marginTop:12}}>
        <div>Don't have an account?</div>
        <button onClick={()=>navigate('/signup')}>Sign Up</button>
      </div>
    </div>
  );
};

export default Login;
