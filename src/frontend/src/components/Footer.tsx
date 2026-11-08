import { Link } from 'react-router-dom'

const astronomicalResources = [
  { label: 'NASA', href: 'https://www.nasa.gov/' },
  { label: 'ESA', href: 'https://www.esa.int/' },
  {
    label: 'NASA Exoplanet Archive',
    href: 'https://exoplanetarchive.ipac.caltech.edu/',
  },
  {
    label: 'SIMBAD Astronomical Database',
    href: 'https://simbad.cds.unistra.fr/simbad/',
  },
]

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__content">
          <div className="site-footer__brand">
            <Link className="wordmark" to="/" aria-label="Eremia home">
              <span className="wordmark__mark" aria-hidden="true">E</span>
              EREMIA
            </Link>
            <p>An astronomical object archive.</p>
            <p className="site-footer__supporting">
              A personal project dedicated to exploring the universe.
            </p>
          </div>

          <nav className="site-footer__resources" aria-label="Astronomy resources">
            <h2>External resources</h2>
            {astronomicalResources.map(({ label, href }) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer">
                {label}
              </a>
            ))}
          </nav>

          <div className="site-footer__project">
            <h2>Project</h2>
            <a
              href="https://github.com/EricRichter121/Eremia"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub repository
            </a>
            <p>Independently built and maintained.</p>
          </div>
        </div>

        <div className="site-footer__bottom">
          <span>© {new Date().getFullYear()} Eremia</span>
          <span>Built for exploration.</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
