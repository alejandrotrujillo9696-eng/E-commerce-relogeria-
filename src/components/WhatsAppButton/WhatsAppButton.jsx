import { MDBIcon } from 'mdb-react-ui-kit';
import './WhatsAppButton.css';

function WhatsAppButton() {
  const rawNumber = import.meta.env.VITE_WHATSAPP_NUMBER;
  if (!rawNumber) {
    return null;
  }

  const href = `https://wa.me/${rawNumber.replace(/[^0-9]/g, '')}`;

  return (
    <a
      href={href}
      className="whatsapp-button"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contáctate con nosotros por WhatsApp"
      tabIndex={0}
    >
      <MDBIcon fab icon="whatsapp" size="lg" />
      <span className="whatsapp-tooltip" aria-hidden="true">
        Contáctate con nosotros
      </span>
    </a>
  );
}

export default WhatsAppButton;
