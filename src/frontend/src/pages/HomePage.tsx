import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Skeleton from '../components/Skeleton'
import { useAstronomicalObjects, useObjectTypes } from '../hooks/useAstronomicalObjects'
import type { AstronomicalObject } from '../types/astronomicalObject'
import galaxyImage from '../assets/M104_Vollmer_4222.jpg'

const FEATURED_OBJECTS_LIMIT = 3

function FeaturedObjectCard({ object }: { object: AstronomicalObject }) {
  return (
    <article className="featured-card">
      <p className="featured-card__type">{object.object_type.name}</p>
      <h3>
        <Link to={`/objects/${object.id}`}>{object.name}</Link>
      </h3>
      <p className="featured-card__description">
        {object.description || 'No description available.'}
      </p>
      <Link className="featured-card__link" to={`/objects/${object.id}`}>
        View record <span aria-hidden="true">→</span>
      </Link>
    </article>
  )
}

function FeaturedObjects() {
  const {
    data: objectPage,
    error,
    isError,
    isPending,
    refetch,
  } = useAstronomicalObjects({ limit: FEATURED_OBJECTS_LIMIT })

  if (isPending) {
    return (
      <div className="featured-grid" role="status" aria-label="Loading featured objects">
        {Array.from({ length: FEATURED_OBJECTS_LIMIT }, (_, index) => (
          <article className="featured-card featured-card--loading" key={index}>
            <Skeleton width="84px" height="10px" />
            <Skeleton width="68%" height="23px" />
            <Skeleton width="100%" height="10px" />
            <Skeleton width="86%" height="10px" />
          </article>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="catalog-message catalog-message--error" role="alert">
        <h3>Featured records unavailable</h3>
        <p>
          {error instanceof Error
            ? error.message
            : 'Astronomical objects could not be loaded.'}
        </p>
        <button className="retry-button" type="button" onClick={() => void refetch()}>
          Try again
        </button>
      </div>
    )
  }

  if (!objectPage.objects.length) {
    return (
      <div className="catalog-message">
        <h3>No records in the archive yet</h3>
        <p>Featured astronomical objects will appear here when available.</p>
      </div>
    )
  }

  return (
    <div className="featured-grid">
      {objectPage.objects.map((object) => (
        <FeaturedObjectCard key={object.id} object={object} />
      ))}
    </div>
  )
}

function ArchiveTypes() {
  const { data: objectTypes, error, isError, isPending, refetch } = useObjectTypes()

  if (isPending) {
    return <p className="archive-types__status" role="status">Loading object types…</p>
  }

  if (isError) {
    return (
      <div className="archive-types__error" role="alert">
        <p>
          {error instanceof Error
            ? error.message
            : 'Object types could not be loaded.'}
        </p>
        <button className="retry-button" type="button" onClick={() => void refetch()}>
          Try again
        </button>
      </div>
    )
  }

  if (!objectTypes.length) {
    return <p className="archive-types__status">No object types are available yet.</p>
  }

  return (
    <ul className="archive-types">
      {objectTypes.map((objectType) => (
        <li key={objectType.id}>
          <Link to={`/objects?type=${objectType.id}`}>{objectType.name}</Link>
        </li>
      ))}
    </ul>
  )
}

function HomePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = searchTerm.trim()
    const searchParams = new URLSearchParams()
    if (query) searchParams.set('search', query)
    navigate(searchParams.size ? `/objects?${searchParams.toString()}` : '/objects')
  }

  return (
    <>
      <main className="home-page">
        <section className="home-hero" aria-labelledby="home-title">
          <div className="home-hero__content">
            <p className="eyebrow">The Eremia astronomical archive</p>
            <h1 id="home-title">Explore the Universe. Discover the Unknown.</h1>
            <p className="home-hero__description">
              A scientific archive of astronomical objects, their recorded
              properties, and the observations that help us understand them.
            </p>
            <form className="home-search" role="search" onSubmit={submitSearch}>
              <label className="visually-hidden" htmlFor="home-search-input">
                Search astronomical objects
              </label>
              <input
                id="home-search-input"
                className="home-search__input"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name, identifier, or type"
              />
              <button className="auth-button auth-button--primary" type="submit">
                Search
              </button>
            </form>
            <Link className="home-hero__browse" to="/objects">
              Explore the archive <span aria-hidden="true">→</span>
            </Link>
          </div>
          <figure className="home-hero__image">
            <img
              src={galaxyImage}
              alt="Spiral galaxy M104 surrounded by a field of stars."
            />
            <figcaption>DEEP-SKY IMAGE</figcaption>
          </figure>
        </section>

        <section className="home-about" aria-labelledby="home-about-title">
          <div>
            <p className="eyebrow">About the archive</p>
            <h2 id="home-about-title">A growing record of the cosmos</h2>
          </div>
          <p>
            Eremia brings astronomical objects together in one searchable
            archive. Records include scientific descriptions and physical
            parameters where available, making it easier to discover and explore
            the objects beyond our world.
          </p>
        </section>

        <section className="home-featured" aria-labelledby="home-featured-title">
          <div className="home-section-heading">
            <div>
              <p className="eyebrow">From the archive</p>
              <h2 id="home-featured-title">Featured objects</h2>
            </div>
            <Link className="home-section-heading__link" to="/objects">
              Browse all objects <span aria-hidden="true">→</span>
            </Link>
          </div>
          <FeaturedObjects />
        </section>

        <section className="home-explore" aria-labelledby="home-explore-title">
          <div className="home-explore__intro">
            <p className="eyebrow">Continue exploring</p>
            <h2 id="home-explore-title">Find your next point of discovery.</h2>
            <p>Search the full catalog or browse by the object types in the archive.</p>
            <Link className="auth-button auth-button--primary" to="/objects">
              Browse the catalog
            </Link>
          </div>
          <div className="home-explore__types">
            <h3>Browse by type</h3>
            <ArchiveTypes />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <div>
            <Link className="wordmark" to="/">
              <span className="wordmark__mark" aria-hidden="true">E</span>
              EREMIA
            </Link>
            <p>A scientific archive for discovering astronomical objects.</p>
          </div>
          <nav aria-label="Footer navigation">
            <Link to="/">Home</Link>
            <Link to="/objects">Catalog</Link>
            <Link to="/favorites">Favorites</Link>
          </nav>
        </div>
      </footer>
    </>
  )
}

export default HomePage
