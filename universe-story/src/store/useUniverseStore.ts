// src/store/useUniverseStore.ts
import { create } from 'zustand';

export type SceneType = 'intro' | 'cinematic' | 'transition' | 'main';

export type ModelId =
  | 'hydrogen'
  | 'carbon'
  | 'oxygen'
  | 'iron'
  | 'gas'
  | 'solar'
  | 'galaxy'
  | 'universe';

export interface ScientificModel {
  id: ModelId;
  name: string;
  subtitle: string;
  category: 'Quantum Atom' | 'Covalent Geometry' | 'Crystal Lattice' | 'Thermodynamics' | 'Astrophysics' | 'Cosmology';
  discoverer: string;
  year: string;
  accentHex: string;
  secondaryHex: string;
  cbseLink: string;
  description: string;
  toggleLabel: string;
  toggleActiveLabel: string;
  properties: Record<string, string>;
}

export interface StoryChapter {
  id: string;
  epoch: string;
  title: string;
  text: string;
  animeReference: string;
  placeholderGradient: string;
  imagePath?: string; // Drop your image in public/images/ and set path here later
}

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 'chapter-1',
    epoch: '01 // T = 0.00 SECONDS',
    title: 'The Velvet Dark',
    imagePath:'/images/aka1.png',
    text: 'Before the first photon pierced the void, before time knew how to flow—there was only the velvet dark. Not empty, but trembling with quantum potential.',
    animeReference: '',
    placeholderGradient: 'radial-gradient(circle at 50% 75%, rgba(255, 140, 60, 0.45), rgba(30, 20, 70, 0.7) 55%, rgba(5, 5, 15, 0.95))',
  },
  {
    id: 'chapter-2',
    imagePath: '/images/aka2.png',
    epoch: '02 // T + 100 MILLION YEARS',
    title: 'The Stellar Forge',
    text: 'Gravity gathered the primordial mist until pressure ignited nuclear fire. Inside the hearts of dying stars, hydrogen fused into carbon, oxygen, and glowing iron.',
    animeReference: '',
    placeholderGradient: 'radial-gradient(circle at 30% 40%, rgba(255, 70, 160, 0.45), rgba(0, 195, 255, 0.35) 50%, rgba(5, 8, 22, 0.95))',
  },
  {
    id: 'chapter-3',
    epoch: '03 // T + 9.2 BILLION YEARS',
    title: 'The Molecular Symphony',
    imagePath: '/images/aka3.png',
    text: 'Scattered across space, stellar ash cooled into oceans and continents. Carbon locked arms at 109.5 degrees, weaving the double helix of living memory.',
    animeReference: '',
    placeholderGradient: 'radial-gradient(circle at 70% 35%, rgba(0, 255, 170, 0.4), rgba(0, 110, 255, 0.35) 55%, rgba(4, 12, 18, 0.95))',
  },
  {
    id: 'chapter-4',
    imagePath: '/images/aka4.png',
    epoch: '04 // T + 13.8 BILLION YEARS',
    title: 'The Conscious Cosmos',
    text: 'Fourteen billion years of unbroken physics now sit inside your eyes—atoms arranged so intricately that the universe can finally look back at itself in wonder.',
    animeReference: '',
    placeholderGradient: 'radial-gradient(circle at 50% 30%, rgba(165, 90, 255, 0.5), rgba(255, 185, 50, 0.3) 55%, rgba(8, 4, 20, 0.95))',
  },
];

