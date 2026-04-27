import * as THREE from 'three'
import gsap from 'gsap'

export function createScrollLighting(
  ambientLight: THREE.AmbientLight,
  keyLight: THREE.DirectionalLight,
) {
  let rafId: number | null = null

  const applyProgress = (p: number, nav: HTMLElement | null, heroText: HTMLElement | null) => {
    const clamped = Math.max(0, Math.min(1, p))

    // Ambient light: 0.05 -> 0.4
    ambientLight.intensity = 0.05 + clamped * 0.35

    // Key light: warm amber -> soft white
    keyLight.color.setRGB(
      1.0,
      0.78 + clamped * 0.19,
      0.47 + clamped * 0.46
    )

    // Key light intensity: 2.5 -> 1.2
    keyLight.intensity = 2.5 - clamped * 1.3

    // Moon + rays fade out as scroll progresses
    const moonEl = document.getElementById('moon-overlay')
    if (moonEl) moonEl.style.opacity = String(1 - clamped)

    // Nav fade-in around 15%-20%
    if (nav) {
      const navP = Math.max(0, Math.min(1, (clamped - 0.15) / 0.05))
      nav.style.opacity = String(navP)
    }

    // Hero fade-out around 5%-20%
    if (heroText) {
      const heroP = Math.max(0, Math.min(1, (clamped - 0.05) / 0.15))
      heroText.style.opacity = String(1 - heroP)
    }
  }

  const setupNativeScrollFallback = (nav: HTMLElement | null, heroText: HTMLElement | null) => {
    const onScroll = () => {
      if (rafId !== null) return
      rafId = window.requestAnimationFrame(() => {
        const wrapper = document.getElementById('scroll-wrapper')
        if (wrapper) {
          const maxScroll = Math.max(wrapper.offsetHeight - window.innerHeight, 1)
          const progress = window.scrollY / maxScroll
          applyProgress(progress, nav, heroText)
        }
        rafId = null
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
        rafId = null
      }
    }
  }

  // Install GSAP ScrollTrigger
  const setupScroll = async () => {
    const { ScrollTrigger } = await import('gsap/ScrollTrigger')
    gsap.registerPlugin(ScrollTrigger)

    const nav = document.getElementById('main-nav')
    const heroText = document.getElementById('hero-text')

    // Show hero text after scene loads
    gsap.to(heroText, {
      opacity: 1,
      duration: 1.5,
      delay: 8.0,
      ease: 'power2.out'
    })

    // Scroll: lighting transitions from cinematic → product
    ScrollTrigger.create({
      trigger: '#scroll-wrapper',
      start: 'top top',
      end: '40% top',
      scrub: 1.5,         // smooth scrubbing
      onUpdate: (self) => {
        applyProgress(self.progress, nav, heroText)
      }
    })

    // Nav fades in at 20% scroll
    ScrollTrigger.create({
      trigger: '#scroll-wrapper',
      start: '15% top',
      end: '20% top',
      scrub: 1,
      onUpdate: (self) => {
        if (nav) nav.style.opacity = String(self.progress)
      }
    })

    // Hero text fades out as user scrolls
    ScrollTrigger.create({
      trigger: '#scroll-wrapper',
      start: '5% top',
      end: '20% top',
      scrub: 1,
      onUpdate: (self) => {
        if (heroText) heroText.style.opacity = String(1 - self.progress)
      }
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }

  const nativeCleanup = setupNativeScrollFallback(
    document.getElementById('main-nav'),
    document.getElementById('hero-text')
  )

  let triggerCleanup: null | (() => void) = null
  setupScroll()
    .then((cleanup) => {
      triggerCleanup = cleanup
    })
    .catch(() => {
      // Native scroll fallback stays active if ScrollTrigger fails to initialize.
    })

  return () => {
    nativeCleanup()
    if (triggerCleanup) {
      triggerCleanup()
    }
  }
}