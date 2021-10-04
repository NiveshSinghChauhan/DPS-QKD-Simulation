# Simulation Methods Explaination

React GUI is controlled using the [simulationContext](src/context/simulationContext.tsx#L38) which is provided in the application using the [useSimulationContext](src/context/simulationContext.tsx#42) hook. Other then this there's a [Simulation](src/sim/Simulation.ts#L78) class which is used to simulate pulse generation and tracks the data related to pulse generation.

simulation context has respective properties

|Poperty Name           |Description |
|-----------------------|------------|
|aliceEmittedPulses     |Stores the pulses list emitted by ALICE|
|bobDetedPulses         |Stores the pulses list that are detected by BOB|
|aliceSamplePulses      |Stores samples bits that are randomly selected from the detected pulses list|
|bobSharedSamplePulses  |Stores the BOB bits values at time (T) share by ALICE|
|showSimSteps           |Contains emittedPulses, photonsDetected, detectError, generateKey properties which all has show, open flags which controls the visibility of the simulation setps |

## Methods and Classes

### Random phase Method <small>[visit](src/sim/Pulse.ts#L115)

It is used to generate random phase values for this [random-choice](https://www.npmjs.com/package/random-choice) package is used.

``` ts
function randomPhase() {
    return choices([Phase.PIE, Phase.ZERO], [0.5, 0.5]);
}
```

### Phase Difference Detector Class <small>[visit](src/sim/Pulse.ts#L44)

It is used to detect the relative phase difference between T<sup>th</sup> and (T-1)<sup>th</sup> pulse phase.
To achieve this we have store the (T-1)<sup>th</sup> pulse phase and compare it with T<sup>th</sup> pulse phase

``` ts
class PhaseDiffDetector {
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
```

### Random Photon Generator Class <small>[visit](src/sim/Pulse.ts#L70)

It is used to used to randomly put photon in the pulses while it is been generated. There is some probability (i.e. 1 out of 5 pulse) factor based on which photon may or may not exist. To achieve this we count the max pulses within which single photon can exist, after max count is reached reset this counter. At every 1 count value we randomly decide the photon position b/w 1 and max pulse count at which pulse will exist. We use [random-int
](https://www.npmjs.com/package/random-int) to get the random position value within the given range.
*Default probability is 1 out of 10 pulses*

``` ts
class RandomPhotonGenerator {
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
```

### Sample Bit Generator Method <small>[visit](src/sim/Simulation.ts#L49)

This method selects the bits at random index (T). We use [random-int-list](https://www.npmjs.com/package/random-int-list) package to select random indices. *Default sample bit percentage is 20%*

``` ts
function getSampleBits(pulses: Pulse[], percent = 0.2) {
  const smapleBitPercentage = pulses.length * percent ?? 0.2;

  const smapleBitLength =
    smapleBitPercentage < 1 ? 1 : toInteger(smapleBitPercentage);

  const sampleIndecies = uniq(
    randomIntList(smapleBitLength, 0, pulses.length - 1)
  );

  const sampleBits: Pulse[] = [];
  sampleIndecies.forEach(index => sampleBits.push(pulses[index]));
  sampleBits.sort((a, b) => a.time - b.time);
  return sampleBits;
}
```

### Simulation Class <small>[visit](src/sim/Simulation.ts#L78)</small>

This class combines the PhaseDiffDetector,RandomPhotonGenerator and gives methods to easily control the pulse genereation methods. The methods it provides are **generatePulses** , generateSinglePulse, setPhotonPerPulse, setPulseCount

|Method                 |Description|
|-----------------------|-----------|
|generatePulses         |Generates pulses of given counts|
|generateSinglePulse    |Generates single pulse and append it to the existing pulses list|
|setPhotonPerPulse      |Updates the *photonPerPulse* property|
|setPulseCount          |Updates the *pulseCount* property|

``` ts
class Simulation {
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
```
