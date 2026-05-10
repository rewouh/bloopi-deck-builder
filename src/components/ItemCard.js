import { html } from 'https://esm.sh/htm/preact';
import { useState } from 'https://esm.sh/preact/hooks';
import { slugify } from '../app.js';

export function ItemCard({ item, index, total, deckId, onChange, onRemove, initialCollapsed = false }) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [answerInput, setAnswerInput] = useState('');
  const [showNotes, setShowNotes] = useState(!!item.notes?.trim());

  const filledAnswers = item.answers.filter(a => a.trim());
  const isReady = !!(item.title.trim() && filledAnswers.length > 0 && item.mnemonic.trim());

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

  function handleAnswerKey(e) {
    if (e.key === 'Enter' && answerInput.trim()) {
      e.preventDefault();
      const val = answerInput.trim();
      if (!item.answers.includes(val)) {
        onChange({ ...item, answers: [...item.answers.filter(a => a.trim()), val] });
      }
      setAnswerInput('');
    }
  }

  function removeAnswer(i) {
    const answers = item.answers.filter((_, idx) => idx !== i);
    onChange({ ...item, answers: answers.length ? answers : [] });
  }

  const preview = item.title || `Item ${index + 1}`;

  return html`
    <article class="item-card">
      <div class="item-header" onClick=${() => setCollapsed(c => !c)}>
        <span class="item-num">#${index + 1}</span>
        <span class="item-preview">${preview}</span>
        <span class=${'ready-dot' + (isReady ? ' ready-dot--ok' : ' ready-dot--no')} title=${isReady ? 'Ready' : 'Incomplete'}></span>
        <button
          type="button" class="remove-btn"
          onClick=${e => { e.stopPropagation(); onRemove(); }}
          title="Remove item"
        >✕</button>
        <span class=${'collapse-arrow' + (!collapsed ? ' collapse-arrow--open' : '')}>▾</span>
      </div>

      ${!collapsed && html`
        <div class="item-body">

          <div class="field-label">
            <span>Question <span class="req">*</span></span>
            <input
              type="text"
              value=${item.title}
              placeholder="Longest river in the world"
              onInput=${e => updateTitle(e.target.value)}
            />
            ${item.id && html`<small class="id-preview">id: ${item.id}</small>`}
          </div>

          <div class="field-label">
            <span>Answers <span class="req">*</span></span>
            <small class="field-hint">Type and press Enter · first answer is shown to the user</small>
            <div class="tag-wrap">
              ${filledAnswers.map((a, i) => html`
                <span class=${'answer-chip' + (i === 0 ? ' answer-chip--main' : ' answer-chip--variant')}>
                  ${a}
                  <button type="button" class="tag-remove" onClick=${() => removeAnswer(item.answers.indexOf(a))}>×</button>
                </span>
              `)}
              <input
                type="text"
                class="tag-input"
                value=${answerInput}
                placeholder=${filledAnswers.length === 0 ? 'Type an answer and press Enter…' : 'Add variant…'}
                onInput=${e => setAnswerInput(e.target.value)}
                onKeyDown=${handleAnswerKey}
              />
            </div>
          </div>

          <label class="field-label">
            <span>Mnemonic <span class="req">*</span></span>
            <small class="field-hint">A memory trick that makes the answer stick</small>
            <textarea
              rows="2"
              placeholder="The Nile flows like a long snake — N for Nile, N for North Africa."
              onInput=${e => set('mnemonic', e.target.value)}
            >${item.mnemonic}</textarea>
          </label>

          ${!showNotes && html`
            <button type="button" class="outline secondary add-notes-btn" onClick=${() => setShowNotes(true)}>
              + Add notes
            </button>
          `}

          ${showNotes && html`
            <label class="field-label">
              <span>Notes</span>
              <small class="field-hint">Optional fun fact shown after answering</small>
              <textarea
                rows="2"
                placeholder="The Nile is 6,650 km long and flows through 11 countries."
                onInput=${e => set('notes', e.target.value)}
              >${item.notes}</textarea>
            </label>
          `}

        </div>
      `}
    </article>
  `;
}
