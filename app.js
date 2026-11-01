const photos = window.memoryPhotos || [];
const videos = window.memoryVideos || [];
const photoGrid = document.querySelector('#photoGrid');
const videoGrid = document.querySelector('#videoGrid');
const memoryGrid = document.querySelector('#memoryGrid');
const movesLabel = document.querySelector('#moves');
const gameMessage = document.querySelector('#gameMessage');
let firstCard = null;
let locked = false;
let moves = 0;
let matched = 0;
let round = 0;
let hideTimer;

function shuffle(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function makeMemoryCard(photo, pairId) {
  const button = document.createElement('button');
  button.className = 'memory-card';
  button.type = 'button';
  button.dataset.pair = String(pairId);
  button.setAttribute('aria-label', 'Открыть карточку');
  button.innerHTML = '<span class="card-back" aria-hidden="true"><span>♡</span></span>';
  const image = document.createElement('img');
  image.src = photo.src;
  image.alt = '';
  image.loading = 'lazy';
  button.append(image);
  button.addEventListener('click', () => flipCard(button));
  return button;
}

function flipCard(card) {
  if (locked || card === firstCard || card.classList.contains('is-open') || card.classList.contains('is-matched')) return;
  card.classList.add('is-open');
  card.setAttribute('aria-label', 'Фотография открыта');
  if (!firstCard) {
    firstCard = card;
    return;
  }

  moves += 1;
  movesLabel.textContent = `Ходы: ${moves}`;
  if (card.dataset.pair === firstCard.dataset.pair) {
    card.classList.add('is-matched');
    firstCard.classList.add('is-matched');
    card.setAttribute('aria-label', 'Пара найдена');
    firstCard.setAttribute('aria-label', 'Пара найдена');
    firstCard = null;
    matched += 1;
    if (matched === Math.min(6, photos.length)) {
      gameMessage.textContent = `Все пары найдены за ${moves} ${moves === 1 ? 'ход' : moves < 5 ? 'хода' : 'ходов'}. Надеюсь, игра подарила тебе улыбку.`;
    } else {
      gameMessage.textContent = 'Есть пара! Попробуй найти следующую.';
    }
    return;
  }

  locked = true;
  gameMessage.textContent = 'Не совпали — попробуй ещё раз.';
  const activeRound = round;
  const previous = firstCard;
  firstCard = null;
  hideTimer = window.setTimeout(() => {
    if (activeRound !== round) return;
    previous.classList.remove('is-open');
    card.classList.remove('is-open');
    previous.setAttribute('aria-label', 'Открыть карточку');
    card.setAttribute('aria-label', 'Открыть карточку');
    locked = false;
    gameMessage.textContent = 'Все карточки закрыты. Выбирай любые две.';
  }, 850);
}

function resetGame() {
  round += 1;
  window.clearTimeout(hideTimer);
  firstCard = null;
  locked = false;
  moves = 0;
  matched = 0;
  movesLabel.textContent = 'Ходы: 0';
  gameMessage.textContent = 'Все карточки закрыты. Выбирай любые две.';
  const pairs = photos.slice(0, 6).flatMap((photo, index) => [
    { photo, pairId: index },
    { photo, pairId: index }
  ]);
  memoryGrid.replaceChildren(...shuffle(pairs).map(({ photo, pairId }) => makeMemoryCard(photo, pairId)));
}

photos.forEach((photo, index) => {
  const figure = document.createElement('figure');
  figure.className = `photo-tile photo-tile-${index + 1}`;
  const image = document.createElement('img');
  image.src = photo.src;
  image.alt = photo.alt;
  image.loading = 'lazy';
  figure.append(image);
  photoGrid.append(figure);
});

videos.forEach((src, index) => {
  const video = document.createElement('video');
  video.className = 'memory-video';
  video.controls = true;
  video.preload = 'metadata';
  video.playsInline = true;
  video.poster = photos[(index + 3) % photos.length]?.src || '';
  video.setAttribute('aria-label', `Наше видео, воспоминание ${index + 1}`);
  const source = document.createElement('source');
  source.src = src;
  source.type = 'video/mp4';
  video.append(source);
  videoGrid.append(video);
});

document.querySelector('#resetGame').addEventListener('click', resetGame);
resetGame();
