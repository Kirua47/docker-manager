import { render, screen } from '@testing-library/react';
import LogsModal from '@/components/monitoring/LogsModal';

describe('LogsModal', () => {
  it('n\'affiche rien si isOpen est false', () => {
    render(<LogsModal isOpen={false} onClose={jest.fn()} logs="test logs" />);
    expect(screen.queryByText(/logs du container/i)).not.toBeInTheDocument();
  });

  it('affiche les logs quand isOpen est true', () => {
    render(<LogsModal isOpen={true} onClose={jest.fn()} logs="Starting NGINX..." />);
    expect(screen.getByText(/logs du container/i)).toBeInTheDocument();
    expect(screen.getByText(/Starting NGINX.../i)).toBeInTheDocument();
  });
});