// Replace SCIENTIFIC_MODELS in src/store/useUniverseStore.ts
export const SCIENTIFIC_MODELS: ScientificModel[] = [
  {
    id: 'hydrogen',
    name: 'Hydrogen (¹H)',
    subtitle: 'Quantum Probability Cloud',
    category: 'Quantum Atom',
    discoverer: 'Henry Cavendish & Erwin Schrödinger',
    year: '1766 / 1926',
    accentHex: '#60a5fa',    // Balmer H-Beta Sapphire Blue
    secondaryHex: '#f43f5e', // Balmer H-Alpha Rose Core
    cbseLink: 'Structure of the Atom — Orbitals vs. Bohr Shells',
    description: 'Rather than orbiting on flat tracks, Hydrogen’s lone electron exists as a 3D standing wave of probability density |ψ|².',
    toggleLabel: 'Excite to 2p Dumbbell Orbital',
    toggleActiveLabel: 'Relax to 1s Ground State',
    properties: {
      'Atomic Number (Z)': '1 (1 Proton, 1 Electron)',
      'Electronic Config': '1s¹ (Ground) / 2p¹ (Excited)',
      'Ionization Energy': '13.598 eV (1312 kJ/mol)',
      'Bohr Radius (a₀)': '5.29 × 10⁻¹¹ m (52.9 pm)',
      'Emission Series': 'Balmer H-Alpha (656.3 nm)',
    },
  },
  {
    id: 'carbon',
    name: 'Carbon (¹²C)',
    subtitle: 'sp³ Tetrahedral Hybridization',
    category: 'Covalent Geometry',
    discoverer: 'Lavoisier & Linus Pauling',
    year: '1789 / 1931',
    accentHex: '#34d399',    // Emerald
    secondaryHex: '#f59e0b', // Warm Amber Nodes
    cbseLink: 'Class 10 Ch. 4 — Carbon & Its Compounds (Tetravalency)',
    description: 'Carbon mixes one 2s and three 2p orbitals into four symmetrical sp³ lobes separated by 109.5°, enabling catenation and organic life.',
    toggleLabel: 'Highlight 109.5° Bond Axes',
    toggleActiveLabel: 'Show Diffused Electron Cloud',
    properties: {
      'Atomic Number (Z)': '6 (Valency = 4)',
      'Hybridization': 'sp³ Tetrahedral',
      'Bond Angle': '109.5° (109° 28′)',
      'Key Property': 'Catenation (Self-Linking)',
      'Allotropes': 'Diamond, Graphite, Fullerene C₆₀',
    },
  },
  {
    id: 'oxygen',
    name: 'Dioxygen (O₂)',
    subtitle: 'Double Covalent & Paramagnetic Bond',
    category: 'Covalent Geometry',
    discoverer: 'Carl Wilhelm Scheele & Joseph Priestley',
    year: '1774',
    accentHex: '#38bdf8',    // Liquid Oxygen Sky Blue
    secondaryHex: '#fb923c', // Shared Pi-Bond Amber
    cbseLink: 'Class 10 Ch. 4 — Double Covalent Bonding (O=O)',
    description: 'Two oxygen nuclei share four valence electrons across a central σ-bond and lateral π-cloud while retaining two unpaired spin electrons.',
    toggleLabel: 'Isolate Shared Double-Bond Bridge',
    toggleActiveLabel: 'Restore Full Molecular Cloud',
    properties: {
      'Molecular Formula': 'O = O (Sharing 2 Pairs)',
      'Bond Order': '2.0 (498 kJ/mol Bond Energy)',
      'Bond Length': '120.74 picometers',
      'Magnetic Nature': 'Paramagnetic (2 Unpaired e⁻)',
      'Valence Electrons': '6 per Atom (12 Total)',
    },
  },
  {
    id: 'iron',
    name: 'Iron Lattice (⁵⁶Fe)',
    subtitle: 'BCC Metallic Crystal & Ferromagnetism',
    category: 'Crystal Lattice',
    discoverer: 'Ancient Metallurgy / William Lawrence Bragg',
    year: '1913 (X-Ray)',
    accentHex: '#f97316',    // Forged Molten Copper
    secondaryHex: '#94a3b8', // Metallic Steel Blue
    cbseLink: 'Class 10 Ch. 3 & 12 — Metals & Magnetic Effects',
    description: 'At room temperature, Iron atoms lock into a Body-Centered Cubic (BCC) crystal grid immersed in a sea of delocalized electrons.',
    toggleLabel: 'Align Magnetic Spin Domains',
    toggleActiveLabel: 'Release Thermal Lattice Jitter',
    properties: {
      'Atomic Number (Z)': '26 (d-Block Transition Metal)',
      'Crystal Structure': 'Body-Centered Cubic (α-Fe)',
      'Coord. Number': '8 Nearest Neighbors',
      'Curie Temperature': '1043 K (770 °C)',
      'Nuclear Stability': 'Peak Binding Energy (8.8 MeV)',
    },
  },
  {
    id: 'gas',
    name: 'Kinetic Ideal Gas',
    subtitle: 'Maxwell-Boltzmann Velocity Field',
    category: 'Thermodynamics',
    discoverer: 'James Clerk Maxwell & Ludwig Boltzmann',
    year: '1859 / 1871',
    accentHex: '#f43f5e',    // High-energy Vermilion
    secondaryHex: '#3b82f6', // Low-energy Ultramarine
    cbseLink: 'States of Matter & Thermal Kinetic Energy (Eₖ ∝ T)',
    description: 'Gas pressure and temperature emerge from billions of elastic molecular collisions. Slow particles glow sapphire; hyper-energetic molecules burn crimson.',
    toggleLabel: 'Superheat Gas (300K → 1200K)',
    toggleActiveLabel: 'Cool Gas to 300K Baseline',
    properties: {
      'Distribution Law': 'f(v) ∝ v² exp(-mv² / 2kT)',
      'Avg Kinetic Energy': 'Eₖ = (3/2) k_B T',
      'RMS Speed Formula': 'v_rms = √(3RT / M)',
      'Collision Type': 'Perfectly Elastic',
      'Color Encoding': 'Blue (Slow) → Ivory → Crimson (Fast)',
    },
  },
  {
    id: 'solar',
    name: 'The Solar System',
    subtitle: 'Keplerian Gravitation & Asteroid Belt',
    category: 'Astrophysics',
    discoverer: 'Nicolaus Copernicus & Johannes Kepler',
    year: '1543 / 1609',
    accentHex: '#eab308',    // Solar Gold
    secondaryHex: '#2dd4bf', // Planetary Teal
    cbseLink: 'Universal Law of Gravitation (F = G·m₁m₂ / r²)',
    description: 'Holding 99.86% of the system’s mass, the Sun bends spacetime into nested elliptical orbits governed by Kepler’s Harmonic Law (T² ∝ a³).',
    toggleLabel: 'Illuminate Habitable Zone & Belt',
    toggleActiveLabel: 'Standard Planetary View',
    properties: {
      'Central Star': 'G2V Main-Sequence (5778 K)',
      'Orbital Law': 'r(θ) = a(1 - e²) / (1 + e·cosθ)',
      'Harmonic Ratio': 'T² ∝ a³ (Kepler’s 3rd Law)',
      'Main Belt Span': '2.1 to 3.3 AU (Mars–Jupiter)',
      'Escape Velocity': '42.1 km/s (at 1 AU)',
    },
  },
  {
    id: 'galaxy',
    name: 'Milky Way Galaxy',
    subtitle: 'Logarithmic Spiral Density Waves',
    category: 'Astrophysics',
    discoverer: 'Galileo Galilei & Edwin Hubble',
    year: '1610 / 1924',
    accentHex: '#a78bfa',    // Deep Celestial Violet
    secondaryHex: '#fbbf24', // Galactic Core Gold
    cbseLink: 'Scale of the Cosmos & Centripetal Gravitation',
    description: 'Over 200 billion stars orbit a supermassive black hole (Sagittarius A*), compressed into glowing spiral arms by acoustic-like density waves.',
    toggleLabel: 'Isolate Galactic Bar & Halo',
    toggleActiveLabel: 'Show Full Spiral Arms',
    properties: {
      'Morphology': 'Barred Spiral (SBbc)',
      'Diameter': '105,700 Light-Years',
      'Central Core': 'Sagittarius A* (4.1 × 10⁶ M☉)',
      'Solar Orbit Speed': '220 km/s (230 Myr Period)',
      'Spiral Equation': 'r = a · exp(b · θ)',
    },
  },
  {
    id: 'universe',
    name: 'Observable Universe',
    subtitle: 'Large-Scale Cosmic Web Filaments',
    category: 'Cosmology',
    discoverer: 'Georges Lemaître & Vera Rubin',
    year: '1927 / 1980',
    accentHex: '#fb923c',    // Redshift Amber
    secondaryHex: '#818cf8', // Dark Matter Indigo
    cbseLink: 'Modern Cosmology — Dark Matter & Cosmic Expansion',
    description: 'At the grandest scale, whole galaxies are tiny glowing pearls strung along vast filaments of dark matter surrounding immense cosmic voids.',
    toggleLabel: 'Pulse Dark Matter Filaments',
    toggleActiveLabel: 'Standard Supercluster View',
    properties: {
      'Comoving Diameter': '93 Billion Light-Years',
      'Mass-Energy Split': '68% Dark Energy, 27% Dark Matter',
      'Baryonic Matter': '4.9% (Stars, Gas & Elements)',
      'Web Topology': 'Voronoi Filament & Void Foam',
      'CMB Temperature': '2.725 Kelvin',
    },
  },
];

