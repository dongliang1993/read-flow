import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import App from './App'
import { queryClient } from './lib/query-client'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
    <Toaster
      position='top-center'
      style={
        {
          '--width': '200px',
        } as React.CSSProperties
      }
      icons={{
        success: null,
      }}
    />
  </QueryClientProvider>
)
