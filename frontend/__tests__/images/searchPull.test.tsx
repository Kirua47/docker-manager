import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '@/components/images/SearchBar';

describe('SearchBar', () => {
  it('permet de taper une recherche et de soumettre', () => {
    const mockSearch = jest.fn();
    render(<SearchBar onSearch={mockSearch} />);
    
    const input = screen.getByPlaceholderText(/rechercher une image/i);
    const button = screen.getByRole('button', { name: /chercher/i });

    fireEvent.change(input, { target: { value: 'ubuntu' } });
    fireEvent.click(button);

    expect(mockSearch).toHaveBeenCalledWith('ubuntu');
  });
});
