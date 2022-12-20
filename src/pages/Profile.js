import { useState, useEffect } from 'react'
import './App.css';
import PocketBase from 'pocketbase';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const pb = new PocketBase('https://base.jn2p.de');
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [newPw, setNewPw] = useState('')
    const [newPwConf, setNewPwConf] = useState('')

    async function updateProfile(un, nm, newPass, newPassConf, currPass) {
        console.log('hello')
        console.log(un)
        console.log('hello')
        console.log(un || pb.authStore.model.username)
        let data = {
            "username": un || pb.authStore.model.username,
            "name": nm || pb.authStore.model.name,
        };
        if (newPass !== undefined && newPassConf === newPass && currPass !== undefined) {
            data = {
                ...data,
                "password": newPass,
                "passwordConfirm": newPassConf,
                "oldPassword": currPass,
            }
        }
        try {
            const record = await pb.collection('users').update(pb.authStore.model.id, data);
            navigate('/home')
        } catch (err) {
            console.log(err)
        }
        

    }

    return(
      <div className="App">
      <div className='App-body'>
        <p className="description">Edit the profile of: {pb.authStore.model.username}</p>
        <div>
            <label htmlFor="email">Email</label>
            <input id="email" type="text" value={pb.authStore.model.email} disabled />
        </div>
        <div>
            <label htmlFor="username">Username</label>
            <input
            id="username"
            type="text"
            value={username  || ''}
            onChange={(e) => setUsername(e.target.value)}
            />
      </div>
      <div>
            <label htmlFor="Name">Name</label>
            <input
            id="username"
            type="text"
            placeholder={'Not yet set'}
            value={name || ''}
            onChange={(e) => setName(e.target.value)}
            />
      </div>
      <div>
          <input
            className="inputField"
            type="password"
            placeholder="Current Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
      </div>
      <div>
          <input
            className="inputField"
            type="password"
            placeholder="New Password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
          />       
      </div>
      <div>
          <input
            className="inputField"
            type="password"
            placeholder="Confirm New Password"
            value={newPwConf}
            onChange={(e) => setNewPwConf(e.target.value)}
          />
      </div>
      <div>
        <button
          className="button block primary"
          onClick={() => navigate('/home')}
        >
        Go back
        </button>
        <button
          className="button block primary"
          onClick={() => updateProfile(username, name, newPw, newPwConf, password)}
        >
        Update Info
        </button>
      </div>
        
      </div>
    </div>
    )


}