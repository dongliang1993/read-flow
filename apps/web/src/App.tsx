import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/layout'
import { Dashboard } from './pages/dashboard'
import { LibraryLayout } from './pages/library'
import { AllBooks } from './pages/library/all-books'
import { Reading } from './pages/library/reading'
import { Finished } from './pages/library/finished'
import { ReaderLayout } from './pages/reader/index'
import { ResetPasswordPage } from './pages/auth'
import { Settings } from './pages/settings'
import { AuthDialog } from './components/auth/auth-dialog'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AuthDialog />
      <Routes>
        <Route path='/auth/reset-password' element={<ResetPasswordPage />} />
        <Route path='/' element={<Layout />}>
          <Route path='library' element={<LibraryLayout />}>
            <Route path='all' element={<AllBooks />} />
            <Route path='reading' element={<Reading />} />
            <Route path='finished' element={<Finished />} />
            <Route index element={<Navigate to='/library/all' replace />} />
          </Route>
          <Route path='dashboard' element={<Dashboard />} />
          <Route path='settings' element={<Settings />} />
          <Route path='*' element={<Navigate to='/' replace />} />
        </Route>
        <Route path='/reader/:bookId' element={<ReaderLayout />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
