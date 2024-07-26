
class Rocket {
  constructor(parameters) {
    this.diameter = parameters.diameter;  // rocket diameter (D)
    this.mass = parameters.mass;          // rocket mass (Mr)
    this.massCase = parameters.massCase;  // estes motor mass (0.0107 or 0.01442) (Mc)
    this.impulse = parameters.impulse;    // (I)
    this.thrust = parameters.thrust;      // (Ft)
    this.dragCoefficient = parameters.dragCoefficient; // (Cd)
    this.ejectionDelay = parameters.ejectionDelay;     // (tc)
    this.chuteDiameter = parameters.chuteDiameter;     // (ChD)
    this.propellantMass = parameters.propellantMass   // 

    // Calculated properties
    this.burnTime = this.impulse / this.thrust;        // Estimate burn time (tb)
    this.massDecrement = this.propellantMass / this.burnTime; // Compute mass decrement (dM)
    this.bodyArea = Math.PI * Math.pow(this.diameter, 2) / 4;  // Area of rocket body (A)
    this.chuteArea = Math.PI * Math.pow(this.chuteDiameter, 2) / 4;  // Area of chute (ChA)
  }

  calculate_thrust(time) {
    if (time < this.burnTime) {
      return this.thrust;
    } else {
      return 0;
    }
  }

  calculate_drag(time, velocity, altitude) {
    const airDensity = 1.22 * Math.pow(0.9, altitude / 1000); // Air density decreases with altitude
    const area = (time < this.burnTime + this.ejectionDelay) ? this.bodyArea : Math.max(this.bodyArea, this.chuteArea);
    return 0.5 * airDensity * this.dragCoefficient * area * Math.sign(velocity) * Math.pow(velocity, 2);
  }

  update_mass(time) {
    // update mass loss due to fuel consumption
    if (time < this.burnTime) {
      return this.mass + this.massCase + this.propellantMass - this.massDecrement * time;
    } else {
      return this.mass + this.massCase;
    }
  }
}

class RocketSimulation {
  constructor(parameters) {
    this.rocket = parameters.rocket;  // The rocket object to sim
    this.timestep = parameters.timestep;          // Time Step (dt)
    this.gravity = parameters.gravity;            // Gravity (g)
    this.maxTimesteps = parameters.maxTimesteps;        // Size of simulation: simulation time is dt * mAS 

    // Array to store simulation frame steps as objects
    this.results = [];
  }

  simulate() {
    let time = 0;
    let prevAltitude = 0;
    let prevVelocity = 0;

    const landingThreshold = 5;
    let consecutiveZeroAltitudeCount = 0;

    for (let idx = 0; idx < this.maxTimesteps; idx++) {
      time = idx * this.timestep;
      let mass = this.rocket.update_mass(time);
      let thrust = this.rocket.calculate_thrust(time);
      let drag = this.rocket.calculate_drag(time, prevVelocity, prevAltitude);
      let netForce = thrust - drag - mass * this.gravity;
      let acceleration = netForce / mass;
      let velocity = prevVelocity + acceleration * this.timestep;
      let newAltitude = prevAltitude + velocity * this.timestep + 0.5 * acceleration * Math.pow(this.timestep, 2);

      // If the new altitude is below ground level, set it to 0
      if (newAltitude < 0) {
        newAltitude = 0;
        velocity = 0;
        acceleration = 0;
      }

      // Store results
      this.results.push({
        time: time,
        drag: drag,
        netForce: netForce,
        mass: mass,
        acceleration: acceleration,
        velocity: velocity,
        altitude: newAltitude,
      });

      // Check if the altitude has been zero for the last `landingThreshold` iterations
      if (newAltitude === 0) {
        consecutiveZeroAltitudeCount++;
      } else {
        consecutiveZeroAltitudeCount = 0;
      }

      if (consecutiveZeroAltitudeCount >= landingThreshold) {
        break;
      }

      // Update previous values for next iteration
      prevAltitude = newAltitude;
      prevVelocity = velocity;
    }
  }

  getMaxAltitude() {
    if (this.results.length === 0) {
      return -1; // error
    }

    let imax = 0;
    let ymax = this.results[0].altitude;

    for (let i = 1; i < this.results.length; i++) {
      if (this.results[i].altitude > ymax) {
        imax = i;
        ymax = this.results[i].altitude;
      }
    }
    // console.log(`Max altitude: ${ymax} At time: ${imax / 10}`);
    return { max: ymax, time: this.results[imax].time };
  }

  printMaxAltitude() {
    const result = simulation.getMaxAltitude();
    console.log(`Max altitude: ${result.max} at time: ${result.time}`);
  }

  printResults() {
    this.results.forEach(result => {
      console.log(`t: ${(result.time).toFixed(1)}, Fd: ${(result.drag).toFixed(6)}, F: ${(result.netForce).toFixed(6)}, M: ${(result.mass).toFixed(6)}, Acc: ${(result.acceleration).toFixed(6)}, Vel: ${(result.velocity).toFixed(6)}, Alt: ${(result.altitude).toFixed(6)}`);
    });
  }
}

// ========================== Usage ==============================

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

// simulation.printResults();
// simulation.printMaxAltitude();