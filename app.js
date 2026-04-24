// Shared interactions: flashcards, math rendering hooks
document.addEventListener('DOMContentLoaded', () => {
  // --- Flashcard deck system ---
  document.querySelectorAll('.flashcards').forEach(deck => {
    const cards = Array.from(deck.querySelectorAll('.flashcard'));
    if (cards.length === 0) return;
    let idx = 0;

    // Hide all, show first
    cards.forEach((c, i) => { c.style.display = i === 0 ? 'flex' : 'none'; });

    const controls = document.createElement('div');
    controls.className = 'fc-controls';
    controls.innerHTML = `
      <button data-act="prev">← Prev</button>
      <span class="fc-progress">1 / ${cards.length}</span>
      <button data-act="shuffle">Shuffle</button>
      <button data-act="next">Next →</button>
    `;
    deck.appendChild(controls);
    const progress = controls.querySelector('.fc-progress');

    const render = () => {
      cards.forEach((c, i) => {
        c.style.display = i === idx ? 'flex' : 'none';
        c.classList.remove('flipped');
      });
      progress.textContent = `${idx + 1} / ${cards.length}`;
    };

    cards.forEach(c => {
      c.addEventListener('click', () => c.classList.toggle('flipped'));
    });

    controls.addEventListener('click', (e) => {
      const act = e.target.dataset.act;
      if (!act) return;
      if (act === 'next') idx = (idx + 1) % cards.length;
      if (act === 'prev') idx = (idx - 1 + cards.length) % cards.length;
      if (act === 'shuffle') {
        // Fisher-Yates
        for (let i = cards.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [cards[i], cards[j]] = [cards[j], cards[i]];
          deck.insertBefore(cards[i], controls);
        }
        idx = 0;
      }
      render();
    });

    // Keyboard
    deck.tabIndex = 0;
    deck.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { idx = (idx + 1) % cards.length; render(); }
      if (e.key === 'ArrowLeft') { idx = (idx - 1 + cards.length) % cards.length; render(); }
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        cards[idx].classList.toggle('flipped');
      }
    });
  });

  // --- Quiz engine ---
  // Compute-type questions: validate a numeric answer (supports fractions like 1/3 and % like 12.5%).
  // Explain-type questions: reveal a model answer after the user tries.
  document.querySelectorAll('.qz-item').forEach(item => {
    const type = item.dataset.type;

    if (type === 'compute') {
      const input = item.querySelector('.qz-input');
      const check = item.querySelector('.qz-check');
      const feedback = item.querySelector('.qz-feedback');
      const sol = item.querySelector('.qz-solution');
      const answer = parseFloat(item.dataset.answer);
      const tol = parseFloat(item.dataset.tolerance || '0.01');
      let tries = 0;

      const parseNumber = (raw) => {
        const s = raw.trim().replace(/,/g, '');
        if (s === '') return NaN;
        if (s.includes('/') && !s.includes(' ')) {
          const parts = s.split('/');
          if (parts.length === 2) {
            const n = parseFloat(parts[0]);
            const d = parseFloat(parts[1]);
            if (!isNaN(n) && !isNaN(d) && d !== 0) return n / d;
          }
        }
        if (s.endsWith('%')) {
          const v = parseFloat(s.slice(0, -1));
          if (!isNaN(v)) return v / 100;
        }
        return parseFloat(s);
      };

      const evaluate = () => {
        if (!feedback) return;
        const v = parseNumber(input.value);
        if (isNaN(v)) {
          feedback.textContent = 'enter a number (fraction or % ok)';
          feedback.className = 'qz-feedback warm';
          return;
        }
        tries++;
        const diff = Math.abs(v - answer);
        if (diff <= tol) {
          feedback.textContent = 'correct';
          feedback.className = 'qz-feedback ok';
          if (sol) sol.classList.add('show');
        } else if (diff <= tol * 5) {
          feedback.textContent = 'close — check rounding or units';
          feedback.className = 'qz-feedback warm';
        } else {
          if (tries >= 2) {
            feedback.textContent = 'not quite — solution shown';
            feedback.className = 'qz-feedback no';
            if (sol) sol.classList.add('show');
          } else {
            feedback.textContent = 'not right, try once more';
            feedback.className = 'qz-feedback no';
          }
        }
      };

      if (check) check.addEventListener('click', evaluate);
      if (input) input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); evaluate(); }
      });
    }

    if (type === 'explain') {
      const btn = item.querySelector('.qz-reveal');
      const model = item.querySelector('.qz-model');
      if (btn && model) {
        btn.addEventListener('click', () => {
          model.classList.add('show');
          btn.textContent = 'shown';
          btn.disabled = true;
        });
      }
    }
  });

  // KaTeX auto-render if present
  if (window.renderMathInElement) {
    window.renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\[', right: '\\]', display: true },
        { left: '\\(', right: '\\)', display: false }
      ],
      throwOnError: false
    });
  }
});
