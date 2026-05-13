import { render, screen } from '@testing-library/react';
import ContainerList from '@/components/dashboard/ContainerList';

describe('ContainerList', () => {
  it('affiche un message quand la liste est vide', () => {
    render(<ContainerList containers={[]} />);
    expect(screen.getByText(/aucun container/i)).toBeInTheDocument();
  });

  it('affiche la liste des containers avec leur statut', () => {
    const mockContainers = [
      { id: '1', name: 'nginx-proxy', image: 'nginx:latest', status: 'running' },
      { id: '2', name: 'db-mysql', image: 'mysql:8', status: 'stopped' },
    ];
    
    render(<ContainerList containers={mockContainers} />);
    
    expect(screen.getByText('nginx-proxy')).toBeInTheDocument();
    expect(screen.getByText('db-mysql')).toBeInTheDocument();
    expect(screen.getByText('running')).toBeInTheDocument();
    expect(screen.getByText('stopped')).toBeInTheDocument();
  });
});
