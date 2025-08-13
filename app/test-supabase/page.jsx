'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function TestStoragePage() {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('Not signed in.')
  const [files, setFiles] = useState([])
  const [user, setUser] = useState(null)

  // Sign in anonymously for testing
  useEffect(() => {
    const signIn = async () => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google', // you can also use GitHub, etc.
      })
      if (error) setStatus(`Sign-in error: ${error.message}`)
      else setStatus('Signed in, ready to upload.')
    }
    signIn()
  }, [])

  // Fetch files in private folder
  const fetchFiles = async () => {
    if (!user) return
    const { data, error } = await supabase.storage.from('uploads').list('private') // matches your policy folder

    if (error) console.error('Error fetching files:', error.message)
    else setFiles(data)
  }

  const handleUpload = async () => {
    if (!file) return alert('Select a file first')
    if (!user) return alert('User not signed in.')

    setStatus('Uploading...')

    const fileName = `${Date.now()}-${file.name}`

    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(`private/${fileName}`, file)

    if (error) setStatus(`Upload failed: ${error.message}`)
    else {
      setStatus(`Upload succeeded! File path: ${data.path}`)
      fetchFiles()
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Supabase Storage Test</h1>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} className="mt-4" />
      <button onClick={handleUpload} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded">
        Upload to private folder
      </button>

      <p className="mt-4">{status}</p>

      <h2 className="text-lg font-semibold mt-6">Uploaded Files</h2>
      <ul className="mt-2">
        {files.map((f) => (
          <li key={f.name}>{f.name}</li>
        ))}
      </ul>
    </div>
  )
}
