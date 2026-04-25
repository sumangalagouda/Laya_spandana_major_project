import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./BharatanatyamPage.css";

const timelineEvents = [
  {
    year: "200 BCE",
    title: "Natya Shastra",
    color: "#D4AF37",
    description:
      "Sage Bharata Muni composes the Natya Shastra — the foundational treatise on Indian performing arts. It codifies 108 karanas, dramatic forms, and the theory of rasa and bhava that underpins all classical dance.",
  },
  {
    year: "6th Century CE",
    title: "Temple Devadasi Tradition",
    color: "#FF6B00",
    description:
      "Bharatanatyam flourishes in South Indian temples as Sadir Attam. Devadasis perform daily for the deity while dynasties such as the Cholas and Pallavas patronize the art.",
  },
  {
    year: "Chola Period",
    title: "Bronze Nataraja Icons",
    color: "#C0392B",
    description:
      "The Chola dynasty creates iconic bronze Nataraja sculptures that become the visual grammar of Bharatanatyam and a timeless model for dancers.",
  },
  {
    year: "1892",
    title: "British Colonial Ban",
    color: "#5D4037",
    description:
      "The Anti-Nautch Act suppresses Devadasi performances. With declining temple patronage and social stigma, the form faces near extinction.",
  },
  {
    year: "1930s",
    title: "The Great Revival",
    color: "#D4AF37",
    description:
      "E. Krishna Iyer and Rukmini Devi Arundale revive and reform the art, renaming it Bharatanatyam and introducing it to modern proscenium stages.",
  },
  {
    year: "1936",
    title: "Kalakshetra Founded",
    color: "#FF6B00",
    description:
      "Rukmini Devi establishes Kalakshetra in Chennai, creating a major institutional ecosystem for training, repertory, and pedagogy.",
  },
  {
    year: "Post-Independence",
    title: "National Recognition",
    icon: "🇮🇳",
    color: "#27AE60",
    description:
      "Bharatanatyam becomes a national cultural emblem. Exponents carry the form to global stages with renewed scholarship and virtuosity.",
  },
  {
    year: "2016",
    title: "UNESCO Recognition",
    color: "#D4AF37",
    description:
      "UNESCO recognizes Indian classical dance traditions, including Bharatanatyam, as Intangible Cultural Heritage of Humanity.",
  },
];

const abhinayaCards = [
  {
    key: "angika",
    color: "#D4AF37",
    title: "Angika Abhinaya",
    sanskrit: "आंगिक अभिनय",
    subtitle: "Expression through body movement",
    description:
      "The body becomes language through karanas, hastas, drishti bhedas and greeva bhedas. Angika builds semantic precision in every gesture.",
    detailed:
      "Angika trains the dancer to communicate through posture, limbs, glances, and coordinated movement vocabulary. It transforms physical technique into visual meaning.",
    tags: ["108 Karanas", "64 Hastas", "Eye movements", "Footwork"],
    image: "/images/abhinaya-angika.png",
  },
  {
    key: "vachika",
    color: "#FF6B00",
    title: "Vachika Abhinaya",
    sanskrit: "वाचिक अभिनय",
    subtitle: "Expression through voice and sound",
    description:
      "The sung sahitya, nattuvangam recitation, and rhythmic syllables form the sonic grammar that the dancer embodies with clarity and timing.",
    detailed:
      "Vachika connects the dancer with music, text, and recitation. The expressive body responds to lyrical meaning, melodic shape, and rhythmic articulation.",
    tags: ["Sahitya", "Solkattu", "Raga melody", "Rhythm syllables"],
    image: "/images/abhinaya-vachika.png",
  },
  {
    key: "aharya",
    color: "#8E44AD",
    title: "Aharya Abhinaya",
    sanskrit: "आहार्य अभिनय",
    subtitle: "Expression through costume and makeup",
    description:
      "Costume, jewelry, and stage makeup elevate readability and character. Aharya amplifies narrative visibility while preserving tradition.",
    detailed:
      "Aharya shapes the outer visual world of performance through costume grammar, ornaments, and makeup. It supports character clarity and stage presence.",
    tags: ["Silk saree", "Temple jewelry", "Stage makeup", "Flower garlands"],
    image: "/images/abhinaya-aharya.png",
  },
  {
    key: "sattvika",
    color: "#1A6B8A",
    title: "Sattvika Abhinaya",
    sanskrit: "सात्विक अभिनय",
    subtitle: "Expression through inner emotion",
    description:
      "The most subtle path where inner states surface naturally — trembling, tears, and stillness. It arises from lived emotional truth.",
    detailed:
      "Sattvika is the subtlest dimension of abhinaya where deeply internalized emotion appears naturally. It is cultivated through sensitivity, concentration, and lived experience.",
    tags: ["Tears of joy", "Goosebumps", "Natural trembling", "Inner experience"],
    image: "/images/abhinaya-sattvika.png",
  },
];

