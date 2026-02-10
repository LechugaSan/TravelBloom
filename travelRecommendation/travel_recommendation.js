// Variables globales
let allDestinations = [];
let currentSearchKeyword = '';

// Cargar datos al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    loadDestinations();
});

// Cargar destinos desde el JSON
async function loadDestinations() {
    try {
        const response = await fetch('travel_recommendation_api.json');
        
        if (!response.ok) {
            throw new Error(`Error al cargar datos: ${response.status}`);
        }
        
        const data = await response.json();
        allDestinations = data.destinations;
        console.log('Destinos cargados exitosamente:', allDestinations);
        
        // Mostrar todos los destinos en home
        displayAllDestinations();
        
        // Mostrar secciones destacadas
        displayFeaturedDestinations();
    } catch (error) {
        console.error('Error al obtener datos:', error);
        showErrorMessage('Error al cargar los destinos. Por favor, recarga la página.');
    }
}

// Mostrar todas las recomendaciones
function displayAllDestinations() {
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = '';
    
    if (allDestinations.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results">No hay destinos disponibles.</div>';
        return;
    }
    
    allDestinations.forEach(destination => {
        const card = createDestinationCard(destination);
        resultsContainer.appendChild(card);
    });
}

// Mostrar secciones destacadas en la página de inicio
function displayFeaturedDestinations() {
    const beaches = allDestinations.filter(d => d.type === 'beach').slice(0, 2);
    const temples = allDestinations.filter(d => d.type === 'temple').slice(0, 2);
    const countries = allDestinations.filter(d => d.type === 'country').slice(0, 2);
    
    displayFeaturedCategory('beachShowcase', beaches);
    displayFeaturedCategory('templeShowcase', temples);
    displayFeaturedCategory('countryShowcase', countries);
}

// Mostrar una categoría destacada
function displayFeaturedCategory(containerId, destinations) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    destinations.forEach(destination => {
        const card = createFeaturedCard(destination);
        container.appendChild(card);
    });
}

// Crear una tarjeta destacada
function createFeaturedCard(destination) {
    const card = document.createElement('div');
    card.className = 'featured-card';
    
    const timeInfo = getTimeInCountry(destination.country);
    
    // Manejar tanto el formato antiguo (imageUrl) como el nuevo (images array)
    let imagesHtml = '';
    if (destination.images && Array.isArray(destination.images)) {
        imagesHtml = destination.images.map((img, index) => `
            <img src="${img}" alt="${destination.name} - Imagen ${index + 1}" onerror="this.src='https://via.placeholder.com/250x150?text=${encodeURIComponent(destination.name)}-${index + 1}'">
        `).join('');
    } else {
        imagesHtml = `<img src="${destination.imageUrl}" alt="${destination.name}" onerror="this.src='https://via.placeholder.com/500x150?text=${encodeURIComponent(destination.name)}'">`;
    }
    
    card.innerHTML = `
        <div class="featured-card-images">
            ${imagesHtml}
        </div>
        <div class="featured-card-content">
            <h3>${destination.name}</h3>
            <p>${destination.description.substring(0, 80)}...</p>
            <div class="featured-card-meta">
                <span>📍 ${destination.country}</span>
                <span>🕐 ${timeInfo}</span>
            </div>
        </div>
    `;
    
    // Al hacer clic, realizar búsqueda del destino
    card.addEventListener('click', () => {
        document.getElementById('searchInput').value = destination.name;
        searchDestinations();
    });
    
    return card;
}

// Buscar destinos por palabra clave
function searchDestinations() {
    const searchInput = document.getElementById('searchInput');
    const keyword = searchInput.value.trim();
    
    if (!keyword) {
        showErrorMessage('Por favor, ingresa una palabra clave para buscar.');
        return;
    }
    
    currentSearchKeyword = keyword.toLowerCase();
    const results = filterDestinations(currentSearchKeyword);
    
    displayResults(results, keyword);
    showPage('results');
}

// Crear una tarjeta de destino
function createDestinationCard(destination) {
    const card = document.createElement('div');
    card.className = 'result-card';
    
    const timeInfo = getTimeInCountry(destination.country);
    
    // Manejar tanto el formato antiguo (imageUrl) como el nuevo (images array)
    let imagesHtml = '';
    if (destination.images && Array.isArray(destination.images)) {
        imagesHtml = `
            <div class="card-images-container">
                ${destination.images.map((img, index) => `
                    <img src="${img}" alt="${destination.name} - Imagen ${index + 1}" class="card-image" onerror="this.src='https://via.placeholder.com/300x250?text=${encodeURIComponent(destination.name)}-${index + 1}'">
                `).join('')}
            </div>
        `;
    } else {
        // Fallback para formato antiguo
        imagesHtml = `<img src="${destination.imageUrl}" alt="${destination.name}" class="card-image" onerror="this.src='https://via.placeholder.com/400x300?text=${encodeURIComponent(destination.name)}'">`;
    }
    
    card.innerHTML = `
        ${imagesHtml}
        <div class="result-card-content">
            <h3>${destination.name}</h3>
            <p>${destination.description}</p>
            <div class="result-card-meta">
                <span>📍 ${destination.country}</span>
                <span>🕐 ${timeInfo}</span>
            </div>
        </div>
    `;
    
    return card;
}

