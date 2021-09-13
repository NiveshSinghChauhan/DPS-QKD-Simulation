import React, { ReactChild, useContext, useState } from 'react';
import { createContext } from 'react';
import { Pulse } from '../sim/Pulse';

interface ISimulationContext {
  aliceEmittedPulses: Pulse[];
  bobDetedPulses: Pulse[];
  aliceSamplePulses: Pulse[];
  bobSharedSamplePulses: Pulse[];
  setAliceEmittedPulses: (pulses: Pulse[]) => void;
  setBobDetedPulses: (pulses: Pulse[]) => void;
  setAliceSamplePulses: (pulses: Pulse[]) => void;
  setBobSharedSamplePulses: (pulses: Pulse[]) => void;
  // currentStep: SimulationStep;
  // setCurrentStep: (step: SimulationStep) => void;
  showSimSteps: SimulationStepsVisibility;
  setShowSimSteps: (showStep: SimulationStepsVisibility) => void;
}

// export enum SimulationStep {
//   emitPhotons,
//   detectError,
//   generateKey,
// }

interface StepVisibility {
  show: boolean;
  open: boolean;
}

interface SimulationStepsVisibility {
  photonsDetected: StepVisibility;
  detectError: StepVisibility;
  generateKey: StepVisibility;
}

const simulationContext = createContext<ISimulationContext>(null);

export const useSimulationContext = () => useContext(simulationContext);

export interface ISimulationContextProviderProps {
  children: ReactChild;
}

export function SimulationContextProvider(
  props: ISimulationContextProviderProps
) {
  const [aliceEmittedPulses, setAliceEmittedPulses] =
    useState<ISimulationContext['aliceEmittedPulses']>(null);
  const [bobDetedPulses, setBobDetedPulses] =
    useState<ISimulationContext['bobDetedPulses']>(null);

  const [aliceSamplePulses, setAliceSamplePulses] =
    useState<ISimulationContext['aliceSamplePulses']>(null);

  const [bobSharedSamplePulses, setBobSharedSamplePulses] =
    useState<ISimulationContext['bobSharedSamplePulses']>(null);

  // const [currentStep, setCurrentStep] = useState<SimulationStep>();

  const [showSimSteps, setShowSimSteps] = useState<SimulationStepsVisibility>({
    photonsDetected: {
      open: false,
      show: false,
    },
    detectError: {
      open: false,
      show: false,
    },
    generateKey: {
      open: false,
      show: false,
    },
  });

  return (
    <simulationContext.Provider
      value={{
        aliceEmittedPulses,
        aliceSamplePulses,
        bobDetedPulses,
        bobSharedSamplePulses,
        setAliceEmittedPulses,
        setAliceSamplePulses,
        setBobDetedPulses,
        setBobSharedSamplePulses,
        // currentStep,
        // setCurrentStep,
        showSimSteps,
        setShowSimSteps,
      }}>
      {props.children}
    </simulationContext.Provider>
  );
}
