import { useState, useEffect } from 'react'
import './App.css';
import { useNavigate } from 'react-router-dom';
import PocketBase from 'pocketbase';

export default function Home() {
    useEffect(() => {
        //console.log(pb.authStore.model);
    })
    const pb = new PocketBase('https://base.jn2p.de');
    const navigate = useNavigate()

    async function logout() {       
      pb.authStore.clear();
      navigate('/auth')
    }

    return(
      <div className="App">
      <div className='App-body'>
        <p className="description">Hello {pb.authStore.model.username} you are logged in!</p>
        <div>
          <p className='description'>This is your data:</p>
          <ul>
            <li>Username: {pb.authStore.model.username}</li>
            <li>E-Mail: {pb.authStore.model.email || 'Not set'}</li>
            <li>Name: {pb.authStore.model.name || 'Not set'}</li>
            <li>ID: {pb.authStore.model.id || 'Not set'}</li>
          </ul>
          Your account was created at: {pb.authStore.model.created}
        </div>
        <div>
          <button
            onClick={(e) => {
              e.preventDefault()
              logout()
            }}
            className={'button block'}
          >
          Logout
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              navigate('/profile')
            }}
            className={'button block'}
          >
          Edit Profile
          </button>
        </div>
      </div>
    </div>
    )


}