const margamItems = [
  { n: 1, name: "Alaripu", icon: "🌸", color: "#D4AF37", dur: "5-10 min", type: "Pure Dance (Nritta)", desc: "Body awakening in structured rhythm." },
  { n: 2, name: "Jatiswaram", icon: "🎵", color: "#FF6B00", dur: "8-12 min", type: "Pure Dance (Nritta)", desc: "Rhythmic melody and expanding footwork." },
  { n: 3, name: "Shabdam", icon: "📝", color: "#C0392B", dur: "8-15 min", type: "Expressive (Nritya)", desc: "First narrative entry with sahitya." },
  { n: 4, name: "Varnam", icon: "💎", color: "#1A6B8A", dur: "30-45 min", type: "Combined (Nritta + Nritya)", desc: "The centerpiece of complete mastery.", main: true },
  { n: 5, name: "Padam", icon: "🎭", color: "#8E44AD", dur: "10-20 min", type: "Pure Expression (Nritya)", desc: "Emotional poetry and abhinaya depth." },
  { n: 6, name: "Javali", icon: "🎪", color: "#D4AF37", dur: "5-10 min", type: "Expression (Nritya)", desc: "Lighter playful expressive item." },
  { n: 7, name: "Thillana", icon: "🎆", color: "#FF6B00", dur: "8-12 min", type: "Pure Dance (Nritta)", desc: "Brilliant rhythmic climax." },
  { n: 8, name: "Mangalam", icon: "🙏", color: "#27AE60", dur: "2-3 min", type: "Devotional", desc: "Auspicious closing prayer." },
];

