import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from '@/pages/Index';

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Index />
      </TooltipProvider>
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
      expect(screen.getByText(/1 \/ 14/)).toBeInTheDocument();
    });
  });

  it('shows Data Ingestion as first step', async () => {
    renderApp();
    await waitFor(() => {
      expect(screen.getAllByText('Data Ingestion').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('displays progress at 0%', async () => {
    renderApp();
    await waitFor(() => {
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });
});
