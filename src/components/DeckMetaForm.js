import { html } from 'https://esm.sh/htm/preact';
import { useState } from 'https://esm.sh/preact/hooks';

const LANGUAGES = [
  { code: 'us', label: '🇺🇸 English (US)' },
  { code: 'gb', label: '🇬🇧 English (UK)' },
  { code: 'fr', label: '🇫🇷 French' },
  { code: 'de', label: '🇩🇪 German' },
  { code: 'es', label: '🇪🇸 Spanish' },
  { code: 'it', label: '🇮🇹 Italian' },
  { code: 'pt', label: '🇵🇹 Portuguese' },
  { code: 'jp', label: '🇯🇵 Japanese' },
  { code: 'cn', label: '🇨🇳 Chinese' },
  { code: 'ru', label: '🇷🇺 Russian' },
  { code: 'ar', label: '🇸🇦 Arabic' },
  { code: 'ko', label: '🇰🇷 Korean' },
];

export function DeckMetaForm({ deck, onUpdate, onIdChange }) {
  const [tagInput, setTagInput] = useState('');

  function handleTagKey(e) {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      if (tag && !deck.tags.includes(tag)) {
        onUpdate('tags', [...deck.tags, tag]);
      }
      setTagInput('');
    }
  }

  function removeTag(tag) {
    onUpdate('tags', deck.tags.filter(t => t !== tag));
  }

  return html`
    <section class="meta-section">
      <h2 class="section-title">Deck info</h2>
      <article class="meta-card">

        <label class="field-label">
          <span>Name <span class="req">*</span></span>
          <input
            type="text"
            value=${deck.name}
            placeholder="World Geography"
            onInput=${e => onUpdate('name', e.target.value)}
          />
          ${deck.id && html`<small class="id-preview">id: ${deck.id}</small>`}
        </label>

        <label class="field-label">
          <span>Description <span class="req">*</span></span>
          <input
            type="text"
            value=${deck.description}
            placeholder="One sentence about what this deck covers."
            onInput=${e => onUpdate('description', e.target.value)}
          />
        </label>

        <div class="form-row">
          <label class="field-label">
            <span>Author <span class="req">*</span></span>
            <input
              type="text"
              value=${deck.author}
              placeholder="your-github-username"
              onInput=${e => onUpdate('author', e.target.value)}
            />
          </label>
          <label class="field-label">
            <span>Language <span class="req">*</span></span>
            <select onChange=${e => onUpdate('language', e.target.value)}>
              ${LANGUAGES.map(l => html`
                <option value=${l.code} selected=${deck.language === l.code}>${l.label}</option>
              `)}
            </select>
          </label>
        </div>

        <div class="field-label">
          <span>Tags <span class="req">*</span></span>
          <div class="tag-wrap">
            ${deck.tags.map(t => html`
              <span class="tag-chip">
                ${t}
                <button type="button" class="tag-remove" onClick=${() => removeTag(t)} aria-label="Remove tag ${t}">×</button>
              </span>
            `)}
            <input
              type="text"
              class="tag-input"
              value=${tagInput}
              placeholder=${deck.tags.length === 0 ? 'geography, history… (Enter to add)' : 'Add tag…'}
              onInput=${e => setTagInput(e.target.value)}
              onKeyDown=${handleTagKey}
            />
          </div>
          <small class="field-hint">Press Enter or , to add · lowercase only</small>
        </div>

      </article>
    </section>
  `;
}
