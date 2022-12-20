import './App.css';
import { useState } from 'react'
import { Navigate } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom'
import PocketBase from 'pocketbase';

function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  //const location = useLocation()
  //const { pb } = location.state

  const pb = new PocketBase('https://base.jn2p.de');
  const navigate = useNavigate()

  async function login(username, password) {
    console.log(pb.authStore)
    try {
      const authData = await pb.collection('users').authWithPassword(username, password);
      console.log('hello')
      navigate('/home')
    } catch (err) {
      console.log(err)
    }
    
  }

  async function signup(username, password) {
    const data = {
      "username": username,
      "password": password,
      "passwordConfirm": password,
      "name": "",
    };
    try {
      const row = await pb.collection('users').create(data);
      await login(username, password)
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className="App">
      <div className='App-body'>
        <p className="description">Sign in with email and Password</p>
        <div>
          <input
            className="inputField"
            type="username"
            placeholder="Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <input
            className="inputField"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <button
            onClick={(e) => {
              e.preventDefault()
              login(email, password)
            }}
            className={'button block'}
          >
          Login
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              signup(email, password)
            }}
            className={'button block'}
          >
          Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default Auth;
