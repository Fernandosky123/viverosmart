/**
 * recommendationEngine.js
 * Motor de reglas que cruza el estado del suelo con el clima para generar recomendaciones.
 */

function generateRecommendation(soilState, weatherState) {
  let message = '';
  let urgencyLevel = 'info'; // 'info', 'advertencia', 'critico'

  // Normalizar
  const soil = soilState.toLowerCase();
  const weather = weatherState.toLowerCase();

  // Reglas de negocio
  if (soil === 'seco') {
    if (weather === 'soleado') {
      message = 'Urgente: La planta está seca y hace sol. Regar inmediatamente.';
      urgencyLevel = 'critico';
    } else if (weather === 'nublado') {
      message = 'La planta está seca. Regar pronto, aunque no hay sol directo.';
      urgencyLevel = 'advertencia';
    } else if (weather === 'frio') {
      message = 'La planta está seca, pero hace frío. Regar moderadamente para evitar congelamiento de raíces.';
      urgencyLevel = 'info';
    }
  } else if (soil === 'media') {
    if (weather === 'soleado') {
      message = 'Humedad adecuada. El sol ayudará al crecimiento. Vigilar nivel de agua al final del día.';
      urgencyLevel = 'info';
    } else if (weather === 'nublado') {
      message = 'Humedad y clima estables. Podría beneficiarse de más luz si es posible.';
      urgencyLevel = 'info';
    } else if (weather === 'frio') {
      message = 'Humedad media y clima frío. No regar por ahora para evitar retención excesiva.';
      urgencyLevel = 'info';
    }
  } else if (soil === 'mojado') {
    if (weather === 'soleado') {
      message = 'Exceso de agua, pero el sol ayudará a evaporarla. No regar más.';
      urgencyLevel = 'advertencia';
    } else if (weather === 'nublado') {
      message = 'Demasiada agua y poca evaporación. Asegúrate de que la maceta drene bien.';
      urgencyLevel = 'advertencia';
    } else if (weather === 'frio') {
      message = 'Peligro: Exceso de agua en clima frío puede pudrir las raíces. Proteger la planta y mejorar drenaje.';
      urgencyLevel = 'critico';
    }
  } else {
    message = 'Estados desconocidos. No se puede generar recomendación.';
  }

  return { message, urgencyLevel };
}

module.exports = {
  generateRecommendation,
};
