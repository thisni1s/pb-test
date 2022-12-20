import { useState, useEffect } from 'react'
import './App.css';
import PocketBase from 'pocketbase';
import { useNavigate } from 'react-router-dom';

export default function NewEntry() {
    const pb = new PocketBase('https://base.jn2p.de');
    const navigate = useNavigate()
    const [duration, setDuration] = useState(0)
    const [description, setDescription] = useState('')

    async function createEntry(dur, desc) {
        try {
          const data = {
            "user": pb.authStore.model.id,
            "duration_min": dur,
            "description": desc,
          };
        
        const record = await pb.collection('work_entries').create(data);
        navigate('/home')
        } catch (err) {
            console.log(err)
        }
        

    }

    return(
      <div className="App">
      <div className='App-body'>
        <p className="description">New Work Entry</p>
        <div>
            <label htmlFor="duration">Duration in Minutes</label>
            <input
            id="duration"
            type="number"
            value={duration  || 0}
            onChange={(e) => setDuration(e.target.value)}
            />
        </div>
        <div>
            <label htmlFor="description">Description</label>
            <input
            id="description"
            type="text"
            placeholder={'Description of the work.'}
            value={description || ''}
            onChange={(e) => setDescription(e.target.value)}
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
          onClick={() => createEntry(duration, description)}
        >
        Save entry!
        </button>
      </div>
        
      </div>
    </div>
    )


}