import {
  PhaseDiffDetector,
  Pulse,
  QuantumPart,
  randomPhase,
  RandomPhotonGenerator,
} from './Pulse';
import { randomIntList } from 'random-int-list';
import { toInteger, uniq } from 'lodash';

// export function EmitRandom100(pulseCount = 1000) {
//   const pulseList: Pulse[] = [];

//   const phaseDiffDetector = new PhaseDiffDetector();
//   const photonGenerator = new RandomPhotonGenerator();

//   for (let i = 0; i < pulseCount; i++) {
//     const phase = randomPhase();
//     const phase_diff = phaseDiffDetector.detect(phase);
//     const photon = photonGenerator.generate();

//     const pulse = new Pulse(
//       new QuantumPart(phase, phase_diff, photon, i),
//       i,
//       i === pulseCount - 1
//     );

//     pulseList.push(pulse);
//   }

//   return pulseList;
// }

// Function used to detect or filter the pulses that photons
export function detectPulses(pulseList: Pulse[]) {
  // const detectedPulseList: Pulse[] = [];

  // pulseList.forEach(pulse => {
  //   if (pulse.quantumPart.isPhotonExist) {
  //     detectedPulseList.push(pulse);
  //   }
  // });

  return pulseList.filter(pulse => pulse.quantumPart.isPhotonExist);
}

// Function used to get random sample bits for the error checking

export function getSampleBits(pulses: Pulse[], percent = 0.2) {
  const smapleBitPercentage = pulses.length * percent ?? 0.2;

  // If the smapleBitPercentage comes < 1 then we use 1 sample bit
  const smapleBitLength =
    smapleBitPercentage < 1 ? 1 : toInteger(smapleBitPercentage);

  // get the list sample indecies of the size smapleBitLength
  // we are passing the randomIntList result through uniq method
  // because randomIntList method sometimes have duplicate indices
  // therefore passing it throug uniq methods returns all the unique indecies
  const sampleIndecies = uniq(
    randomIntList(smapleBitLength, 0, pulses.length - 1)
  );

  const sampleBits: Pulse[] = [];
  sampleIndecies.forEach(index => sampleBits.push(pulses[index]));
  sampleBits.sort((a, b) => a.time - b.time);
  return sampleBits;
}

// Used to compare 2 list of numbers
export function compareBits(a: number[], b: number[]) {
  return a.join() === b.join();
}

// This is the main Simulation class
// which stores all the data to run the simulation
// This together with the smiulation context is used to run the simulation application
export class Simulation {
  private photonPerPulse = 5;
  private pulseCount = 1000;

  private phaseDiffDetector = new PhaseDiffDetector();
  private photonGenerator = new RandomPhotonGenerator(this.photonPerPulse);

  generatePulses(pulseCount = this.pulseCount) {
    this.reset();
    const pulseList: Pulse[] = [];

    for (let i = 0; i < pulseCount; i++) {
      const phase = randomPhase();
      const phase_diff = this.phaseDiffDetector.detect(phase);
      const photon = this.photonGenerator.generate();

      const pulse = new Pulse(
        new QuantumPart(phase, phase_diff, photon, i),
        i,
        i === pulseCount - 1
      );

      pulseList.push(pulse);
    }

    return pulseList;
  }

  generateSinglePulse(time: number) {
    const phase = randomPhase();
    const phase_diff = this.phaseDiffDetector.detect(phase);
    const photon = this.photonGenerator.generate();

    const pulse = new Pulse(
      new QuantumPart(phase, phase_diff, photon, time),
      time,
      false
    );

    return pulse;
  }

  setPhotonPerPulse(photonNum: number) {
    this.photonPerPulse = photonNum;
    this.photonGenerator = new RandomPhotonGenerator(photonNum);
  }

  setPulseCount(count: number) {
    this.pulseCount = count;
  }

  private reset() {
    this.phaseDiffDetector.reset();
    this.photonGenerator.reset();
  }
}
