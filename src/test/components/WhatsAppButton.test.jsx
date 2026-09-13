import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import WhatsAppButton from '../../components/WhatsAppButton/WhatsAppButton';

describe('WhatsAppButton', () => {
  beforeEach(() => {
    delete import.meta.env.VITE_WHATSAPP_NUMBER;
  });

  it('no renderiza el botón cuando no hay número configurado', () => {
    const { container } = render(<WhatsAppButton />);
    expect(container.querySelector('.whatsapp-button')).toBeNull();
  });

  it('renderiza el botón con el enlace de WhatsApp correcto', () => {
    import.meta.env.VITE_WHATSAPP_NUMBER = '+1234567890';
    render(<WhatsAppButton />);

    const button = screen.getByRole('link', {
      name: /contáctate con nosotros/i,
    });
    expect(button).toBeDefined();
    expect(button.getAttribute('href')).toBe('https://wa.me/1234567890');
    expect(button.getAttribute('aria-label')).toBe(
      'Contáctate con nosotros por WhatsApp'
    );
  });

  it('renderiza el tooltip con el texto esperado', () => {
    import.meta.env.VITE_WHATSAPP_NUMBER = '+1234567890';
    render(<WhatsAppButton />);

    expect(screen.getByText('Contáctate con nosotros')).toBeDefined();
  });
});
