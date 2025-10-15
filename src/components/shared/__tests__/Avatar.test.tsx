import { render, screen } from '@testing-library/react';
import { Avatar } from '../Avatar';

describe('Avatar Component', () => {
  it('renders image when src is provided', () => {
    render(
      <Avatar 
        src="https://example.com/avatar.jpg" 
        name="John Doe" 
        size="md" 
      />
    );
    
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    expect(image).toHaveAttribute('alt', 'John Doe');
  });

  it('renders initials when no src is provided', () => {
    render(
      <Avatar 
        name="John Doe Smith" 
        size="md" 
      />
    );
    
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('handles single name correctly', () => {
    render(
      <Avatar 
        name="John" 
        size="md" 
      />
    );
    
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { container } = render(
      <Avatar 
        name="John Doe" 
        size="lg" 
      />
    );
    
    const avatarDiv = container.firstChild;
    expect(avatarDiv).toHaveClass('w-20', 'h-20', 'text-2xl');
  });
});