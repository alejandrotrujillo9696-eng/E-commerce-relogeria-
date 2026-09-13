import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import HomeProductList from '../../components/HomeProduct/Home-ProductList';
import {
  MDBCarousel,
  MDBCarouselItem,
  MDBCarouselCaption,
  MDBRow,
  MDBCol,
} from 'mdb-react-ui-kit';
import { getHomeSectionRequest } from '../../services/homeSectionPublicService';
import './Home.css';

function Home() {
  const [sectionTitle, setSectionTitle] = useState('Nuestra colección exclusiva de relojes');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await getHomeSectionRequest();
        if (!active) return;
        if (data?.title) {
          setSectionTitle(data.title);
        }
      } catch {
        // keep default title
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="home-container">
      <MDBRow className="w-100">
        <MDBCol md="6">
          <video
            className="d-block w-100 hero-video"
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
        </MDBCol>

        <MDBCol md="5">
          <div className="hero-container">
            <h1 className="hero-FirstTitle">
              ROLEX SUBMARINER
              <br />
              Un clásico atemporal
            </h1>
            <br />
            <p className="hero-FirstDis">
              AT ofrece relojes elegantes y lujosos fabricados con movimientos
              suizos y materiales de alta calidad. Elige entre nuestros hermosos
              relojes de vestir, disponibles con o sin diamantes brillantes,
              para adaptarse a cualquier estilo y gusto.
            </p>
            <Link to="/products" className="hero-cta-button">
              Comprar ahora
            </Link>
          </div>
        </MDBCol>
      </MDBRow>

      <MDBRow className="w-100 second-grid">
        <MDBCol md="6">
          <img
            style={{ padding: '20px', width: '10%', textAlign: 'left' }}
            src="https://patek-res.cloudinary.com/video/upload/f_auto:video/dfsmedia/0906caea301d42b3b8bd23bd656d1711/266464-source/pp-5164g-001-screen-8-9-product-loop"
            className="w-100"
            alt=""
          />
        </MDBCol>
        <MDBCol md="6">
          <h1 style={{ position: 'relative' }}>VINTAGE DROP 5</h1>
          <p style={{ padding: '10px', width: '40%', textAlign: 'left' }}>
            Esta colección incluye relojes del archivo de Classique Watches.
            Cada reloj ha sido equipado con una batería nueva, ofreciendo la
            fiabilidad y calidad de un reloj nuevo, junto con el encanto del
            diseño vintage.
          </p>
          <Link to="/products?category=Vintage" className="hero-cta-button">
            Ver ahora
          </Link>
        </MDBCol>

        <MDBCarousel showControls showIndicators>
          <MDBCarouselItem itemId={1}>
            <img
              src="https://t4.ftcdn.net/jpg/08/11/15/35/360_F_811153575_lMjrbQdLXzP7seIWcK148VGZOPuREznn.jpg"
              className="d-block w-100 custom-height"
              alt="..."
            />
            <MDBCarouselCaption>
              <h5
                style={{
                  color: 'white',
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  padding: '10px',
                  borderRadius: '5px',
                  backdropFilter: 'blur(5px)',
                  WebkitBackdropFilter: 'blur(5px)',
                }}
              >
                Diver
              </h5>
              <p
                style={{
                  color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  padding: '5px',
                  borderRadius: '5px',
                  backdropFilter: 'blur(5px)',
                  WebkitBackdropFilter: 'blur(5px)',
                }}
              >
                Nulla vitae elit libero, a pharetra augue mollis interdum.
              </p>
              <Link to="/products?category=Diver" className="hero-cta-button">
                Comprar ahora
              </Link>
            </MDBCarouselCaption>
          </MDBCarouselItem>

          <MDBCarouselItem itemId={2}>
            <img
              src="https://www.bobswatches.com/rolex-blog/wp-content/uploads/2024/03/How-to-set-a-watch-Banner.jpg"
              className="d-block w-100 custom-height"
              alt="..."
            />

            <MDBCarouselCaption>
              <h5
                style={{
                  color: 'white',
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  padding: '10px',
                  borderRadius: '5px',
                  backdropFilter: 'blur(5px)',
                  WebkitBackdropFilter: 'blur(5px)',
                }}
              >
                Classic
              </h5>
              <p
                style={{
                  color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  padding: '5px',
                  borderRadius: '5px',
                  backdropFilter: 'blur(5px)',
                  WebkitBackdropFilter: 'blur(5px)',
                }}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
              <Link to="/products?category=Classic" className="hero-cta-button">
                Comprar ahora
              </Link>
            </MDBCarouselCaption>
          </MDBCarouselItem>
          <MDBCarouselItem itemId={3}>
            <img
              src="https://www.watchgecko.com/cdn/shop/articles/BANNER-Ocean-Scout-Ice-and-Frost_e2754800-10bd-4f32-a24b-8c084a21922c_1100x.jpg?v=1704441601"
              className="d-block w-100 custom-height"
              alt=""
            />
            <MDBCarouselCaption>
              <h5
                style={{
                  color: 'white',
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  padding: '10px',
                  borderRadius: '5px',
                  backdropFilter: 'blur(5px)',
                  WebkitBackdropFilter: 'blur(5px)',
                }}
              >
                Modern
              </h5>
              <p
                style={{
                  color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  padding: '5px',
                  borderRadius: '5px',
                  backdropFilter: 'blur(5px)',
                  WebkitBackdropFilter: 'blur(5px)',
                }}
              >
                Praesent commodo cursus magna, vel scelerisque nisl consectetur.
              </p>
              <Link to="/products?category=Modern" className="hero-cta-button">
                Comprar ahora
              </Link>
            </MDBCarouselCaption>
          </MDBCarouselItem>
        </MDBCarousel>

        <div className="hero-section">
          <div className="hero-content">
            <h1>Bienvenido a mi tienda online de relojes de lujo</h1>
            <p>
              Descubre relojes de lujo y clásicos fabricados con precisión y
              elegancia.
            </p>
            <Link to="/products" className="cta-button">
              Comprar ahora
            </Link>
          </div>
        </div>

        {/* Featured Product Section */}
        <section className="featured-section">
          <h2 className="section-title">
            {sectionTitle}
          </h2>
          <p className="section-description">
            Diseños atemporales, artesanía incomparable y un compromiso con la
            excelencia.
          </p>
          <HomeProductList />
        </section>
      </MDBRow>
    </div>
  );
}

export default Home;
