import { html } from 'https://esm.sh/htm/preact';
import { slugify } from '../app.js';

export function ItemCard({ item, index, total, deckId, onChange, onRemove, onMove }) {
  function set(field, value) {
    onChange({ ...item, [field]: value });
  }

  function updateTitle(value) {
    const next = { ...item, title: value };
    if (!item._idManual) {
      next.id = [deckId, slugify(value)].filter(Boolean).join('_');
    }
    onChange(next);
  }

  function updateAnswer(i, value) {
    const answers = [...item.answers];
    answers[i] = value;
    onChange({ ...item, answers });
  }

  function addAnswer() {
    onChange({ ...item, answers: [...item.answers, ''] });
  }

  function removeAnswer(i) {
    const answers = item.answers.filter((_, idx) => idx !== i);
    onChange({ ...item, answers: answers.length ? answers : [''] });
  }

  const preview = item.title || `Item ${index + 1}`;

  return html`
    <article class="item-card">
      <div class="item-header">
        <span class="item-num">#${index + 1}</span>
        <span class="item-preview">${preview}</span>
        <div class="item-actions">
          <button
            type="button" class="outline secondary icon-btn"
            onClick=${() => onMove(-1)} disabled=${index === 0}
            title="Move up"
          >↑</button>
          <button
            type="button" class="outline secondary icon-btn"
            onClick=${() => onMove(1)} disabled=${index === total - 1}
            title="Move down"
          >↓</button>
          <button
            type="button" class="remove-btn"
            onClick=${onRemove}
            title="Remove item"
          >✕</button>
        </div>
      </div>

      <label class="field-label">
        Question <span class="req">*</span>
        <input
          type="text"
          value=${item.title}
          placeholder="What is the longest river in the world?"
          onInput=${e => updateTitle(e.target.value)}
        />
      </label>

      <label class="field-label">
        ID <span class="req">*</span>
        <input
          type="text"
          value=${item.id}
          placeholder="world_geography_nile"
          onInput=${e => onChange({ ...item, id: e.target.value, _idManual: true })}
        />
        <small class="field-hint">Auto-generated · edit to customise · prefix with deck id to avoid collisions</small>
      </label>

      <div class="field-label">
        <span>Answers <span class="req">*</span></span>
        <small class="field-hint">First entry is shown to the user; add variants for fuzzy matching</small>
        <div class="answers-list">
          ${item.answers.map((a, i) => html`
            <div class="answer-row">
              <input
                type="text"
                value=${a}
                placeholder=${i === 0 ? 'Main answer (shown to user)' : 'Accepted variant'}
                onInput=${e => updateAnswer(i, e.target.value)}
              />
              ${item.answers.length > 1 && html`
                <button
                  type="button" class="outline secondary icon-btn"
                  onClick=${() => removeAnswer(i)}
                  title="Remove variant"
                >✕</button>
              `}
            </div>
          `)}
          <button type="button" class="outline secondary add-variant-btn" onClick=${addAnswer}>
            + Add variant
          </button>
        </div>
      </div>

      <label class="field-label">
        Mnemonic <span class="req">*</span>
        <small class="field-hint">A memory trick that makes the answer stick — this is the core of the learning experience</small>
        <textarea
          rows="2"
          placeholder="The Nile flows like a long, winding snake through the continent — N for Nile, N for North Africa."
          onInput=${e => set('mnemonic', e.target.value)}
        >${item.mnemonic}</textarea>
      </label>

      <label class="field-label">
        Notes
        <small class="field-hint">Optional fun fact shown after answering</small>
        <textarea
          rows="2"
          placeholder="The Nile is 6,650 km long and flows through 11 countries."
          onInput=${e => set('notes', e.target.value)}
        >${item.notes}</textarea>
      </label>
    </article>
  `;
}
