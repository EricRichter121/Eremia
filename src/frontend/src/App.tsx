import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import ObjectsPage from './pages/ObjectsPage'
import FavoritesPage from './pages/FavoritesPage'
import Header from './components/header'
import SignInModal from './components/auth/SignInModal'

function App() {
  const [isSignInOpen, setIsSignInOpen] = useState(false)

  return (
    <>
      <Header onRequestSignIn={() => setIsSignInOpen(true)} />
      <Routes>
        <Route
          path="/objects"
          element={
            <ObjectsPage onRequestSignIn={() => setIsSignInOpen(true)} />
          }
        />
        <Route
          path="/favorites"
          element={
            <FavoritesPage onRequestSignIn={() => setIsSignInOpen(true)} />
          }
        />
        <Route path="/" element={<Navigate to="/objects" replace />} />
      </Routes>
      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
      />
    </>
  )
}

export default App