const margamInfo = {
  Alaripu: {
    subtitle: "Nrityabandha in Invocation Form",
    meaning:
      "Alaripu is understood as the blossoming of limbs and awareness. It is traditionally the opening item, offered first to the divine, then to the guru, and then to the audience.",
    details: [
      "It belongs to the pure dance stream (Nritta), focused on rhythm and movement rather than narrative storytelling.",
      "The body is opened gradually in sequence: eyes, neck, shoulders, arms, torso, hips, knees, and feet.",
      "The format is often taught in three segments, each increasing the physical and rhythmic engagement.",
      "It prepares both performer and audience for the full recital by aligning breath, posture, and tala discipline.",
    ],
    sequence: [
      "Opening salute with Anjali hasta and respectful bow to deity, guru, and audience.",
      "Progressive rhythmic movement phrases that expand from subtle to full-body coordination.",
      "Concluding korvai and Mukthaya to complete the invocation cycle.",
    ],
    referenceNotes: ["Tishram", "Chatushram", "Khandam", "Mishram", "Sankeernam"],
  },
  Jatiswaram: {
    subtitle: "Rhythm-Melody Expansion",
    meaning:
      "Jatiswaram is the second item of the Margam where laya (rhythm) and swara (melodic structure) take priority in a pure dance framework.",
    details: [
      "It strengthens adavu precision through extended movement patterns and clean geometry.",
      "The item is largely non-narrative and showcases coordination between rhythm, melody, and footwork.",
      "It is often presented through Pallavi, Anupallavi and Charanam structures with evolving jathi patterns.",
      "The dancer demonstrates control, stamina, and clarity while the nattuvanar guides complex rhythmic passages.",
    ],
    sequence: [
      "Establish opening jathi-swara motifs with steady tala anchoring.",
      "Expand into layered adavu combinations and directional movement patterns.",
      "Close with energetic concluding korvais aligned to melodic cadence.",
    ],
    referenceNotes: ["Pallavi", "Anupallavi", "Charanam", "Raga-based swara patterns"],
  },
  Shabdam: {
    subtitle: "First Expressive Entry",
    meaning:
      "Shabdam is the first Margam item where sahitya and abhinaya become central, moving beyond pure rhythmic architecture.",
    details: [
      "It introduces lyrical storytelling while still retaining rhythmic support.",
      "Common themes include devotion, reverence, and episodes from mythology.",
      "Compared to Alaripu and Jatiswaram, Shabdam gives greater room for expressive interpretation.",
      "The pace is usually moderate, allowing emotional content to be communicated clearly.",
    ],
    sequence: [
      "Present lyrical line and its emotional context.",
      "Alternate expressive passages with measured rhythmic links.",
      "Complete with devotional or narrative closure to prepare for deeper abhinaya works.",
    ],
    referenceNotes: ["Sahitya", "Abhinaya", "Mythological episodes", "Devotional praise"],
  },
  Varnam: {
    subtitle: "The Central Masterpiece",
    meaning:
      "Varnam is the longest and most demanding centerpiece of a Bharatanatyam recital, combining Nritta and Nritya at full depth.",
    details: [
      "It tests endurance, command over tala, and emotional maturity in a single composition.",
      "Thematic core is often Nayaka-Nayaki bhava, devotion, or intense longing.",
      "Varnam usually includes multiple speed and intensity layers, making it technically and artistically decisive.",
      "Traditionally, Varnam sections include Pallavi, Anupallavi, Mukthayi Swaram, Charanam, and Chittai Swaram/Sahityam.",
    ],
    sequence: [
      "Build central emotional proposition through Pallavi and Anupallavi.",
      "Move through alternating nritta passages and expressive sancharis.",
      "Resolve through Charanam and final swara-sahitya architecture.",
    ],
    referenceNotes: ["Taana Varnam", "Chouka Varnam", "Swarajathi Varnam", "Pada Varnam"],
  },
  Padam: {
    subtitle: "Abhinaya in Slow Depth",
    meaning:
      "Padam is a slow-paced expressive form presented after strenuous nritta segments, allowing deep emotional interpretation.",
    details: [
      "It is centered on nuanced abhinaya, subtle facial work, and inward emotional states.",
      "Padams often explore devotional and Nayika-centric themes with poetic lyricism.",
      "Though movement is minimal compared to earlier items, interpretive sophistication is very high.",
      "Musical and literary sensitivity is essential for authentic Padam rendition.",
    ],
    sequence: [
      "Set emotional landscape through sahitya and raga mood.",
      "Develop layered inner states through abhinaya micro-transitions.",
      "Conclude with stillness-driven resolution rather than physical climax.",
    ],
    referenceNotes: ["Slow tempo", "Bhakti and Nayika bhava", "Abhinaya-centric", "Often in Misra Chapu"],
  },
  Javali: {
    subtitle: "Light, Romantic Expressive Piece",
    meaning:
      "Javali is a lighter expressive composition, typically romantic in flavor and more direct in emotional language than Padam.",
    details: [
      "It carries lively charm and colloquial immediacy with shorter expressive arcs.",
      "Themes frequently include love, playful complaint, and personal emotional dialogue.",
      "Compared with Padam, Javali usually feels brisker and less contemplative.",
      "It offers space for charisma, timing, and expressive agility.",
    ],
    sequence: [
      "Introduce romantic or playful emotional premise.",
      "Develop interaction-style abhinaya with dynamic shifts.",
      "Finish with a concise expressive closure before the recital moves forward.",
    ],
    referenceNotes: ["Lighter than Padam", "Love-oriented sahitya", "Rakthi/Deshiya ragas", "Expressive agility"],
  },
  Thillana: {
    subtitle: "Brisk Rhythmic Finale",
    meaning:
      "Thillana is the vibrant near-concluding nritta item known for speed, footwork brilliance, and rhythmic sparkle.",
    details: [
      "It emphasizes jathi-rich movement, energetic patterns, and stage dynamism.",
      "Compositional format often includes pallavi, anupallavi, and charanam with sollukattu syllables.",
      "Some Thillanas include brief sahitya passages, often devotional or honoring patrons.",
      "It serves as a celebratory release before final benediction.",
    ],
    sequence: [
      "Launch with lively rhythmic motif and crisp footwork.",
      "Expand through patterned speed variations and spatial choreography.",
      "Conclude with emphatic finale cadence setting up Mangalam.",
    ],
    referenceNotes: ["High tempo", "Sollukattu-rich", "Footwork virtuosity", "Brilliant finale energy"],
  },
  Mangalam: {
    subtitle: "Auspicious Benediction",
    meaning:
      "Mangalam is the closing benediction of the recital, offering gratitude and auspicious completion.",
    details: [
      "It marks respectful closure to deity, guru, musicians, and audience.",
      "Movement language is simpler and devotional in tone.",
      "The emotional color shifts to peace, humility, and completion.",
      "Mangalam seals the Margam as a spiritual and artistic journey.",
    ],
    sequence: [
      "Invoke final devotional salutation.",
      "Offer gratitude through composed concluding gestures.",
      "Close with stillness and auspicious sign-off.",
    ],
    referenceNotes: ["Benedictory close", "Devotional mood", "Respectful gratitude", "Auspicious ending"],
  },
};

