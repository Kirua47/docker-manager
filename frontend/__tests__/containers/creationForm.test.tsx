import { render, screen, fireEvent } from '@testing-library/react';
import CreationForm from '@/components/containers/CreationForm';

describe('CreationForm', () => {
  it('renderise les inputs obligatoires et permet la soumission', () => {
    const mockSubmit = jest.fn();
    render(<CreationForm onSubmit={mockSubmit} />);
    
    const nameInput = screen.getByLabelText(/nom du container/i);
    const imageInput = screen.getByLabelText(/image docker/i);
    const submitBtn = screen.getByRole('button', { name: /déployer/i });

    expect(nameInput).toBeInTheDocument();
    expect(imageInput).toBeInTheDocument();
    expect(submitBtn).toBeInTheDocument();

    fireEvent.change(nameInput, { target: { value: 'mon-app' } });
    fireEvent.change(imageInput, { target: { value: 'nginx:alpine' } });
    fireEvent.click(submitBtn);

    expect(mockSubmit).toHaveBeenCalledWith({ name: 'mon-app', image: 'nginx:alpine' });
  });
});
