import { Link } from 'react-router-dom';
import HomeProductList from '../../components/HomeProduct/Home-ProductList';
import './Home.css';

function Home() {
  return (
    <main className="home-container">

      {/* HERO */}
      <section className="hero">

  <video
    className="hero-video"
    autoPlay
    muted
    loop
    playsInline
  >
    <source
      src="https://media.rolex.com/video/upload/c_limit,q_auto:best,w_2160/vc_vp9/v1/rolexcom/collection/family-pages/professional-watches/submariner/family-page/2026/videos/player-expland/long-film/professsional-watches-submariner-film.webm"
      type="video/webm"
    />

    Tu navegador no soporta la reproducción de video.
  </video>

  <div className="hero-overlay"></div>

  <div className="hero-content">

    <p className="eyebrow">
      RELOJES DE LUJO
    </p>

    <h1>
      El valor de cada minuto
    </h1>

    <p>
      Descubre piezas exclusivas diseñadas para quienes
      valoran la precisión, el estilo y la distinción.
    </p>

    <div className="hero-actions">

      <Link
        to="/products"
        className="btn btn-primary"
      >
        Ver la colección
      </Link>

      <Link
        to="https://wa.me/573118148510"
        className="btn btn-secondary"
      >
        Contáctanos
      </Link>

    </div>

  </div>

</section>


      {/* COLECCIÓN */}
      <section className="section" id="coleccion">

        <div className="collection-banner">

  <video
    autoPlay
    muted
    loop
    playsInline
  >
    <source
      src="https://patek-res.cloudinary.com/video/upload/f_auto:video/dfsmedia/0906caea301d42b3b8bd23bd656d1711/266463-source/pp-5260-355r-001-screen-8-9-product-loop"
      type="video/mp4"
    />
  </video>

  <div className="collection-overlay"></div>

  <div className="collection-text">
    <p className="eyebrow">
      COLECCIÓN DESTACADA
    </p>

    <h2>
      Modelos que combinan diseño,
      elegancia y exclusividad
    </h2>
  </div>

</div>

        <HomeProductList />

      </section>


      {/* BENEFICIOS */}
      <section className="section benefits">

        <div className="section-heading">
          <p className="eyebrow">
            POR QUÉ ELEGIRNOS
          </p>

          <h2>
            Calidad y confianza en cada compra
          </h2>
        </div>

        <div className="benefits-grid">

          <article className="benefit-card">
            <h3>Autenticidad garantizada</h3>
            <p>
              Todos nuestros relojes cuentan con
              información de origen.
            </p>
          </article>

          <article className="benefit-card">
            <h3>Envíos seguros</h3>
            <p>
              Protegemos cada entrega con procesos
              especializados.
            </p>
          </article>

          <article className="benefit-card">
            <h3>Atención personalizada</h3>
            <p>
              Te ayudamos a encontrar el reloj
              adecuado para ti.
            </p>
          </article>

          <article className="benefit-card">
            <h3>Exclusividad</h3>
            <p>
              Una selección de relojes para quienes
              buscan piezas especiales.
            </p>
          </article>

        </div>

      </section>


      {/* DESTACADO */}
      <section className="section featured">

        <div className="featured-content">
          <p className="eyebrow">
            DESTACADO DEL MES
          </p>

          <h2>
            Patek Philippe Woman
          </h2>

          <p>
            Una pieza de colección que representa
            la excelencia relojera.
          </p>

          <Link
            to="/products"
            className="btn btn-primary"
          >
            Explorar producto
          </Link>
        </div>

        <div className="featured-media">
    <img
      src="https://patek-res.cloudinary.com/dfsmedia/0906caea301d42b3b8bd23bd656d1711/278408-51883"
      alt="Patek Philippe"
    />
  </div>

      </section>

      
       {/* Esto OTRO CONTENEDOR PARA NUEVOS RELOGES */}

       <section className="section" id="coleccion">

        <div className="collection-banner">

  <video
    autoPlay
    muted
    loop
    playsInline
  >
    <source
      src="https://patek-res.cloudinary.com/video/upload/f_auto:video/dfsmedia/0906caea301d42b3b8bd23bd656d1711/299245-source/pp-5822p-001-screen-20-13-en-cubitus-launch-film-loop"
      type="video/mp4"
    />
  </video>

  <div className="collection-overlay"></div>

  <div className="collection-text">
    <p className="eyebrow">
      {/* HAZ TUYA LA EXCLUSIVIDAD */}
    </p>

    <h2>
      HAZ TUYA LA EXCLUSIVIDAD
    </h2>
  </div>

</div>

        <HomeProductList />

      </section>

      

    </main>
  );
}

export default Home;