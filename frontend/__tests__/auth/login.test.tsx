import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from '@/components/auth/LoginForm';

// Mock du router de Next.js pour nos futurs tests
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
    };
  },
}));

describe('Composant LoginForm', () => {
  it('doit afficher les champs email, mot de passe et le bouton de connexion', () => {
    render(<LoginForm />);
    
    // On s'attend à trouver les inputs
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    
    // On s'attend à trouver le bouton de soumission
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });

  it('doit permettre de taper dans les champs', () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);

    fireEvent.change(emailInput, { target: { value: 'test@admin.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@admin.com');
    expect(passwordInput).toHaveValue('password123');
  });
});
