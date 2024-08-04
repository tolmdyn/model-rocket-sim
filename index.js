// ===================== Display ===================

function populateResultsTable(results) {
  const tableBody = document.querySelector('#resultsTable tbody');
  tableBody.innerHTML = '';

  results.forEach(result => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${result.time.toFixed(1)}</td>
      <td>${result.drag.toFixed(6)}</td>
      <td>${result.netForce.toFixed(6)}</td>
      <td>${result.mass.toFixed(6)}</td>
      <td>${result.acceleration.toFixed(6)}</td>
      <td>${result.velocity.toFixed(6)}</td>
      <td>${result.altitude.toFixed(6)}</td>
    `;
    tableBody.appendChild(row);
  });
}

function displayMaxAltitude(simulation) {
  const result = simulation.getMaxAltitude();
  const maxAltitudeElement = document.getElementById('maxAltitude');
  maxAltitudeElement.textContent = `Max altitude: ${result.max.toFixed(2)} meters at time: ${result.time.toFixed(1)} seconds`;
}

// ===================== Chart ===================

const commonDatasetConfig = {
  borderColor: 'rgba(75, 192, 192, 1)', 
  backgroundColor: 'rgba(75, 192, 192, 0.2)', 
  borderWidth: 2, 
  pointRadius: 0, 
  tension: 0.1 
};

function createDataset(label, data, color) {
  return {
    ...commonDatasetConfig,
    label: label,
    data: data,
    borderColor: color,
    backgroundColor: color.replace('1)', '0.4)')
  };
}

var chart;

function updateChart(results) {
  const times = results.map(result => result.time);
  const altitudes = results.map(result => result.altitude);
  const velocities = results.map(result => result.velocity);
  const accelerations = results.map(result => result.acceleration);

  const altitudeDataset = createDataset('Altitude (m)', altitudes, 'rgba(75, 192, 192, 1)');
  const velocityDataset = createDataset('Velocity (m/s)', velocities, 'rgba(255, 99, 132, 1)');
  const accelerationDataset = createDataset('Acceleration (m/s²)', accelerations, 'rgba(250, 200, 90, 1)'); 

  const ctx = document.getElementById('resultsChart');

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: times,
      datasets: [altitudeDataset, velocityDataset, accelerationDataset]
    },
    options: {
      responsive: false,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Time (s)'
          },
          type: 'linear',
          ticks: {
            callback: function (value) {
              return value.toFixed(0);
            },
            stepSize: 1,
          }
        },
        y: {
          title: {
            display: true,
            text: 'Results' 
          },
          beginAtZero: true 
        }
      }
    }
  });
}

// ===========================

function updateSimulation() {
  // Get the parameters from the form
  const form = document.getElementById('parametersForm');
  
  const rocketConfig = {
      diameter: parseFloat(form.elements['diameter'].value),
      mass: parseFloat(form.elements['mass'].value),
      massCase: parseFloat(form.elements['massCase'].value),
      impulse: parseFloat(form.elements['impulse'].value),
      thrust: parseFloat(form.elements['thrust'].value),
      dragCoefficient: parseFloat(form.elements['dragCoefficient'].value),
      ejectionDelay: parseFloat(form.elements['ejectionDelay'].value),
      chuteDiameter: parseFloat(form.elements['chuteDiameter'].value),
      propellantMass: parseFloat(form.elements['propellantMass'].value),
  };

  const simConfig = {
      timestep: parseFloat(form.elements['timestep'].value),
      gravity: parseFloat(form.elements['gravity'].value),
      maxTimesteps: parseInt(form.elements['maxTimesteps'].value, 10),
  };

  
  let rocket = new Rocket(rocketConfig);
  let simulation = new RocketSimulation({ rocket, ...simConfig });

  simulation.simulate();

  populateResultsTable(simulation.results);
  displayMaxAltitude(simulation);
  updateChart(simulation.results);
}

// =======================================================================================

document.addEventListener('DOMContentLoaded', () => {
  updateSimulation();
});
