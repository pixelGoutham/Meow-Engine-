// src/App.tsx
import React, { useState, useEffect } from 'react';
import { UniverseCanvas } from './components/UniverseCanvas';
import {
  useUniverseStore,
  SCIENTIFIC_MODELS,
  STORY_CHAPTERS,
} from './store/useUniverseStore';
import { soundEngine } from './utils/soundEngine';
import './styles.css';

export const App: React.FC = () => {
  const {
    scene,
    chapterIndex,
    activeModelId,
    variantActive,
    fps,
    frameTime,
    setScene,
    nextChapter,
    selectModel,
    toggleVariant,
  } = useUniverseStore();

  const activeModel =
    SCIENTIFIC_MODELS.find((m) => m.id === activeModelId) || SCIENTIFIC_MODELS[0];
  const currentChapter = STORY_CHAPTERS[chapterIndex];

  // Typewriter text effect for Cinematic Scene
  const [typedText, setTypedText] = useState('');
  useEffect(() => {
    if (scene !== 'cinematic') return;
    setTypedText('');
    let i = 0;
    const fullText = currentChapter.text;
    const interval = setInterval(() => {
      i += 1;
      setTypedText(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [scene, chapterIndex, currentChapter]);

  // Trigger Singularity Sound Effect on Transition Scene
  useEffect(() => {
    if (scene === 'transition') {
      soundEngine.playSingularity();
    }
  }, [scene]);

  return (
    <div
      className="app-shell"
      style={
        {
          '--accent': activeModel.accentHex,
          '--accent-secondary': activeModel.secondaryHex,
        } as React.CSSProperties
      }
    >
      {/* Persistent 3D WebGL HDR Particle Canvas */}
      <UniverseCanvas />

      {/* Top-Center Wayfinding Chrome (Only in Main Scene — Audio Button Hidden) */}
      {scene === 'main' && (
        <div className="top-Floating-nav">
          <button
            className="chrome-pill"
            onPointerDown={() => soundEngine.playClick()}
            onClick={() => setScene('intro')}
          >
            ↺ Intro Attract
          </button>
          <button
            className="chrome-pill"
            onPointerDown={() => soundEngine.playClick()}
            onClick={() => setScene('transition')}
          >
            ✦ Replay Singularity
          </button>
        </div>
      )}

      {/* Foreground UI Layer */}
      <div className="ui-layer">
        {/* SCENE 1: Pitch-Black OLED Intro Attract Loop */}
        {scene === 'intro' && (
          <div className="intro-overlay">
            <div className="intro-hero-box">
              <div className="intro-kicker">
                100% DCI-P3 HDR • REAL-TIME GPU QUANTUM & ASTROPHYSICS ENGINE
              </div>
              <h1 className="heritage-title">
                A STORY THROUGH
                <br />
                THE ENTIRE UNIVERSE
              </h1>
              <p className="intro-subtitle">
                From the probability cloud of a single Hydrogen electron to the filament
                network of the Cosmic Web—experienced in living light.
              </p>
              <button
                className="apple-btn"
                onPointerDown={() => {
                  soundEngine.init();
                  soundEngine.playClick();
                }}
                onClick={() => setScene('cinematic')}
              >
                Begin the Journey →
              </button>
            </div>
          </div>
        )}

        {/* SCENE 2: Cinematic Heritage Story Bridge */}
        {scene === 'cinematic' && (
          <div className="cinematic-overlay">
            <div className="story-card">
              <div className="story-epoch">{currentChapter.epoch}</div>
              <h2 className="story-heading">{currentChapter.title}</h2>

              <div
                className="anime-frame"
                style={{
                  background: currentChapter.imagePath
                    ? `url(${currentChapter.imagePath}) center/cover no-repeat`
                    : currentChapter.placeholderGradient,
                }}
              >
                <div className="anime-badge">{currentChapter.animeReference}</div>
              </div>

              <p className="story-body">{typedText}</p>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <button
                  className="apple-btn"
                  onPointerDown={() => soundEngine.playClick()}
                  onClick={() => nextChapter()}
                >
                  {chapterIndex < STORY_CHAPTERS.length - 1
                    ? 'Continue Chapter →'
                    : 'Collapse Into Singularity →'}
                </button>
                <button
                  className="chrome-pill"
                  onPointerDown={() => soundEngine.playClick()}
                  onClick={() => setScene('transition')}
                >
                  Skip ⏭
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCENE 3: Singularity Implosion */}
        {scene === 'transition' && (
          <div className="singularity-banner">
            QUANTUM SINGULARITY DETONATION // IGNITING 55,000 GPU PARTICLES...
          </div>
        )}

        {/* SCENE 4: 3-Panel Interactive Science Workbench */}
        {scene === 'main' && (
          <div className="main-workbench">
            {/* LEFT PANEL: Vertical Model Carousel */}
            <aside className="spectral-panel">
              <div className="panel-header">
                <span>SCALE OF THE COSMOS</span>
                <span>08 MODELS</span>
              </div>
              <div className="carousel-list">
                {SCIENTIFIC_MODELS.map((model) => {
                  const isActive = model.id === activeModelId;
                  return (
                    <button
                      key={model.id}
                      className={`model-card ${isActive ? 'active' : ''}`}
                      style={
                        {
                          '--card-accent': model.accentHex,
                          '--card-secondary': model.secondaryHex,
                        } as React.CSSProperties
                      }
                      onPointerDown={() => soundEngine.playClick()}
                      onClick={() => selectModel(model.id)}
                    >
                      <div className="model-card-header">
                        <div className="model-category-tag">{model.category}</div>
                        <span className="spectral-dot" />
                      </div>
                      <div className="model-card-title">{model.name}</div>
                      <div className="model-card-sub">{model.subtitle}</div>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* CENTER PANEL: Interactive Stage HUD */}
            <main className="center-stage-hud">
              <div className="stage-badge">
                DRAG TO ORBIT 3D • SCROLL TO ZOOM • HOVER CURSOR TO PERTURB PARTICLES
              </div>
              <button
                className="apple-btn"
                onPointerDown={() => soundEngine.playClick()}
                onClick={() => toggleVariant()}
              >
                {variantActive
                  ? `✦ ${activeModel.toggleActiveLabel}`
                  : `⚡ ${activeModel.toggleLabel}`}
              </button>
            </main>

            {/* RIGHT PANEL: Telemetry & Scientific Dossier */}
            <aside className="spectral-panel">
              <div className="panel-header">
                <span>LIVE GPU TELEMETRY</span>
                <span>55,000 INSTANCES</span>
              </div>

              <div className="telemetry-box">
                <div className="metric-tile">
                  <div className="metric-label">FRAME RATE</div>
                  <div className="metric-value">{fps} FPS</div>
                </div>
                <div className="metric-tile">
                  <div className="metric-label">FRAME TIME</div>
                  <div className="metric-value">{frameTime.toFixed(2)} ms</div>
                </div>
              </div>

              <div className="dossier-scroll">
                <div>
                  <div
                    className="model-category-tag"
                    style={{ color: activeModel.accentHex }}
                  >
                    {activeModel.discoverer} ({activeModel.year})
                  </div>
                  <h2 className="dossier-title">{activeModel.name}</h2>
                </div>

                <div className="cbse-banner">{activeModel.cbseLink}</div>

                <p className="dossier-desc">{activeModel.description}</p>

                <div className="panel-header" style={{ marginTop: 6, marginBottom: 2 }}>
                  <span>SCIENTIFIC PARAMETERS</span>
                </div>

                <div className="props-table">
                  {Object.entries(activeModel.properties).map(([key, val]) => (
                    <div className="prop-row" key={key}>
                      <span className="prop-key">{key}</span>
                      <span className="prop-val">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;