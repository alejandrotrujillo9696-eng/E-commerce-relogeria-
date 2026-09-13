import { useState } from 'react';
import PropTypes from 'prop-types';
import { MDBInput, MDBIcon, MDBBtn } from 'mdb-react-ui-kit';

function PasswordInput({
  id,
  label,
  value,
  onChange,
  wrapperClass = '',
  className = '',
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className={`position-relative ${wrapperClass}`}>
      <MDBInput
        id={id}
        label={label}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        className={className}
        style={{ paddingRight: '2.5rem' }}
        {...rest}
      />
      <MDBBtn
        type="button"
        color="none"
        className="position-absolute end-0 top-50 translate-middle-y me-2 border-0 bg-transparent"
        onClick={toggleVisibility}
        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        style={{ zIndex: 5, padding: '0.25rem' }}
      >
        <MDBIcon icon={showPassword ? 'eye-slash' : 'eye'} size="sm" />
      </MDBBtn>
    </div>
  );
}

PasswordInput.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  wrapperClass: PropTypes.string,
  className: PropTypes.string,
};

export default PasswordInput;
