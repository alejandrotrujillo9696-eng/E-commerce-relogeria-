import { Link } from 'react-router-dom';
import {
  MDBFooter,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBIcon,
} from 'mdb-react-ui-kit';
import './Footer.css';

function Footer() {
  return (
    <MDBFooter className="site-footer">

      {/* =========================================
          FRASE DE MARCA + REDES
      ========================================= */}

      <section className="footer-top">

        <div className="footer-brand-phrase">
          <h2>El verdadero lujo no es tener más, es tener el tiempo en tus manos.</h2>
        </div>

        <div className="footer-social">

          <span className="footer-social-label">
            Síguenos
          </span>

          <div className="footer-social-icons">

            <a
              href="#"
              aria-label="Facebook"
              className="footer-social-link"
            >
              <MDBIcon fab icon="facebook-f" />
            </a>

            <a
              href="#"
              aria-label="Twitter"
              className="footer-social-link"
            >
              <MDBIcon fab icon="twitter" />
            </a>

            <a
              href="#"
              aria-label="Instagram"
              className="footer-social-link"
            >
              <MDBIcon fab icon="instagram" />
            </a>

            <a
              href="#"
              aria-label="LinkedIn"
              className="footer-social-link"
            >
              <MDBIcon fab icon="linkedin" />
            </a>

            <a
              href="#"
              aria-label="GitHub"
              className="footer-social-link"
            >
              <MDBIcon fab icon="github" />
            </a>

          </div>

        </div>

      </section>


      {/* =========================================
          CONTENIDO PRINCIPAL
      ========================================= */}

      <section className="footer-main">

        <MDBContainer>

          <MDBRow className="footer-content">


            {/* =====================================
                MARCA
            ===================================== */}

            <MDBCol
              md="6"
              lg="4"
              className="footer-column footer-brand-column"
            >

              <h3 className="footer-brand-name">
                MANUEL
                <span>BONILLA</span>
              </h3>

              <p className="footer-brand-description">
                Relojería de lujo y elegancia.
                Una selección de piezas diseñadas
                para quienes valoran la precisión,
                el estilo y la exclusividad.
              </p>

              <div className="footer-brand-line"></div>

              <p className="footer-brand-location">
                Garzón, Huila, Colombia
              </p>

            </MDBCol>


            {/* =====================================
                PRODUCTOS
            ===================================== */}

            <MDBCol
              md="6"
              lg="2"
              className="footer-column"
            >

              <h4 className="footer-column-title">
                Productos
              </h4>

              <ul className="footer-links">

                <li>
                  <Link to="/products">
                    Todos
                  </Link>
                </li>

                <li>
                  <Link to="/products?category=Diver">
                    Buceo
                  </Link>
                </li>

                <li>
                  <Link to="/products?category=Classic">
                    Clásicos
                  </Link>
                </li>

                <li>
                  <Link to="/products?category=Modern">
                    Modernos
                  </Link>
                </li>

              </ul>

            </MDBCol>


            {/* =====================================
                ENLACES
            ===================================== */}

            <MDBCol
              md="6"
              lg="2"
              className="footer-column"
            >

              <h4 className="footer-column-title">
                Enlaces
              </h4>

              <ul className="footer-links">

                <li>
                  <Link to="/">
                    Inicio
                  </Link>
                </li>

                <li>
                  <Link to="/products">
                    Productos
                  </Link>
                </li>

                <li>
                  <Link to="/cart">
                    Carrito
                  </Link>
                </li>

                <li>
                  <Link to="/orders">
                    Mis pedidos
                  </Link>
                </li>

                <li>
                  <Link to="https://wa.me/573118148510" target="_blank" rel="noopener noreferrer">
                    Contacto
                  </Link>
                </li>

              </ul>

            </MDBCol>


            {/* =====================================
                CONTACTO
            ===================================== */}

            <MDBCol
              md="6"
              lg="3"
              className="footer-column"
            >

              <h4 className="footer-column-title">
                Contacto
              </h4>

              <div className="footer-contact">

                <p>
                  <MDBIcon icon="map-marker-alt" />
                  Garzón, Huila, Colombia
                </p>

                <p>
                  <MDBIcon icon="envelope" />

                  <a href="mailto:manuel11bonilla502@gmail.com" target="_blank" rel="noopener noreferrer">
                    manuel11bonilla502@gmail.com
                  </a>
                </p>

                <p>
                  <MDBIcon icon="phone" />

                  <a href="https://wa.me/573118148510" target="_blank" rel="noopener noreferrer">
                    WhatsApp: +57 311 814 8510
                  </a>
                </p>

                <p>
                  <Link to="https://wa.me/573132811796" target="_blank" rel="noopener noreferrer">
                    Alejandro Trujillo Desarrollador web 
                  </Link>
                </p>

              </div>

            </MDBCol>

          </MDBRow>

        </MDBContainer>

      </section>


      {/* =========================================
          GARANTÍAS / CONFIANZA
      ========================================= */}

      <section className="footer-benefits">

        <MDBContainer>

          <div className="footer-benefits-container">

            <div className="footer-benefit">

              <MDBIcon icon="shield-alt" />

              <span>
                Compra segura
              </span>

            </div>


            <div className="footer-benefit">

              <MDBIcon icon="shipping-fast" />

              <span>
                Envíos seguros
              </span>

            </div>


            <div className="footer-benefit">

              <MDBIcon icon="gem" />

              <span>
                Productos seleccionados
              </span>

            </div>


            <div className="footer-benefit">

              <MDBIcon icon="user" />

              <span>
                Atención personalizada 
              </span>

            </div>

          </div>

        </MDBContainer>

      </section>


      {/* =========================================
          COPYRIGHT
      ========================================= */}

      <div className="footer-bottom">

        <p>
          © 2026 <span>Alejandro Trujillo</span>
        </p>

        <p>
          Todos los derechos reservados.
        </p>

      </div>

    </MDBFooter>
  );
}

export default Footer;