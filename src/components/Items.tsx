import PopularCategory from './PopularCategory';

const Items = () => {
  return (
    <main>
      <div className="hero">
        <div className="hero-image">
          <img src="/images/preview (2).png" alt="New season editorial" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div className="hero-badge">
            <div className="serif" style={{ fontSize: 20, marginBottom: 6 }}>The Autumn Journal</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Tailoring, reconsidered — six pieces for the season ahead.</div>
          </div>
        </div>
        <div className="hero-content">
          <div className="hero-eyebrow">New season</div>
          <h1 className="hero-title">A wardrobe with something to say</h1>
          <p className="hero-copy">Curated menswear, womenswear, footwear and leather goods — fewer pieces, chosen with intent.</p>
          <button className="btn-primary" style={{ width: 'fit-content' }}>Shop the edit</button>
        </div>
      </div>
      <PopularCategory />
    </main>
  )
}

export default Items
