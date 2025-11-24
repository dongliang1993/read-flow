import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/layout'
import { Home } from './pages/home'
import { Dashboard } from './pages/dashboard'
import { LibraryLayout } from './pages/library/layout'
import { AllBooks } from './pages/library/all-books'
import { Reading } from './pages/library/reading'
import { Finished } from './pages/library/finished'
import { Reader } from './pages/reader'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/reader/:bookId' element={<Reader />} />
        <Route path='/' element={<Layout />}>
          <Route index element={<Home />} />
          <Route path='dashboard' element={<Dashboard />} />
          <Route path='library' element={<LibraryLayout />}>
            <Route path='all' element={<AllBooks />} />
            <Route path='reading' element={<Reading />} />
            <Route path='finished' element={<Finished />} />
            <Route index element={<Navigate to='/library/all' replace />} />
          </Route>
          <Route path='*' element={<Navigate to='/' replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
