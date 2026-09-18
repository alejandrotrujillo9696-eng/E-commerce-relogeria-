import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MDBBtn, MDBContainer, MDBInput } from 'mdb-react-ui-kit';
import { requestPasswordReset } from '../../../services/authService';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await requestPasswordReset(email);
      setMessage(response.message || 'Si el correo está registrado, recibirás un enlace de recuperación.');
    } catch (requestError) {
      setError(requestError.message || 'No fue posible procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MDBContainer className="my-5" style={{ maxWidth: '520px' }}>
      <h1>Recuperar contraseña</h1>
      <p>Introduce tu correo y te enviaremos un enlace si existe una cuenta asociada.</p>
      <form onSubmit={handleSubmit}>
        <MDBInput
          className="mb-4"
          label="Correo electrónico"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        {message && <p className="text-success">{message}</p>}
        {error && <p className="text-danger">{error}</p>}
        <MDBBtn type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar enlace'}
        </MDBBtn>
      </form>
      <p className="mt-4"><Link to="/login">Volver al inicio de sesión</Link></p>
    </MDBContainer>
  );
}

export default ForgotPassword;