// Filtrar destinos según el tipo de búsqueda
function filterDestinations(keyword) {
    // Palabras clave para cada tipo de destino
    const beachKeywords = ['playa', 'playas', 'beach', 'beaches', 'costa', 'mar', 'arena'];
    const templeKeywords = ['templo', 'templos', 'temple', 'temples', 'religioso', 'sagrado'];
    const countryKeywords = ['país', 'pais', 'países', 'country', 'ciudad', 'ciudad'];
    
    // Determinar el tipo de búsqueda
    let searchType = null;
    
    if (beachKeywords.some(kw => keyword.includes(kw))) {
        searchType = 'beach';
    } else if (templeKeywords.some(kw => keyword.includes(kw))) {
        searchType = 'temple';
    } else if (countryKeywords.some(kw => keyword.includes(kw))) {
        searchType = 'country';
    } else {
        // Búsqueda por nombre o descripción
        return allDestinations.filter(dest =>
            dest.name.toLowerCase().includes(keyword) ||
            dest.country.toLowerCase().includes(keyword) ||
            dest.description.toLowerCase().includes(keyword)
        );
    }
    
    // Filtrar por tipo de destino
    return allDestinations.filter(dest => dest.type === searchType);
}

// Mostrar resultados en la sección de resultados
function displayResults(results, keyword) {
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsTitle = document.getElementById('resultsTitle');
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `<div class="no-results">No se encontraron destinos para "${keyword}". Intenta con palabras clave como "playa", "templo" o "país".</div>`;
        resultsTitle.textContent = 'Resultados de Búsqueda';
        return;
    }
    
    resultsTitle.textContent = `Resultados para: "${keyword}" (${results.length} encontrados)`;
    resultsContainer.innerHTML = '';
    
    results.forEach(destination => {
        const card = createDestinationCard(destination);
        resultsContainer.appendChild(card);
    });
}

// Restablecer búsqueda
function resetSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = '';
    currentSearchKeyword = '';
    
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsTitle = document.getElementById('resultsTitle');
    
    resultsTitle.textContent = 'Recomendaciones de Viaje';
    displayAllDestinations();
    
    console.log('Búsqueda restablecida');
    showPage('home');
}

// Manejar Enter en el campo de búsqueda
function handleSearchKeypress(event) {
    if (event.key === 'Enter') {
        searchDestinations();
    }
}

// Navegar entre páginas
function showPage(pageId) {
    // Ocultar todas las páginas
    const allPages = document.querySelectorAll('.page-section');
    allPages.forEach(page => page.classList.remove('active'));
    
    // Mostrar la página seleccionada
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.add('active');
        console.log(`Página "${pageId}" mostrada`);
        
        // Scroll al principio
        window.scrollTo(0, 0);
    }
}

// Manejar envío del formulario de contacto
function submitContact(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    // Validación básica
    if (!name || !email || !message) {
        alert('Por favor, rellena todos los campos.');
        return;
    }
    
    // Registrar en consola (en un proyecto real se enviaría a un servidor)
    console.log('Formulario de contacto enviado:', {
        nombre: name,
        email: email,
        mensaje: message,
        fecha: new Date().toLocaleString('es-ES')
    });
    
    alert('¡Gracias por tu mensaje! Nos pondremos en contacto pronto.');
    document.querySelector('.contact-form').reset();
    showPage('home');
}

// Obtener la hora actual en la zona horaria del país
function getTimeInCountry(country) {
    const timeZones = {
        'Maldivas': 'Asia/Kolkata',
        'Polinesia Francesa': 'Pacific/Tahiti',
        'México': 'America/Mexico_City',
        'Camboya': 'Asia/Bangkok',
        'India': 'Asia/Kolkata',
        'Japón': 'Asia/Tokyo',
        'Francia': 'Europe/Paris',
        'Estados Unidos': 'America/New_York',
        'Tailandia': 'Asia/Bangkok'
    };
    
    const timeZone = timeZones[country];
    
    if (!timeZone) {
        return 'Zona horaria desconocida';
    }
    
    try {
        const options = {
            timeZone: timeZone,
            hour12: true,
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit'
        };
        
        const time = new Date().toLocaleTimeString('es-ES', options);
        return time;
    } catch (error) {
        console.error('Error al obtener hora:', error);
        return 'Hora no disponible';
    }
}

// Mostrar mensaje de error
function showErrorMessage(message) {
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = `<div class="no-results" style="color: #e74c3c;">${message}</div>`;
    showPage('results');
}

// Log inicial
console.log('Script de Travel Recommendation cargado correctamente');
