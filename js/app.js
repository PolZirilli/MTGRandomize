document.addEventListener('DOMContentLoaded', () => {
    // Elementos de las secciones de contenido
    const searchCardSection = document.getElementById('search-card-section');
    const randomCardSection = document.getElementById('random-card-section');
    const contentSections = [searchCardSection, randomCardSection];

    // Elementos de navegación inferior
    const navItems = document.querySelectorAll('.nav-item');

    // Elementos de la sección aleatoria
    const randomCardButton = document.getElementById('randomCardButton');
    const randomCardDisplay = document.getElementById('randomCardDisplay');

    // Elementos de la sección de búsqueda
    const cardNameInput = document.getElementById('cardNameInput');
    const searchCardButton = document.getElementById('searchCardButton');
    const searchCardResults = document.getElementById('searchCardResults');

    const SCRYFALL_API_BASE = 'https://api.scryfall.com';

    // --- Lógica de Navegación ---
    function setActiveNavItem(targetId) {
        navItems.forEach(item => {
            if (item.dataset.target === targetId) {
                item.classList.add('text-white', 'font-semibold'); // Color activo
                item.classList.remove('text-yellow-100');
            } else {
                item.classList.remove('text-white', 'font-semibold');
                item.classList.add('text-yellow-100');
            }
        });
    }

    function showSection(targetId) {
        contentSections.forEach(section => {
            if (section.id === targetId) {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
            }
        });
        setActiveNavItem(targetId);
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetSectionId = item.dataset.target;
            showSection(targetSectionId);
        });
    });

    // Mostrar sección de búsqueda por defecto al cargar
    showSection('search-card-section');

    // --- Funcionalidad de Carta Aleatoria ---
    if (randomCardButton) { // Verificar que el botón existe antes de añadir listener
        randomCardButton.addEventListener('click', fetchRandomCard);
    }

    async function fetchRandomCard() {
        randomCardDisplay.innerHTML = '<p class="text-center text-neutral-500 py-4">Cargando carta aleatoria...</p>';
        try {
            const response = await fetch(`${SCRYFALL_API_BASE}/cards/random`);
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            const cardData = await response.json();
            displaySingleCard(cardData, randomCardDisplay);
        } catch (error) {
            console.error('Error al obtener carta aleatoria:', error);
            randomCardDisplay.innerHTML = `<p class="text-center text-red-500 py-4">No se pudo cargar la carta. Error: ${error.message}</p>`;
        }
    }

    // --- Funcionalidad de Búsqueda de Cartas ---
    if (searchCardButton) { // Verificar que los elementos existen
        searchCardButton.addEventListener('click', searchCardsByName);
    }
    if (cardNameInput) {
        cardNameInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') searchCardsByName();
        });
    }
    
    async function searchCardsByName() {
        const cardName = cardNameInput.value.trim();
        if (!cardName) {
            searchCardResults.innerHTML = '<p class="text-center text-yellow-600 py-4">Por favor, introduce un nombre de carta.</p>';
            return;
        }
        searchCardResults.innerHTML = `<p class="text-center text-neutral-500 py-4">Buscando "${cardName}"...</p>`;
        try {
            const response = await fetch(`${SCRYFALL_API_BASE}/cards/search?q=name:"${encodeURIComponent(cardName)}"&unique=prints`);
            if (!response.ok) {
                if (response.status === 404) {
                     searchCardResults.innerHTML = `<p class="text-center text-yellow-600 py-4">No se encontraron cartas con el nombre "${cardName}".</p>`;
                } else {
                    throw new Error(`Error HTTP: ${response.status}`);
                }
                return;
            }
            const searchData = await response.json();
            if (searchData.data && searchData.data.length > 0) {
                displayMultipleCards(searchData.data, searchCardResults);
            } else {
                searchCardResults.innerHTML = `<p class="text-center text-yellow-600 py-4">No se encontraron cartas con el nombre "${cardName}".</p>`;
            }
        } catch (error) {
            console.error('Error al buscar cartas:', error);
            searchCardResults.innerHTML = `<p class="text-center text-red-500 py-4">Error al realizar la búsqueda. ${error.message}</p>`;
        }
    }

    // --- Funciones Auxiliares para Mostrar Cartas (con clases de Tailwind) ---
    function createCardElement(cardData) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'md:p-4 rounded-lg hover:shadow-xl transition-shadow duration-200 ease-in-out flex flex-col items-center text-center';
        let imageUrl = 'https://via.placeholder.com/223x310.png?text=No+Image';
        if (cardData.image_uris && cardData.image_uris.normal) {
            imageUrl = cardData.image_uris.normal;
        } else if (cardData.card_faces && cardData.card_faces[0].image_uris && cardData.card_faces[0].image_uris.normal) {
            imageUrl = cardData.card_faces[0].image_uris.normal;
        }
        const img = document.createElement('img');
        img.className = 'w-xl max-w-[186px] h-auto rounded-md mb-3 shadow-sm'; // Ajustado tamaño para mobile first
        img.src = imageUrl;
        img.alt = cardData.name;
        img.loading = 'lazy';
        const name = document.createElement('p');
        name.className = 'font-semibold text-sm text-neutral-700 mt-auto';
        name.textContent = cardData.name;
        cardDiv.appendChild(img);
        cardDiv.appendChild(name);
        return cardDiv;
    }

    function displaySingleCard(cardData, displayElement) {
        displayElement.innerHTML = '';
        const cardElement = createCardElement(cardData);
        // Para la carta aleatoria, podría ser bueno darle un max-width al contenedor de la carta
        const wrapper = document.createElement('div');
        wrapper.className = 'mx-auto'; // Centra y limita el ancho de la carta única
        wrapper.appendChild(cardElement);
        displayElement.appendChild(wrapper);
    }

    function displayMultipleCards(cardsArray, displayElement) {
        displayElement.innerHTML = '';
        if (cardsArray.length === 0) {
            displayElement.innerHTML = '<p class="text-center text-neutral-500 py-4">No se encontraron cartas.</p>';
            return;
        }
        const gridContainer = document.createElement('div');
        // Ajustado grid para mobile-first, más columnas en pantallas más grandes
        gridContainer.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4';
        cardsArray.forEach(cardData => {
            const cardElement = createCardElement(cardData);
            gridContainer.appendChild(cardElement);
        });
        displayElement.appendChild(gridContainer);
    }
});