interface UniverseState {
  scene: SceneType;
  chapterIndex: number;
  activeModelId: ModelId;
  variantActive: boolean;
  fps: number;
  frameTime: number;
  isMuted: boolean;
  setScene: (scene: SceneType) => void;
  nextChapter: () => void;
  selectModel: (id: ModelId) => void;
  toggleVariant: () => void;
  setMetrics: (fps: number, frameTime: number) => void;
  setMuted: (muted: boolean) => void;
}

export const useUniverseStore = create<UniverseState>((set) => ({
  scene: 'intro',
  chapterIndex: 0,
  activeModelId: 'hydrogen',
  variantActive: false,
  fps: 120,
  frameTime: 8.3,
  isMuted: false,
  setScene: (scene) => set({ scene }),
  nextChapter: () =>
    set((state) => {
      if (state.chapterIndex < STORY_CHAPTERS.length - 1) {
        return { chapterIndex: state.chapterIndex + 1 };
      }
      return { scene: 'transition' };
    }),
  selectModel: (id) => set({ activeModelId: id, variantActive: false }),
  toggleVariant: () => set((state) => ({ variantActive: !state.variantActive })),
  setMetrics: (fps, frameTime) => set({ fps, frameTime }),
  setMuted: (isMuted) => set({ isMuted }),
}));