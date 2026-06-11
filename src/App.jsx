import { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import ChatWindow from './components/ChatWindow.jsx'
import AuthGate from './auth/AuthGate.jsx'
import { useAuth } from './auth/useAuth.js'
import { assertConfigured } from './config.js'
import { resetSession } from './lib/session.js'

export default function App() {
  const { authed, signIn, signOut, authEnabled } = useAuth()
  const [resetKey, setResetKey] = useState(0)

  useEffect(() => {
    assertConfigured()
  }, [])

  if (!authed) {
    return <AuthGate onSubmit={signIn} />
  }

  function newChat() {
    resetSession() // fresh conversation memory on the n8n side too
    setResetKey((k) => k + 1)
  }

  return (
    <div className="flex h-full flex-col">
      <Header
        onNewChat={newChat}
        onSignOut={signOut}
        showSignOut={authEnabled}
      />
      <ChatWindow resetKey={resetKey} />
    </div>
  )
}
