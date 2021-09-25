import randomInteger from 'random-int';
import choices from 'random-choice';

// Interface/Types of data
export enum PhaseDifference {
  ZERO = 0,
  PIE = 1,
}

export enum Phase {
  ZERO = 0,
  PIE = 1,
}
// ============ Interface/Types end ===============

// Class to store the data for pulse emitted
export class Pulse {
  public sample: boolean;

  constructor(
    public quantumPart: QuantumPart,
    public time: number,
    public last = false
  ) {}
}

// Class to store the data for the quantum information attached with the pulse
export class QuantumPart {
  constructor(
    public phase: Phase,
    public phaseDifference: PhaseDifference,
    public isPhotonExist: boolean,
    public time: number
  ) {}

  toString() {
    return `${this.time}    phase - ${this.phase}    p_diff - ${this.phaseDifference}    photo - ${this.isPhotonExist}`;
  }
}

// Class to get the relative phase difference
// this have prev_phase property to remember the previous pulse phase
// then the prev_phase is compaired to the current phase
export class PhaseDiffDetector {
  private prev_phase: Phase;

  reset() {
    this.prev_phase = undefined;
  }

  detect(curr_phase: Phase): PhaseDifference {
    let phase_diff: PhaseDifference | undefined;

    if (this.prev_phase === undefined || curr_phase === undefined) {
      phase_diff = undefined;
    } else if (this.prev_phase === curr_phase) {
      phase_diff = PhaseDifference.ZERO;
    } else {
      phase_diff = PhaseDifference.PIE;
    }

    this.prev_phase = curr_phase;
    return phase_diff!;
  }
}

// Class to generate pulses
// with the random probability of the photon existence
// this takes a probability number e.g. 5, in every group of 5 pulses randomly, photon may exist whitin these 5 pulses
export class RandomPhotonGenerator {
  // couter counts the size of the pulse group within which photon may exist
  private counter: number = 1;

  // photonPos stores the postion within the pulses group at which photon will exist
  private photonPos: number;

  constructor(private distance: number = 10) {}

  reset() {
    this.counter = 1;
    this.photonPos = undefined;
  }

  // gets a random position at which photon will exist
  // position is within the given size of pulse group
  // e.g. 5, position will be between 1 - 5.
  private get_position() {
    this.photonPos = randomInteger(1, this.distance);
    return this.photonPos;
  }

  // method return random true/false value if photon should exsist or should not
  generate() {
    let emit = false;

    if (this.counter === 1) {
      this.get_position();
    }

    if (this.counter === this.photonPos) {
      emit = true;
    }

    if (this.counter === this.distance) {
      this.counter = 1;
    } else {
      this.counter += 1;
    }

    return emit;
  }
}

// Function used to randomly generate phases
export function randomPhase() {
  return choices([Phase.PIE, Phase.ZERO], [0.5, 0.5]);
}
