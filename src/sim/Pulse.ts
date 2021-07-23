import randomInteger from 'random-int';
import choices from 'random-choice';

export enum PhaseDifference {
  ZERO = 0,
  PIE = 1,
}

export enum Phase {
  ZERO = 0,
  PIE = 1,
}

export class Pulse {
  constructor(
    public quantumPart: QuantumPart,
    public time: number,
    public last = false
  ) {}
}

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

export class RandomPhotonGenerator {
  private counter: number = 1;
  private photonPos: number;

  constructor(private distance: number = 10) {}

  reset() {
    this.counter = 1;
    this.photonPos = undefined;
  }

  private get_position() {
    this.photonPos = randomInteger(1, this.distance);
    return this.photonPos;
  }
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

export function randomPhase() {
  return choices([Phase.PIE, Phase.ZERO], [0.5, 0.5]);
}

// export function randomPhoton() {
//   return choices([true, false], [0.1, 0.9]);
// }
