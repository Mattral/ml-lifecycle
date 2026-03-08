import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('App integration', () => {
  it('renders the ML Explorer title', async () => {
    renderApp();
    await waitFor(() => {
      expect(screen.getByText('ML Explorer')).toBeInTheDocument();
    });
  });

  it('shows 14 steps in progress indicator', async () => {
    renderApp();
    await waitFor(() => {
      expect(screen.getByText(/Step 1 of 14/)).toBeInTheDocument();
    });
  });

  it('shows Data Ingestion as first step', async () => {
    renderApp();
    await waitFor(() => {
      expect(screen.getByText('Data Ingestion')).toBeInTheDocument();
    });
  });

  it('displays progress at 0%', async () => {
    renderApp();
    await waitFor(() => {
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });
});
