import { useState, useEffect } from 'react'
import './App.css';
import { useNavigate } from 'react-router-dom';
import PocketBase from 'pocketbase';

export default function Home() {
  const pb = new PocketBase('https://base.jn2p.de');
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  useEffect(() => {
    async function getWorkEntries() {
      console.log('Call me maybe')
      try {
        const records = await pb.collection('work_entries').getFullList(10, {
          sort: '-created',
          filter: 'user="'+pb.authStore.model.id+'"',
        });
        setEntries(records)
      } catch (error) {
        console.log(error)
      }      
    }
    getWorkEntries()
  }, [])


    async function logout() {       
      pb.authStore.clear();
      navigate('/auth')
    }

    const listEntries = entries.map((entry)=>{
        if (entry != undefined) {
          console.log(entry)
          return (
            <li key={entry.id}>
            <b>{entry.duration_min} Minutes    </b>
            <span>{entry.description}</span>
          </li>
          )
        } else {
          return (<></>)
        }
      })
  



    return(
      <div className="App">
      <div className='App-body'>
        <p className="description">Hello {pb.authStore.model.username} you are logged in!</p>
        <div>
          <p className='description'>You're last work entries:</p>
          <ul>{listEntries}</ul>
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
          <button
            onClick={(e) => {
              e.preventDefault()
              navigate('/newEntry')
            }}
            className={'button block'}
          >
          New Entry
          </button>
        </div>
      </div>
    </div>
    )


}