import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MDBBtn, MDBContainer, MDBInput } from 'mdb-react-ui-kit';
import { resetPassword } from '../../../services/authService';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const token = searchParams.get('token') || '';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (password !== confirmation) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      navigate('/login?reset=success', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'El enlace no es válido o ha expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MDBContainer className="my-5" style={{ maxWidth: '520px' }}>
      <h1>Crear nueva contraseña</h1>
      {!token && <p className="text-danger">El enlace de recuperación no es válido.</p>}
      <form onSubmit={handleSubmit}>
        <MDBInput
          className="mb-4"
          label="Nueva contraseña"
          type="password"
          minLength="6"
          maxLength="72"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          disabled={!token}
        />
        <MDBInput
          className="mb-4"
          label="Confirmar contraseña"
          type="password"
          minLength="6"
          maxLength="72"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          required
          disabled={!token}
        />
        {error && <p className="text-danger">{error}</p>}
        <MDBBtn type="submit" disabled={loading || !token}>
          {loading ? 'Actualizando...' : 'Cambiar contraseña'}
        </MDBBtn>
      </form>
      <p className="mt-4"><Link to="/login">Volver al inicio de sesión</Link></p>
    </MDBContainer>
  );
}

export default ResetPassword;