const costumeItems = [
  {
    key: "kondai",

    name: "Kondai",
    tamil: "கொண்டை",
    short: "Hair arrangement and floral crown",
    description:
      "Kondai is the traditional hair bun styling for Bharatanatyam, usually decorated with flowers and ornaments to frame the head and silhouette.",
    highlights: [
      "Maintains a clean classical profile on stage",
      "Supports placement of head ornaments",
      "Enhances visibility of neck and face lines",
    ],
    image: "/images/costume-kondai.png",
  },
  {
    key: "jimikki",

    name: "Jimikki",
    tamil: "ஜிமிக்கி",
    short: "Traditional temple earrings",
    description:
      "Jimikki are bell-shaped earrings that brighten facial movement and catch stage light during head and neck transitions.",
    highlights: [
      "Accents head turns and drishti changes",
      "Pairs with classical temple-jewelry sets",
      "Adds rhythmic visual sparkle",
    ],
    image: "/images/costume-jimikki.png",
  },
  {
    key: "oddiyanam",

    name: "Oddiyanam",
    tamil: "ஒட்டியாணம்",
    short: "Waist belt of the costume",
    description:
      "Oddiyanam is the ornamental waist belt that secures the costume drape and visually defines torso alignment.",
    highlights: [
      "Keeps pleats and saree drape stable",
      "Emphasizes posture and aramandi geometry",
      "Creates clean central body line",
    ],
    image: "/images/costume-oddiyanam.png",
  },
  {
    key: "head-piece",
    name: "Head Piece",
    tamil: "தலை அலங்காரம்",
    short: "Forehead and hairline ornament set",
    description:
      "The head piece (such as netti chutti and side ornaments) frames the forehead and strengthens facial expression visibility under stage lighting.",
    highlights: [
      "Replaces simple forehead marking focus",
      "Frames abhinaya expressions clearly",
      "Balances the full costume aesthetic",
    ],
    image: "/images/costume-head-piece.png",
  },
  {
    key: "salangai",
    name: "Salangai",
    tamil: "சலங்கை",
    short: "Ankle bells for rhythmic articulation",
    description:
      "Salangai are sacred ankle bells that make footwork audible and synchronize dancer movement with tala.",
    highlights: [
      "Translates footwork into clear sound",
      "Strengthens tala discipline",
      "Essential for nritta precision",
    ],
    image: "/images/costume-salangai.png",
  },
  {
    key: "costume",
    name: "Costume",
    tamil: "உடை",
    short: "Pleated Bharatanatyam attire",
    description:
      "The Bharatanatyam costume is designed for geometry and movement; fan pleats open during araimandi and jumps to make adavu lines readable.",
    highlights: [
      "Supports dynamic movement without loss of form",
      "Highlights lower-body rhythm patterns",
      "Connects visual tradition with stage practicality",
    ],
    image: "/images/costume-attire.png",
  },
];

