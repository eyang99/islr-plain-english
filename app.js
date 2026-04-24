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
