import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useScrollToSection } from '../hooks/useScrollToSection'
import { LEGAL_DOCS, type LegalDoc } from '../content/legal'

const LegalPage = ({ doc }: { doc: LegalDoc }) => {
  useDocumentTitle(doc.title, doc.intro)
  const scrollToSection = useScrollToSection()
  return (
    <main className="legal">
      <div className="legal-eyebrow">Help</div>
      <h1 className="serif">{doc.title}</h1>
      <p className="legal-intro">{doc.intro}</p>
      <div className="legal-updated">Last updated {doc.updated}</div>

      {doc.sections.map((s) => (
        <section key={s.heading}>
          <h2>{s.heading}</h2>
          {s.body.map((p) => <p key={p}>{p}</p>)}
        </section>
      ))}

      <nav className="legal-more" aria-label="More help">
        {LEGAL_DOCS.filter((d) => d.slug !== doc.slug).map((d) => (
          <Link key={d.slug} to={`/${d.slug}`}>{d.title}</Link>
        ))}
        <button type="button" onClick={() => scrollToSection('contact')}>Contact us</button>
      </nav>
    </main>
  )
}

export default LegalPage
