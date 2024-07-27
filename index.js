



// Log to console:
// simulation.printResults();
// simulation.printMaxAltitude();

// ===================== Display ===================

function populateResultsTable(results) {
  const tableBody = document.querySelector('#resultsTable tbody');
  tableBody.innerHTML = ''; // Clear existing data

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
  borderColor: 'rgba(75, 192, 192, 1)', // Default line color
  backgroundColor: 'rgba(75, 192, 192, 0.2)', // Default fill color
  borderWidth: 2, // Line thickness
  pointRadius: 0, // Hide points
  tension: 0.1 // Smooth line
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
  const velocityDataset = createDataset('Velocity (m/s)', velocities, 'rgba(255, 99, 132, 1)'); // Different color
  const accelerationDataset = createDataset('Acceleration (m/s²)', accelerations, 'rgba(250, 200, 90, 1)'); // Different color

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
            text: 'Results' // Y-axis title
          },
          beginAtZero: true // Start Y-axis at zero
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

// =======================================================================================
// // Old config params

// const simConfig = {
//   timestep: 0.1,
//   gravity: 9.8,
//   maxTimesteps: 1000,
// }

// const rocketConfig = {
//   diameter: 0.035306,
//   mass: 0.106,
//   massCase: 0.01442,
//   impulse: 9,
//   thrust: 6,
//   dragCoefficient: 0.75,
//   ejectionDelay: 7,
//   chuteDiameter: 0.3,
//   propellantMass: 0.01248,
// }

// let rocket = new Rocket(rocketConfig);
// let simulation = new RocketSimulation({ rocket, ...simConfig });

// simulation.simulate();

// populateResultsTable();
// displayMaxAltitude();
// updateChart(simulation.results);