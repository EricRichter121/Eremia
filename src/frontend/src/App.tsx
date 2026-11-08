import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import ObjectsPage from './pages/ObjectsPage'
import FavoritesPage from './pages/FavoritesPage'
import AstronomicalObjectPage from './pages/AstronomicalObjectPage'
import HomePage from './pages/HomePage'
import Header from './components/Header'
import Footer from './components/Footer'
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
          path="/objects/:objectId"
          element={
            <AstronomicalObjectPage
              onRequestSignIn={() => setIsSignInOpen(true)}
            />
          }
        />
        <Route
          path="/favorites"
          element={
            <FavoritesPage onRequestSignIn={() => setIsSignInOpen(true)} />
          }
        />
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
      />
    </>
  )
}

export default App