const exponents = [
  {
    name: "Rukmini Devi Arundale",
    years: "1904–1986",
    role: "Revivalist & Reformer",
    color: "#D4AF37",
    contribution:
      "Founded Kalakshetra (1936), restructured pedagogy and stagecraft, and gave Bharatanatyam a modern institutional framework.",
    quote: "Dance is a divine art. Every movement is a prayer.",
  },
  {
    name: "Balasaraswati",
    years: "1918–1984",
    role: "Devadasi Tradition Bearer",
    color: "#C0392B",
    contribution:
      "Preserved the authentic Devadasi lineage with unmatched abhinaya and carried its depth to international stages.",
    quote: "Bharatanatyam is a manifestation of the universe in the human body.",
  },
  {
    name: "Yamini Krishnamurthy",
    years: "1940–present",
    role: "International Ambassador",
    color: "#FF6B00",
    contribution:
      "Renowned for technical brilliance and stage presence, helping globalize Bharatanatyam through major tours and performances.",
    quote: "The body is the instrument, the soul is the musician.",
  },
  {
    name: "Mrinalini Sarabhai",
    years: "1918–2016",
    role: "Institution Builder",
    color: "#8E44AD",
    contribution:
      "Founded Darpana Academy and expanded Bharatanatyam discourse through pedagogy, choreography, and cultural diplomacy.",
    quote: "Art is the language of the soul speaking to other souls.",
  },
  {
    name: "Padma Subrahmanyam",
    years: "1943–present",
    role: "Scholar-Practitioner",
    color: "#1A6B8A",
    contribution:
      "Reconstructed the 108 karanas through textual and sculptural study, reconnecting contemporary practice to ancient grammar.",
    quote: "The karanas are the grammar of Bharatanatyam.",
  },
  {
    name: "Alarmel Valli",
    years: "1956–present",
    role: "Contemporary Master",
    color: "#27AE60",
    contribution:
      "Expanded thematic language while preserving classical rigor, known for nuanced abhinaya and musicality.",
    quote: "In Bharatanatyam, silence speaks as loudly as sound.",
  },
];

const rasas = [
  [ "Shringara", "श्रृंगार", "சிங்காரம்", "Love/Beauty", "#C0392B", "Graceful romantic and devotional expression."],
  [ "Hasya", "हास्य", "ஹாஸ்யம்", "Joy/Humor", "#F39C12", "Playful brightness and comic charm."],
  ["Karuna", "करुण", "கருணை", "Compassion/Sorrow", "#2980B9", "Slow gestures and tender emotional weight."],
  ["Raudra", "रौद्र", "ரௌத்ரம்", "Fury/Anger", "#E74C3C", "Forceful stance and fierce energy."],
  ["Vira", "वीर", "வீரம்", "Heroism/Courage", "#D4AF37", "Upright power and resolute rhythm."],
  ["Bhayanaka", "भयानक", "பயானகம்", "Terror/Fear", "#5D4037", "Tension, recoil, and trembling anticipation."],
  ["Bibhatsa", "बीभत्स", "பீபத்ஸம்", "Disgust", "#616161", "Repulsion shown through withdrawal."],
  ["Adbhuta", "अद्भुत", "அத்புதம்", "Wonder", "#8E44AD", "Astonishment before divine marvel."],
  ["Shanta", "शांत", "சாந்தம்", "Serenity", "#1A6B8A", "Stillness and meditative resolution."],
];

const instruments = [
  ["Mridangam", "मृदंगम्", "#D4AF37", "The rhythmic backbone responding to footwork in real time."],
  ["Veena", "वीणा", "#FF6B00", "Deep resonant melodic frame for raga expression."],
  [ "Flute (Venu)", "वेणु", "#27AE60", "Breath-driven timbre ideal for lyrical passages."],
  ["Nattuvangam", "नट्टुवांगम्", "#C0392B", "Conducting syllables and cymbal timekeeping by the guru."],
  ["Violin", "बेला", "#8E44AD", "Expressive melodic companion to vocalist and dancer."],
  ["Vocalist", "गायक", "#1A6B8A", "Delivers sahitya that the dancer embodies word-by-word."],
];

function initials(name) {
  return name
    .split(" ")
    .map((x) => x[0])
    .slice(0, 2)
    .join("");
}

