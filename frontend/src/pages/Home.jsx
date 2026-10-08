import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { inicializarDatosDemo, getServicios } from '../services/apiService';
import clinica from '../assets/clinica.png';

// Ícono de Bootstrap Icons según la categoría del servicio
const ICONOS = {
  'Atención Básica': 'bi-heart-pulse',
  'Preventiva': 'bi-bandaid',
  'Quirúrgica': 'bi-scissors',
};

export const Home = () => {
  const [servicios] = useState(() => {
    inicializarDatosDemo();
    return getServicios();
  });

  return (
    <Layout>
      <section className="hero-publico text-center py-5">
        <div className="container py-4 py-md-5">
          <h1 className="display-5 display-md-4 fw-bold mb-3">
            Cuidamos a tu mejor amigo <br className="d-none d-md-block" /> como si fuera nuestro
          </h1>
          <p className="lead mb-4 text-warning">
            Medicina preventiva, urgencias y especialidades con el mejor equipo de Rancagua.
          </p>
          <Link to="/agendar" className="btn btn-warning btn-lg fw-bold text-dark px-4">
            <i className="bi bi-calendar-check"></i> Agendar cita
          </Link>
        </div>
      </section>

      <section className="container py-5">
        <div className="text-center mb-5">
          <h2 className="text-warning fw-bold">Nuestras especialidades</h2>
          <p className="text-muted">Atención integral para el bienestar de tu mascota</p>
        </div>
        <div className="row g-4 text-center">
          {servicios.map((s) => (
            <div key={s.id} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body p-4 d-flex flex-column align-items-center">
                  <i className={`bi ${ICONOS[s.categoria] || 'bi-heart'} icono-servicio`}></i>
                  <h4 className="card-title mt-3">{s.nombre}</h4>
                  <p className="card-text text-muted">{s.descripcion}</p>
                  <span className="fw-bold text-warning mt-auto">
                    ${s.precio.toLocaleString('es-CL')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-5">
          <Link to="/agendar" className="btn btn-outline-warning">
            Ver catálogo y agendar
          </Link>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-12 col-md-6">
              <img src={clinica} alt="Veterinaria San Marcos" className="img-fluid rounded-3 shadow" />
            </div>
            <div className="col-12 col-md-6">
              <h2 className="fw-bold text-warning mb-3">Sobre Veterinaria San Marcos</h2>
              <p className="lead">Pasión y dedicación por los animales desde 2009.</p>
              <p className="text-muted">
                Fundada en 2009 por <strong>Kevin Sosa</strong>, un hombre que ama a los animales de todas las
                especies y los trata con cariño y delicadeza. Se dice que tiene un <strong>don</strong> con
                ellos, y junto a su familia y amigos decidió abrir una veterinaria. Ese cariño se ha pasado de
                generación en generación.
              </p>
              <p className="text-muted">
                Nuestro compromiso es entregar un servicio de excelencia, con las mejores herramientas para
                exámenes y diagnósticos rápidos y precisos, para que tu mascota quede como nueva.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};
