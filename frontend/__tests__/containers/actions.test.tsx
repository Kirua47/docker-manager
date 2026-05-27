import { render, screen, fireEvent } from '@testing-library/react';
import ActionButtons from '@/components/containers/ActionButtons';

describe('Composant ActionButtons', () => {
  const mockOnStart = jest.fn();
  const mockOnStop = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche le bouton Démarrer si le container est arrêté', () => {
    render(<ActionButtons status="stopped" onStart={mockOnStart} onStop={mockOnStop} onDelete={mockOnDelete} />);
    
    const startButton = screen.getByRole('button', { name: /démarrer/i });
    expect(startButton).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /arrêter/i })).not.toBeInTheDocument();
    
    fireEvent.click(startButton);
    expect(mockOnStart).toHaveBeenCalledTimes(1);
  });

  it('affiche le bouton Arrêter si le container est en cours d\'exécution', () => {
    render(<ActionButtons status="running" onStart={mockOnStart} onStop={mockOnStop} onDelete={mockOnDelete} />);
    
    const stopButton = screen.getByRole('button', { name: /arrêter/i });
    expect(stopButton).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /démarrer/i })).not.toBeInTheDocument();
    
    fireEvent.click(stopButton);
    expect(mockOnStop).toHaveBeenCalledTimes(1);
  });

  it('affiche toujours le bouton Supprimer', () => {
    render(<ActionButtons status="stopped" onStart={mockOnStart} onStop={mockOnStop} onDelete={mockOnDelete} />);
    
    const deleteButton = screen.getByRole('button', { name: /supprimer/i });
    expect(deleteButton).toBeInTheDocument();
    
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });
});