function BharatanatyamPage() {
  const [activeMargam, setActiveMargam] = useState("Alaripu");
  const [activeCostume, setActiveCostume] = useState(null);
  const [activeAbhinaya, setActiveAbhinaya] = useState(null);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll(".reveal-section"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const activeMargamInfo = margamInfo[activeMargam] || null;
  const activeMargamItem = margamItems.find((item) => item.name === activeMargam);
  const activeCostumeItem = costumeItems.find((item) => item.key === activeCostume) || null;
  const activeAbhinayaItem = abhinayaCards.find((item) => item.key === activeAbhinaya) || null;

  return (
    <div className="bharatanatyam-page">
      <section className="hero-section">
        <div className="hero-diagonals" />
        <div className="mandala-rings">
          {[200, 400, 600, 800, 1000].map((size, idx) => (
            <span
              key={size}
              className="ring"
              style={{
                width: size,
                height: size,
                animationDuration: `${[60, 45, 30, 20, 15][idx]}s`,
                animationDirection: idx % 2 === 0 ? "normal" : "reverse",
              }}
            />
          ))}
        </div>

        <div className="hero-content">
          <div className="hero-ornament">✦ ── ✦ ── 🪷 ── ✦ ── ✦</div>
          <p className="hero-invocation">नटराजाय नमः</p>
          <h1 className="text-gradient">Bharatanatyam</h1>
          <p className="hero-tamil">பரதநாட்டியம்</p>
          <p className="hero-tagline">The Divine Language of Body, Music and Devotion</p>
          <div className="hero-pills">
            <span>2000+ Years Old</span>
            <span>Tamil Nadu Origin</span>
            <span>UNESCO Recognized</span>
          </div>
        </div>

        <div className="scroll-indicator">
          <small>Explore</small>
          <div className="bounce-arrow">↓</div>
        </div>

        <svg className="hero-divider-curve" viewBox="0 0 100 60" preserveAspectRatio="none">
          <path d="M0,0 Q50,60 100,0" />
        </svg>
      </section>

      <section className="content-section reveal-section intro-layout">
        <div>
          <p className="section-label">● THE DIVINE ART</p>
          <h2>What is Bharatanatyam?</h2>
          <p>
            Bharatanatyam is one of the oldest and most revered classical dance forms of India,
            originating in the sacred temples of Tamil Nadu over two thousand years ago. It is a
            synthesis of Bha (Bhava), Ra (Raga), and Ta (Tala).
          </p>
          <p>
            Rooted in the ancient <em>Natya Shastra</em>, it was performed by <em>Devadasis</em>
            as an offering to the divine. Its grammar evolved in temples before reaching modern
            concert stages.
          </p>
          <p>
            In the twentieth century, <em>Rukmini Devi Arundale</em> and E. Krishna Iyer revived
            and restructured the form through institutions like <em>Kalakshetra</em>.
          </p>
          <p>
            Today Bharatanatyam is global and living. It remains both rigorous technique and
            devotional pathway, recognized as <em>Intangible Cultural Heritage</em>.
          </p>

          <blockquote>
            <p>
              Bharatanatyam is not mere dance — it is a moving prayer, a poem in motion, the
              body&apos;s conversation with the divine.
            </p>
            <small>— Rukmini Devi Arundale</small>
          </blockquote>
        </div>

        <div className="nataraja-container">

          <img className="nataraja-svg" src="/images/nataraja.png" alt="Nataraja - The Lord of Dance" width={500} />
          <p className="nataraja-label">नटराज — Nataraja</p>

        </div>
      </section>

      <section className="content-section reveal-section">
        <h2>A Journey Through Time</h2>
        <p className="sanskrit-sub">इतिहास</p>
        <div className="timeline">
          {timelineEvents.map((event, idx) => (
            <article key={event.title} className={`timeline-item ${idx % 2 === 0 ? "left" : "right"}`}>
              <span className="timeline-dot" style={{ background: event.color, boxShadow: `0 0 14px ${event.color}` }} />
              <div className="timeline-card" style={{ "--evt-color": event.color }}>
                <div className="timeline-top">
                  <span className="year-pill">{event.year}</span>
                  <span className="event-icon">{event.icon}</span>
                </div>
                <h3>{event.title}</h3>
                <p>{event.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section reveal-section bha-layout">
        <div className="dancer-container">

          <img className="dancer-svg" src="/images/bh1.jpeg" alt="Bharatanatyam dancer" />

        </div>

        <div>
          <h2>The Three Pillars: BHA · RA · TA</h2>
          <p className="sanskrit-sub">भाव · राग · ताल</p>
          <div className="pillar-card" style={{ "--pillar": "#D4AF37" }}>
            <h3>BHA <small>Bhava · भाव</small></h3>
            <span className="meaning-pill">Expression & Emotion</span>
            <p>Bhava is emotional transmission through eyes, face, torso and gesture, turning movement into felt meaning.</p>
            <div className="sub-items">Navarasas · Abhinaya · Sanchari Bhava</div>
          </div>
          <div className="pillar-card" style={{ "--pillar": "#FF6B00" }}>
            <h3>RA <small>Raga · राग</small></h3>
            <span className="meaning-pill">Melody & Music</span>
            <p>Raga shapes mood through melodic architecture. The dancer listens deeply to tonal color and phrase contour.</p>
            <div className="sub-items">Carnatic music · Veena · Nattuvangam</div>
          </div>
          <div className="pillar-card" style={{ "--pillar": "#C0392B" }}>
            <h3>TA <small>Tala · ताल</small></h3>
            <span className="meaning-pill">Rhythm & Timing</span>
            <p>Tala governs time cycles and precision. Bharatanatyam anchors expression within exact rhythmic mathematics.</p>
            <div className="sub-items">Adi/Rupaka · Nadais · Mridangam</div>
          </div>
        </div>
      </section>

      <section className="content-section reveal-section">
        <h2>Abhinaya — The Four Paths of Expression</h2>
        <p className="sanskrit-sub">अभिनय के चार मार्ग</p>
        <div className="abhinaya-grid">
          {abhinayaCards.map((item) => (
            <button
              key={item.title}
              type="button"
              className="abhinaya-card"
              style={{ "--abhi": item.color }}
              onClick={() => setActiveAbhinaya(item.key)}
            >
              <div className="abhinaya-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p className="sanskrit-inline">{item.sanskrit}</p>
              <p className="abhi-sub">{item.subtitle}</p>
              <p>{item.description}</p>
              <div className="tag-row">
                {item.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </section>

      {activeAbhinayaItem && (
        <div className="abhinaya-modal-overlay" onClick={() => setActiveAbhinaya(null)}>
          <div className="abhinaya-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="abhinaya-modal-close"
              onClick={() => setActiveAbhinaya(null)}
              aria-label="Close abhinaya details"
            >
              ×
            </button>

            <div className="abhinaya-modal-image-wrap">
              <img
                className="abhinaya-modal-image"
                src={activeAbhinayaItem.image}
                alt={`${activeAbhinayaItem.title} visual`}
                onError={(e) => {
                  e.currentTarget.src = "/images/image.png";
                }}
              />
            </div>

            <div className="abhinaya-modal-copy">
              <h3>
                {activeAbhinayaItem.icon} {activeAbhinayaItem.title}
              </h3>
              <p className="sanskrit-inline">{activeAbhinayaItem.sanskrit}</p>
              <p>{activeAbhinayaItem.detailed}</p>
              <div className="tag-row">
                {activeAbhinayaItem.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="content-section reveal-section">
        <h2>The Margam — A Complete Recital</h2>
        <p className="sanskrit-sub">मार्गम् — The Path</p>
        <p className="section-lead">A traditional recital rises in complexity, tempo and emotional intensity from invocation to auspicious close.</p>
        <div className="margam-flow">
          {margamItems.map((item, idx) => (
            <button
              key={item.name}
              type="button"
              className={`margam-item ${activeMargam === item.name ? "active" : ""}`}
              style={{ "--margam": item.color }}
              onClick={() => setActiveMargam(item.name)}
            >
              <span className="big-num">{item.n}</span>
              <div className="margam-top">
                <span>{item.icon}</span>
                <b>{item.name}</b>
                <small>{item.dur}</small>
              </div>
              <p>{item.desc}</p>
              <em>{item.type}</em>
              {item.main && <strong>★ Main Piece</strong>}
              {idx < margamItems.length - 1 && <span className="flow-arrow">→</span>}
            </button>
          ))}
        </div>

        {activeMargamInfo ? (
          <article className="margam-detail-card" style={{ "--margam-detail": activeMargamItem?.color || "#D4AF37" }}>
            <div className="margam-detail-head">
              <h3>{activeMargam}</h3>
              <span>{activeMargamInfo.subtitle}</span>
            </div>

            <p className="margam-detail-meaning">{activeMargamInfo.meaning}</p>

            <h4>Core Understanding</h4>
            <ul>
              {activeMargamInfo.details.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>

            <h4>Typical Sequence</h4>
            <ol>
              {activeMargamInfo.sequence.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>

            <h4>Reference Notes</h4>
            <div className="nadai-pills">
              {activeMargamInfo.referenceNotes.map((note) => (
                <span key={note}>{note}</span>
              ))}
            </div>
          </article>
        ) : (
          <article className="margam-detail-card muted">
            <h3>{activeMargam}</h3>
            <p>Detailed notes for this item will be added soon.</p>
          </article>
        )}
      </section>

      <section className="content-section reveal-section costume-layout">
        <div>
          <h2>The Costume — आभूषण और वस्त्र</h2>
          <div className="ornament-grid">
            {costumeItems.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`ornament-card ${activeCostume === item.key ? "active" : ""}`}
                onClick={() => setActiveCostume(item.key)}
              >
                <span>{item.icon}</span>
                <h3>{item.name}</h3>
                <p className="sanskrit-inline">{item.tamil}</p>
                <p>{item.short}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="costume-diagram">
          <img className="costume-image" src="/images/image.png" alt="Bharatanatyam costume diagram" />
        </div>
      </section>

      {activeCostumeItem && (
        <div className="costume-modal-overlay" onClick={() => setActiveCostume(null)}>
          <div className="costume-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="costume-modal-close"
              onClick={() => setActiveCostume(null)}
              aria-label="Close costume details"
            >
              ×
            </button>

            <div className="costume-modal-image-wrap">
              <img
                className="costume-modal-image"
                src={activeCostumeItem.image}
                alt={`${activeCostumeItem.name} in Bharatanatyam costume`}
                onError={(e) => {
                  e.currentTarget.src = "/images/image.png";
                }}
              />
            </div>

            <div className="costume-modal-copy">
              <h3>
                {activeCostumeItem.icon} {activeCostumeItem.name}
              </h3>
              <p className="sanskrit-inline">{activeCostumeItem.tamil}</p>
              <p>{activeCostumeItem.description}</p>
              <ul>
                {activeCostumeItem.highlights.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <section className="content-section reveal-section">
        <h2>The Masters — गुरु परम्परा</h2>
        <p className="section-lead">Artists who shaped the tradition</p>
        <div className="person-cards">
          {exponents.map((p) => (
            <article key={p.name} className="person-card" style={{ "--person": p.color }}>
              <div className="avatar">{initials(p.name)}</div>
              <h3>{p.name}</h3>
              <small>{p.years}</small>
              <span className="role-pill">{p.role}</span>
              <p>{p.contribution}</p>
              <blockquote>{p.quote}</blockquote>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section reveal-section">
        <h2>Navarasas — The Nine Emotions</h2>
        <p className="sanskrit-sub">नव रस</p>
        <p className="section-lead">Rasa is the emotional essence awakened in the audience through dance, music, and expression.</p>
        <div className="rasa-grid">
          {rasas.map(([emoji, name, sanskrit, tamil, meaning, color, desc], i) => (
            <article key={name} className="rasa-card" style={{ "--rasa": color }}>
              <span className="rasa-num">{i + 1}</span>
              <div className="rasa-emoji">{emoji}</div>
              <h3>{name}</h3>
              <p className="sanskrit-inline">{sanskrit} · {tamil}</p>
              <small>{meaning}</small>
              <p>{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section reveal-section">
        <h2>The Orchestra — वाद्य यंत्र</h2>
        <p className="section-lead">Instruments of a Bharatanatyam performance</p>
        <div className="instrument-grid">
          {instruments.map(([emoji, name, sanskrit, color, desc]) => (
            <article key={name} className="instrument-card" style={{ "--inst": color }}>
              <span>{emoji}</span>
              <h3>{name}</h3>
              <p className="sanskrit-inline">{sanskrit}</p>
              <p>{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="closing-section reveal-section">
        <div className="giant-om">ॐ</div>
        <p className="closing-sanskrit">नृत्यं भावं व्यक्त करोति</p>
        <p className="closing-translation">Dance gives form to the formless, voice to the voiceless</p>
        <small>— Natya Shastra, Bharata Muni</small>
        <div className="hero-ornament">✦ ── 🪷 ── ✦</div>

        <div className="cta-grid">
          <Link to="/detect" className="cta-card">🎵 Detect Your Tala</Link>
          <Link to="/learn" className="cta-card">🎓 Learn the Talas</Link>
          <Link to="/history" className="cta-card">📜 View History</Link>
        </div>
      </section>
    </div>
  );
}

export default BharatanatyamPage;
