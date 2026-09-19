import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { FiArrowRight, FiChevronLeft, FiChevronRight, FiPause, FiPlay } from 'react-icons/fi'
import { useCategories } from '../hooks/useCategories'
import { useUIContext } from '../context/UIContext'

interface Slide {
  slug: string
  eyebrow: string
  title: string
  copy: string
  cta: string
  image: string
  position: string
}

const SLIDES: Slide[] = [
  {
    slug: 'women',
    eyebrow: 'Women',
    title: 'Soft structure, sharp lines',
    copy: 'Tweeds, wool jackets and considered tailoring — built to layer through the season.',
    cta: 'Shop women',
    image: '/images/editorial/hero-women.jpg',
    position: '50% 35%',
  },
  {
    slug: 'men',
    eyebrow: 'Men',
    title: 'Suits that hold their shape',
    copy: 'Three-pieces, tuxedos and blazers, cut close and finished properly.',
    cta: 'Shop men',
    image: '/images/editorial/hero-men.jpg',
    position: '50% 50%',
  },
  {
    slug: 'shoes',
    eyebrow: 'Shoes',
    title: 'Step out in colour',
    copy: 'From polished oxfords to canvas and running silhouettes.',
    cta: 'Shop shoes',
    image: '/images/editorial/hero-shoes.jpg',
    position: '50% 45%',
  },
  {
    slug: 'accessories',
    eyebrow: 'Accessories',
    title: 'The finishing touches',
    copy: 'Bags and watches that complete the look.',
    cta: 'Shop accessories',
    image: '/images/editorial/hero-accessories.jpg',
    position: '50% 55%',
  },
]

const AUTOPLAY_MS = 6500

const copyVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
}
const lineVariants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 0.8, 0.24, 1] } },
}

const Hero = () => {
  const reduceMotion = useReducedMotion()
  const { data: categories } = useCategories()
  const { setCategoryFilter } = useUIContext()
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(!reduceMotion)

  const slide = SLIDES[index]!

  const go = useCallback((next: number) => setIndex((next + SLIDES.length) % SLIDES.length), [])

  useEffect(() => {
    if (!playing) return
    const timer = window.setTimeout(() => go(index + 1), AUTOPLAY_MS)
    return () => window.clearTimeout(timer)
  }, [playing, index, go])

  // warm the browser cache so slide changes never flash an empty frame
  useEffect(() => {
    SLIDES.forEach((s) => {
      const img = new Image()
      img.src = s.image
    })
  }, [])

  const shopCategory = () => {
    const category = categories?.find((c) => c.slug === slide.slug)
    setCategoryFilter(category?.id ?? null)
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const manual = (next: number) => {
    setPlaying(false)
    go(next)
  }

  return (
    <section className="hero" aria-roledescription="carousel" aria-label="Featured collections">
      <div className="hero-media">
        <AnimatePresence initial={false}>
          <motion.img
            key={slide.image}
            src={slide.image}
            alt=""
            style={{ objectPosition: slide.position }}
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 0.9 }, scale: { duration: 7.5, ease: 'easeOut' } }}
          />
        </AnimatePresence>
      </div>

      <div className="hero-text">
        <AnimatePresence exitBeforeEnter initial={false}>
          <motion.div
            key={slide.slug}
            className="hero-slide-copy"
            variants={copyVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            aria-live={playing ? 'off' : 'polite'}
          >
            <motion.div className="hero-eyebrow" variants={lineVariants}>{slide.eyebrow}</motion.div>
            <motion.h1 className="hero-title" variants={lineVariants}>{slide.title}</motion.h1>
            <motion.p className="hero-copy" variants={lineVariants}>{slide.copy}</motion.p>
            <motion.div variants={lineVariants}>
              <button className="btn-primary hero-cta" onClick={shopCategory}>
                {slide.cta} <FiArrowRight size={15} />
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <div className="hero-controls">
          <div className="hero-dots" role="tablist" aria-label="Choose slide">
            {SLIDES.map((s, i) => (
              <button
                key={s.slug}
                role="tab"
                aria-selected={i === index}
                aria-label={`Show ${s.eyebrow} slide`}
                className={`hero-dot ${i === index ? 'is-active' : ''}`}
                onClick={() => manual(i)}
              >
                {i === index && playing ? (
                  <motion.span
                    key={`${index}-playing`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: AUTOPLAY_MS / 1000, ease: 'linear' }}
                  />
                ) : (
                  <span />
                )}
              </button>
            ))}
          </div>
          <div className="hero-arrows">
            <button className="hero-arrow" onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}>
              {playing ? <FiPause size={15} /> : <FiPlay size={15} />}
            </button>
            <button className="hero-arrow" onClick={() => manual(index - 1)} aria-label="Previous slide"><FiChevronLeft size={17} /></button>
            <button className="hero-arrow" onClick={() => manual(index + 1)} aria-label="Next slide"><FiChevronRight size={17} /></button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
