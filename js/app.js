const btn = document.getElementById('shuffle-btn');
const image = document.getElementById('card-image');
const name = document.getElementById('card-name');
const text = document.getElementById('card-text');
const mana = document.getElementById('card-mana');
const type = document.getElementById('card-type');
const set = document.getElementById('card-set');
const loader = document.getElementById('loader');
const container = document.getElementById('card-container');

const sections = {
  home: document.getElementById('home-section'),
  randomizer: document.getElementById('randomizer-section'),
  search: document.getElementById('search-section')
};

function showSection(sectionName) {
  for (const key in sections) {
    if (sections.hasOwnProperty(key)) {
      sections[key].classList.add('hidden');
    }
  }
  sections[sectionName].classList.remove('hidden');

  if (sectionName === 'randomizer') {
    getRandomCard();
  }
}

async function getRandomCard() {
  loader.classList.remove('hidden');
  container.classList.add('hidden');

  try {
    const res = await fetch('https://api.scryfall.com/cards/random');
    const card = await res.json();

    if (!card.image_uris || !card.image_uris.normal) {
      throw new Error("Carta sin imagen válida");
    }

    image.src = card.image_uris.normal;
    name.textContent = card.name;
    text.textContent = card.oracle_text || 'Sin texto';
    mana.innerHTML = `<i class="fas fa-fire text-red-400 mr-1"></i>Coste de maná: ${card.mana_cost || 'N/A'}`;
    type.innerHTML = `<i class="fas fa-scroll text-yellow-300 mr-1"></i>Tipo: ${card.type_line}`;
    set.innerHTML = `<i class="fas fa-cube text-green-300 mr-1"></i>Expansión: ${card.set_name}`;

    loader.classList.add('hidden');
    container.classList.remove('hidden');
  } catch (err) {
    console.error('Error al obtener carta:', err);
    loader.classList.add('hidden');
    container.classList.remove('hidden');
    name.textContent = "Error al cargar carta";
    image.src = '';
    text.textContent = '';
    mana.textContent = '';
    type.textContent = '';
    set.textContent = '';
  }
}

const form = document.getElementById('filter-form');
const results = document.getElementById('results');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const mana = document.getElementById('mana-select').value;
  const type = document.getElementById('type-select').value;
  const set = document.getElementById('set-select').value;

  let query = 'https://api.scryfall.com/cards/search?q=';

  if (mana) query += `mana:{${mana}}+`;
  if (type) query += `type:${type}+`;
  if (set) query += `set:${set}+`;

  query = query.trim().replace(/\+$/, '');

  results.innerHTML = `<p class="text-yellow-200 italic">Buscando...</p>`;

  try {
    const res = await fetch(query);
    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      results.innerHTML = `<p class="text-red-400">No se encontraron cartas.</p>`;
      return;
    }

    results.innerHTML = '';
    data.data.forEach(card => {
      const cardDiv = document.createElement('div');
      cardDiv.classList.add('border', 'border-yellow-500', 'p-2', 'bg-gray-900', 'rounded', 'text-center', 'shadow-md');

      cardDiv.innerHTML = `
        <img src="${card.image_uris?.small || ''}" alt="${card.name}" class="mb-2 rounded">
        <h3 class="font-bold text-yellow-300">${card.name}</h3>
        <p class="text-sm">${card.type_line}</p>
      `;
      results.appendChild(cardDiv);
      cardDiv.addEventListener('click', () => showModal(card));

    });
  } catch (err) {
    console.error(err);
    results.innerHTML = `<p class="text-red-400">Error al buscar cartas.</p>`;
  }
});

const modal = document.getElementById('card-modal');
const modalImage = document.getElementById('modal-image');
const modalName = document.getElementById('modal-name');
const modalMana = document.getElementById('modal-mana');
const modalType = document.getElementById('modal-type');
const modalText = document.getElementById('modal-text');
const modalSet = document.getElementById('modal-set');
const closeModal = document.getElementById('close-modal');

// Mostrar modal con datos
function showModal(card) {
  modalImage.src = card.image_uris?.normal || '';
  modalName.textContent = card.name;
  modalMana.textContent = `Coste de maná: ${card.mana_cost || 'N/A'}`;
  modalType.textContent = `Tipo: ${card.type_line}`;
  modalSet.textContent = `Expansión: ${card.set_name}`;
  modalText.textContent = card.oracle_text || 'Sin descripción';
  modal.classList.remove('hidden');
}

// Cerrar modal
closeModal.addEventListener('click', () => modal.classList.add('hidden'));

// También cerrar si se hace clic fuera del contenido
modal.addEventListener('click', e => {
  if (e.target === modal) modal.classList.add('hidden');
});



//
