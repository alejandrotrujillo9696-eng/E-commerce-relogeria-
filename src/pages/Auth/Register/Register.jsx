import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBInput,
  MDBIcon,
} from 'mdb-react-ui-kit';
import PasswordInput from '../../../components/PasswordInput/PasswordInput';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { register } from '../../../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import './Register.css';

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('El nombre es obligatorio'),
      lastName: Yup.string().required('El apellido es obligatorio'),
      email: Yup.string()
        .email('Correo electrónico inválido')
        .required('El correo electrónico es obligatorio'),
      password: Yup.string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .required('La contraseña es obligatoria'),
    }),

    onSubmit: async (values, { resetForm }) => {
      try {
        await dispatch(register(values)).unwrap();
        sessionStorage.setItem('justLoggedIn', '1');
        toast.success('¡Registro exitoso!');
        setTimeout(() => {
          resetForm();
          navigate('/');
        }, 2000);
      } catch (error) {
        toast.error(
          typeof error === 'string'
            ? error
            : 'Error al registrarse. Inténtalo de nuevo.'
        );
      }
    },
  });

  return (
    <>
      <ToastContainer />
      <MDBContainer
        fluid
        className="p-4 background-radial-gradient overflow-hidden"
      >
        <h1
          style={{
            color: 'white',
            textAlign: 'center',
            zIndex: '9',
            position: 'relative',
            fontWeight: 'bold',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            padding: '10px',
            borderRadius: '5px',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
          }}
        >
          Regístrate ahora
        </h1>
        <MDBRow>
          <MDBCol
            md="6"
            className="text-center text-md-start d-flex flex-column justify-content-center"
          >
            <h1
              className="my-5 display-3 fw-bold ls-tight px-3"
              style={{ color: 'hsl(218, 81%, 95%)' }}
            >
              Únete a la comunidad de <br />
              <span style={{ color: 'hsl(218, 81%, 75%)' }}>
                amantes de los relojes
              </span>
            </h1>
            <p className="px-3" style={{ color: 'hsl(218, 81%, 85%)' }}>
              Descubre un mundo de relojes premium y ofertas exclusivas al
              unirte a nuestra comunidad. Regístrate hoy para recibir
              recomendaciones personalizadas, acceso anticipado a nuevas
              colecciones, promociones especiales y mucho más. Sé el primero en
              conocer lanzamientos de edición limitada y descuentos exclusivos
              diseñados solo para ti. Ya seas un coleccionista experto o un
              comprador por primera vez, tu registro será la llave para elevar
              tu experiencia con los relojes.
            </p>
          </MDBCol>

          <MDBCol md="6" className="position-relative">
            <div
              id="radius-shape-1"
              className="position-absolute rounded-circle shadow-5-strong"
            ></div>
            <div
              id="radius-shape-2"
              className="position-absolute shadow-5-strong"
            ></div>

            <MDBCard className="my-5 bg-glass registation-form-input ">
              <MDBCardBody className="p-5 registation-form-input ">
                <form
                  onSubmit={formik.handleSubmit}
                  className="registation-form-input-feild "
                >
                  <MDBRow>
                    <MDBCol col="6">
                      <MDBInput
                        wrapperClass="mb-4"
                        label="Nombre"
                        id="firstName"
                        type="text"
                        {...formik.getFieldProps('firstName')}
                        className={
                          formik.touched.firstName && formik.errors.firstName
                            ? 'is-invalid'
                            : ''
                        }
                      />
                      {formik.touched.firstName && formik.errors.firstName && (
                        <div className="text-danger">
                          {formik.errors.firstName}
                        </div>
                      )}
                    </MDBCol>

                    <MDBCol col="6">
                      <MDBInput
                        wrapperClass="mb-4"
                        label="Apellido"
                        id="lastName"
                        type="text"
                        {...formik.getFieldProps('lastName')}
                        className={
                          formik.touched.lastName && formik.errors.lastName
                            ? 'is-invalid'
                            : ''
                        }
                      />
                      {formik.touched.lastName && formik.errors.lastName && (
                        <div className="text-danger">
                          {formik.errors.lastName}
                        </div>
                      )}
                    </MDBCol>
                  </MDBRow>

                  <MDBInput
                    wrapperClass="mb-4"
                    label="Usuario / Correo electrónico"
                    id="email"
                    type="email"
                    {...formik.getFieldProps('email')}
                    className={
                      formik.touched.email && formik.errors.email
                        ? 'is-invalid'
                        : ''
                    }
                  />
                  {formik.touched.email && formik.errors.email && (
                    <div className="text-danger">{formik.errors.email}</div>
                  )}

                  <PasswordInput
                    wrapperClass="mb-4"
                    label="Contraseña"
                    id="password"
                    {...formik.getFieldProps('password')}
                    className={
                      formik.touched.password && formik.errors.password
                        ? 'is-invalid'
                        : ''
                    }
                  />
                  {formik.touched.password && formik.errors.password && (
                    <div className="text-danger">{formik.errors.password}</div>
                  )}

                  <MDBBtn
                    className="w-100 mb-4"
                    size="md"
                    type="submit"
                    disabled={formik.isSubmitting}
                  >
                    {formik.isSubmitting ? 'Registrando...' : 'Registrarse'}
                  </MDBBtn>
                </form>

                <div className="text-center">
                  <p>o regístrate con:</p>
                  <MDBBtn
                    tag="a"
                    color="none"
                    className="mx-3"
                    style={{ color: '#1266f1' }}
                  >
                    <MDBIcon fab icon="facebook-f" size="sm" />
                  </MDBBtn>
                  <MDBBtn
                    tag="a"
                    color="none"
                    className="mx-3"
                    style={{ color: '#1266f1' }}
                  >
                    <MDBIcon fab icon="twitter" size="sm" />
                  </MDBBtn>
                  <MDBBtn
                    tag="a"
                    color="none"
                    className="mx-3"
                    style={{ color: '#1266f1' }}
                  >
                    <MDBIcon fab icon="google" size="sm" />
                  </MDBBtn>
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </>
  );
}

export default Register;
