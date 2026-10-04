import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import ObjectsPage from './pages/ObjectsPage'
import Header from './components/header'

function App() {
  return (
    <>
    <Header />
    <Routes>
      <Route path="/objects" element={<ObjectsPage />} />
      <Route path="/" element={<Navigate to="/objects" replace />} />
      {/* <Route path="*" element={<Navigate to="/objects" replace />} /> */}
    </Routes></>
  )
}

export default App
