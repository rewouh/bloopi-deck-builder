import { html } from 'https://esm.sh/htm/preact';
import { render } from 'https://esm.sh/preact';
import { useState } from 'https://esm.sh/preact/hooks';
import { DeckMetaForm } from './components/DeckMetaForm.js';
import { ItemCard } from './components/ItemCard.js';

let _keyCounter = 0;
const nextKey = () => ++_keyCounter;

export function slugify(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function defaultDeck() {
  return { id: '', name: '', description: '', author: '', language: 'us', tags: [], items: [] };
}

function newItem() {
  return { _key: nextKey(), _idManual: false, id: '', title: '', answers: [''], mnemonic: '', notes: '' };
}

function App() {
  const [deck, setDeck] = useState(defaultDeck);
  const [idManual, setIdManual] = useState(false);
  const [toast, setToast] = useState(null);
  const [showNextSteps, setShowNextSteps] = useState(false);

  function showToast(msg, type = 'ok') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }

  function updateMeta(field, value) {
    setDeck(d => {
      const next = { ...d, [field]: value };
      if (field === 'name' && !idManual) next.id = slugify(value);
      return next;
    });
  }

  function updateId(value) {
    setIdManual(true);
    setDeck(d => ({ ...d, id: value }));
  }

  function addItem() {
    setDeck(d => ({ ...d, items: [...d.items, newItem()] }));
    setTimeout(() => {
      const cards = document.querySelectorAll('.item-card');
      cards[cards.length - 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  function updateItem(index, item) {
    setDeck(d => {
      const items = [...d.items];
      items[index] = item;
      return { ...d, items };
    });
  }

  function removeItem(index) {
    setDeck(d => ({ ...d, items: d.items.filter((_, i) => i !== index) }));
  }

  function moveItem(index, dir) {
    setDeck(d => {
      const items = [...d.items];
      const to = index + dir;
      if (to < 0 || to >= items.length) return d;
      [items[index], items[to]] = [items[to], items[index]];
      return { ...d, items };
    });
  }

  function exportDeck() {
    const output = {
      id: deck.id,
      name: deck.name,
      description: deck.description,
      author: deck.author,
      language: deck.language,
      tags: deck.tags,
      items: deck.items.map(({ _key, _idManual, _collapsed, ...item }) => {
        const out = {
          id: item.id,
          title: item.title,
          answers: item.answers.filter(a => a.trim()),
          mnemonic: item.mnemonic,
        };
        if (item.notes?.trim()) out.notes = item.notes.trim();
        return out;
      }),
    };

    const missing = [];
    if (!output.id)   missing.push('Deck ID');
    if (!output.name) missing.push('Deck name');
    if (!output.author) missing.push('Author');
    if (output.items.length === 0) missing.push('at least one item');

    if (missing.length) {
      showToast(`Missing: ${missing.join(', ')}`, 'err');
      return;
    }

    const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${output.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowNextSteps(true);
  }

  function importDeck() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const parsed = JSON.parse(ev.target.result);
          setDeck({
            ...defaultDeck(),
            ...parsed,
            tags: parsed.tags || [],
            items: (parsed.items || []).map(item => ({
              _key: nextKey(),
              _idManual: true,
              _collapsed: true,
              ...item,
              answers: item.answers?.length ? item.answers : [''],
              notes: item.notes || '',
            })),
          });
          setIdManual(true);
          showToast(`Imported "${parsed.name || file.name}"`);
        } catch {
          showToast('Invalid JSON file', 'err');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  return html`
    <main class="builder-main">
      <header class="builder-header">
        <div class="app-title">Deck Builder</div>
        <p class="builder-subtitle">Build a <a href="https://rewouh.github.io/bloopi" target="_blank">Bloopi</a>-compatible deck and download it as JSON.</p>
      </header>

      <details class="guidelines-details">
        <summary>Deck building guidelines</summary>
        <div class="guidelines-body">
          <ul>
            <li><strong>Write direct prompts, not full questions</strong> — "longest river in the world" not "What is the longest river in the world?" Skip filler words that waste time during review. No capital letter at the start.</li>
            <li><strong>One clear correct answer per item</strong> — if multiple answers are plausible, reframe the question to make it unambiguous.</li>
            <li><strong>The mnemonic is required</strong> — it's the core of the learning experience. A bad mnemonic is worse than none; make it vivid and specific.</li>
            <li><strong>20–50 items</strong> — below 20 feels thin, above 50 becomes a grind.</li>
            <li><strong>End the deck name with a two-digit index</strong> — "World Geography 01", not "World Geography". This leaves room for related decks later (02, 03…) without renaming.</li>
            <li><strong>AI is a starting point, not a source</strong> — triple-check every fact and rewrite every mnemonic. AI-generated mnemonics often sound plausible but don't actually help recall.</li>
          </ul>
        </div>
      </details>

      <${DeckMetaForm}
        deck=${deck}
        onUpdate=${updateMeta}
        onIdChange=${updateId}
      />

      <section class="items-section">
        <div class="items-header">
          <h2>Items <span class="item-count">${deck.items.length}</span></h2>
        </div>

        ${deck.items.length === 0 && html`
          <div class="empty-items">
            <p>No items yet.</p>
            <p class="muted">A deck needs at least 20 items. Add your first one below.</p>
          </div>
        `}

        ${deck.items.map((item, i) => html`
          <${ItemCard}
            key=${item._key}
            item=${item}
            index=${i}
            total=${deck.items.length}
            deckId=${deck.id}
            initialCollapsed=${item._collapsed ?? false}
            onChange=${it => updateItem(i, it)}
            onRemove=${() => removeItem(i)}
            onMove=${dir => moveItem(i, dir)}
          />
        `)}

        <button type="button" class="add-item-btn" onClick=${addItem}>
          + Add item
        </button>
      </section>

      <footer class="builder-footer">
        <button type="button" class="outline secondary footer-btn" onClick=${importDeck}>Import JSON</button>
        <button type="button" class="footer-btn" onClick=${exportDeck}>Download JSON</button>
      </footer>

      ${toast && html`
        <div class=${'toast' + (toast.type === 'err' ? ' toast--err' : '')}>
          ${toast.msg}
        </div>
      `}

      ${showNextSteps && html`
        <div class="modal-overlay" onClick=${() => setShowNextSteps(false)}>
          <div class="modal-card" onClick=${e => e.stopPropagation()}>
            <h3>Deck downloaded!</h3>
            <p>To submit it to Bloopi:</p>
            <ol>
              <li>Fork the <a href="https://github.com/rewouh/bloopi" target="_blank" rel="noopener noreferrer">Bloopi repository</a></li>
              <li>Drop your JSON file into the <code>decks/</code> folder</li>
              <li>Open a pull request</li>
            </ol>
            <p class="modal-alt">Not on GitHub? Send the file to <a href="mailto:pbraudcontact@gmail.com">pbraudcontact@gmail.com</a> and I'll handle it.</p>
            <button type="button" onClick=${() => setShowNextSteps(false)}>Got it</button>
          </div>
        </div>
      `}
    </main>
  `;
}

render(html`<${App} />`, document.getElementById('app'));
