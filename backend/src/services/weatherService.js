const axios = require('axios');

/**
 * Obtiene el clima de OpenWeatherMap y lo clasifica en: 'soleado', 'nublado' o 'frio'.
 */
async function getWeatherState(lat, lng) {
  const apiKey = process.env.WEATHER_API_KEY;
  
  if (!apiKey || apiKey === 'your_openweather_api_key_here') {
    console.log("No Weather API key provided, simulating weather...");
    // Simular un clima aleatorio
    const states = ['soleado', 'nublado', 'frio'];
    return states[Math.floor(Math.random() * states.length)];
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
    const response = await axios.get(url);
    const data = response.data;
    
    const temp = data.main.temp;
    const weatherMain = data.weather[0].main.toLowerCase(); // ej: 'clear', 'clouds', 'rain'
    
    // Clasificación simplificada
    if (temp < 10) {
      return 'frio';
    } else if (weatherMain.includes('clear')) {
      return 'soleado';
    } else {
      return 'nublado'; // incluye lluvia, nubes, etc.
    }
  } catch (error) {
    console.error("Error fetching weather:", error.message);
    return 'nublado'; // fallback
  }
}

module.exports = {
  getWeatherState
};
