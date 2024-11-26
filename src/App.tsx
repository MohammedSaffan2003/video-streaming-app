import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes';
import Navbar from './components/layout/Navbar';
import { useTheme } from './hooks/useTheme';

const queryClient = new QueryClient();

function App() {
  const { theme } = useTheme();

  return (
    <div className={theme}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <AppRoutes />
            </main>
          </div>
          <Toaster position="bottom-right" />
        </Router>
      </QueryClientProvider>
    </div>
  );
}

export default App;