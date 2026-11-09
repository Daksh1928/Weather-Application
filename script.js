// OpenWeatherMap se apni valid key yahan daalein:
const API_KEY = "5e3cb83afcb65d108bfa39a77cfefdf6"; 
let currentCity = "Delhi";

const translations = {
  en: {
    langLabel: "Language:",
    searchBtn: "Search",
    placeholder: "Enter city name...",
    humidity: "Humidity",
    wind: "Wind Speed",
    feelsLike: "Feels Like",
    pressure: "Pressure",
    notFound: "City not found. Please check spelling.",
    invalidKey: "Invalid API Key. Using offline demo data.",
    loading: "Fetching weather...",
    geoError: "Location access denied or unavailable."
  },
  hi: {
    langLabel: "भाषा:",
    searchBtn: "खोजें",
    placeholder: "शहर का नाम दर्ज करें...",
    humidity: "नमी",
    wind: "हवा की गति",
    feelsLike: "महसूस तापमान",
    pressure: "दबाव",
    notFound: "शहर नहीं मिला। कृपया नाम जांचें।",
    invalidKey: "API Key अमान्य है। डेमो डेटा दिखाया जा रहा है।",
    loading: "मौसम विवरण प्राप्त हो रहा है...",
    geoError: "स्थान अनुमति अस्वीकृत या अनुपलब्ध।"
  },
  es: {
    langLabel: "Idioma:",
    searchBtn: "Buscar",
    placeholder: "Ingrese nombre de la ciudad...",
    humidity: "Humedad",
    wind: "Viento",
    feelsLike: "Sensación",
    pressure: "Presión",
    notFound: "Ciudad no encontrada.",
    invalidKey: "Clave API inválida.",
    loading: "Cargando clima...",
    geoError: "Acceso a la ubicación denegado."
  },
  fr: {
    langLabel: "Langue:",
    searchBtn: "Chercher",
    placeholder: "Entrez le nom de la ville...",
    humidity: "Humidité",
    wind: "Vitesse du vent",
    feelsLike: "Ressenti",
    pressure: "Pression",
    notFound: "Ville non trouvée.",
    invalidKey: "Clé API non valide.",
    loading: "Chargement...",
    geoError: "Accès à la localisation refusé."
  }
};

const langSelect = document.getElementById("langSelect");
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const geoBtn = document.getElementById("geoBtn");
const statusMessage = document.getElementById("statusMessage");
const weatherDisplay = document.getElementById("weatherDisplay");

function updateUILanguage(lang) {
  const dict = translations[lang] || translations.en;
  document.getElementById("langLabel").textContent = dict.langLabel;
  searchBtn.textContent = dict.searchBtn;
  cityInput.placeholder = dict.placeholder;
  document.getElementById("labelHumidity").textContent = dict.humidity;
  document.getElementById("labelWind").textContent = dict.wind;
  document.getElementById("labelFeelsLike").textContent = dict.feelsLike;
  document.getElementById("labelPressure").textContent = dict.pressure;
}

// Fallback generator agar API Key activate na ho
function generateMockWeather(cityName, lang) {
  const isHindi = lang === 'hi';
  return {
    name: cityName.charAt(0).toUpperCase() + cityName.slice(1),
    sys: { country: "IN" },
    main: {
      temp: 28,
      feels_like: 30,
      humidity: 58,
      pressure: 1012
    },
    weather: [
      {
        description: isHindi ? "साफ मौसम (डेमो)" : "Clear sky (Demo)",
        icon: "01d"
      }
    ],
    wind: { speed: 3.5 }
  };
}

async function fetchWeatherByCity(city, lang) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&lang=${lang}&appid=${API_KEY}`;
  await executeFetch(url, lang, city);
}

async function fetchWeatherByCoords(lat, lon, lang) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=${lang}&appid=${API_KEY}`;
  await executeFetch(url, lang, "Your Location");
}

async function executeFetch(url, lang, fallbackCityName) {
  const dict = translations[lang] || translations.en;
  statusMessage.textContent = dict.loading;
  statusMessage.style.color = "#ffffff";

  // Agar user ne API Key replace nahi ki hai:
  if (API_KEY === "YOUR_OPENWEATHERMAP_API_KEY" || !API_KEY) {
    statusMessage.textContent = dict.invalidKey;
    statusMessage.style.color = "#ffd166";
    const mockData = generateMockWeather(fallbackCityName, lang);
    renderWeather(mockData);
    currentCity = mockData.name;
    return;
  }

  try {
    const response = await fetch(url);
    
    // Status checks
    if (response.status === 401) {
      statusMessage.textContent = `${dict.invalidKey} (Error 401)`;
      statusMessage.style.color = "#ffd166";
      const mockData = generateMockWeather(fallbackCityName, lang);
      renderWeather(mockData);
      return;
    }

    if (response.status === 404) {
      statusMessage.textContent = dict.notFound;
      statusMessage.style.color = "#ff6b6b";
      weatherDisplay.classList.add("hidden");
      return;
    }

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    renderWeather(data);
    currentCity = data.name;
    statusMessage.textContent = "";
  } catch (error) {
    statusMessage.textContent = dict.notFound;
    statusMessage.style.color = "#ff6b6b";
    weatherDisplay.classList.add("hidden");
  }
}

function renderWeather(data) {
  document.getElementById("cityName").textContent = `${data.name}, ${data.sys.country || ""}`;
  document.getElementById("temperature").textContent = `${Math.round(data.main.temp)}°C`;
  document.getElementById("description").textContent = data.weather[0].description;
  document.getElementById("humidity").textContent = `${data.main.humidity}%`;
  document.getElementById("windSpeed").textContent = `${data.wind.speed} m/s`;
  document.getElementById("feelsLike").textContent = `${Math.round(data.main.feels_like)}°C`;
  document.getElementById("pressure").textContent = `${data.main.pressure} hPa`;

  const iconCode = data.weather[0].icon;
  document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  weatherDisplay.classList.remove("hidden");
}

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    fetchWeatherByCity(city, langSelect.value);
  }
});

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

langSelect.addEventListener("change", (e) => {
  const selectedLang = e.target.value;
  updateUILanguage(selectedLang);
  if (currentCity) {
    fetchWeatherByCity(currentCity, selectedLang);
  }
});

geoBtn.addEventListener("click", () => {
  const lang = langSelect.value;
  const dict = translations[lang] || translations.en;
  if (!navigator.geolocation) {
    statusMessage.textContent = dict.geoError;
    return;
  }
  statusMessage.textContent = dict.loading;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude, lang);
    },
    () => {
      statusMessage.textContent = dict.geoError;
    }
  );
});

// App init
updateUILanguage("en");
fetchWeatherByCity(currentCity, "en");