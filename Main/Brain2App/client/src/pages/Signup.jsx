import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [username, setUsername] = useState('');
  const [pass1, setPass1] = useState('');
  const [pass2, setPass2] = useState('');
  const navigate = useNavigate();

  const submit = async () => {
    if (!username || !pass1) { alert('Fill fields'); return; }
    if (pass1 !== pass2) { alert('Passwords do not match'); return; }
    try {
      const res = await fetch('http://localhost:4000/signup', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username, password: pass1 })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Account created. Please login.');
        navigate('/');
      } else {
        alert(data?.message || 'Signup failed');
      }
    } catch (err) {
      alert('Server error: ' + err.message);
    }
  };

  return (
    <div style={{textAlign: 'center', marginTop: 40}}>
      <h1>Sign Up</h1>
      <div style={{marginTop:16}}>
        <input placeholder="Choose Username" value={username} onChange={e=>setUsername(e.target.value)} />
      </div>
      <div style={{marginTop:8}}>
        <input placeholder="Choose Password" type="password" value={pass1} onChange={e=>setPass1(e.target.value)} />
      </div>
      <div style={{marginTop:8}}>
        <input placeholder="Confirm Password" type="password" value={pass2} onChange={e=>setPass2(e.target.value)} />
      </div>
      <div style={{marginTop:12}}>
        <button onClick={submit}>Create Account</button>
      </div>
      <div style={{marginTop:12}}>
        <button onClick={()=>navigate('/')}>⬅️ Back to Login</button>
      </div>
    </div>
  );
};

export default Signup;
