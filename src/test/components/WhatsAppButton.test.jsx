import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WhatsAppButton from '../../components/WhatsAppButton/WhatsAppButton';

describe('WhatsAppButton', () => {
  it('renderiza el botón con el enlace de WhatsApp hardcodeado', () => {
    render(<WhatsAppButton />);

    const button = screen.getByRole('link', {
      name: /contáctate con nosotros/i,
    });
    expect(button).toBeDefined();
    expect(button.getAttribute('href')).toBe('https://wa.me/573118148510');
    expect(button.getAttribute('aria-label')).toBe(
      'Contáctate con nosotros por WhatsApp'
    );
  });

  it('renderiza el tooltip con el texto esperado', () => {
    render(<WhatsAppButton />);

    expect(screen.getByText('Contáctate con nosotros')).toBeDefined();
  });
});
