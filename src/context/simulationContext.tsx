import React, { ReactChild, useContext, useState } from 'react';
import { createContext } from 'react';
import { Pulse } from '../sim/Pulse';

// Interface/types
interface ISimulationContext {
  aliceEmittedPulses: Pulse[];
  bobDetedPulses: Pulse[];
  aliceSamplePulses: Pulse[];
  bobSharedSamplePulses: Pulse[];
  setAliceEmittedPulses: (pulses: Pulse[]) => void;
  setBobDetedPulses: (pulses: Pulse[]) => void;
  setAliceSamplePulses: (pulses: Pulse[]) => void;
  setBobSharedSamplePulses: (pulses: Pulse[]) => void;
  showSimSteps: SimulationStepsVisibility;
  setShowSimSteps: (showStep: SimulationStepsVisibility) => void;
  reset: () => void;
}

interface StepVisibility {
  show: boolean;
  open: boolean;
}

interface SimulationStepsVisibility {
  emittedPulses: StepVisibility;
  photonsDetected: StepVisibility;
  detectError: StepVisibility;
  generateKey: StepVisibility;
}
export interface ISimulationContextProviderProps {
  children: ReactChild;
}
// Interface/types end =================================

// this is the initialization of the simulation context
// which is then provided to the component using its provider component
const simulationContext = createContext<ISimulationContext>(null);

// using we can access the simulation context in the component
// if the component is direct or indirect child of "SimulationContextProvider"
export const useSimulationContext = () => useContext(simulationContext);

// Simulation context provider component
// which provides the context object to all its children
// via "useSimulationContext"
export function SimulationContextProvider(
  props: ISimulationContextProviderProps
) {
  // State object that stores the emitted pulses by ALICE
  const [aliceEmittedPulses, setAliceEmittedPulses] =
    useState<ISimulationContext['aliceEmittedPulses']>(null);

  // State object that stores the detected pulses by BOB
  const [bobDetedPulses, setBobDetedPulses] =
    useState<ISimulationContext['bobDetedPulses']>(null);

  // State object that stores the samples pulses that ALICE choose randomly
  const [aliceSamplePulses, setAliceSamplePulses] =
    useState<ISimulationContext['aliceSamplePulses']>(null);

  // State object that stores the pulses that is shared to BOB
  const [bobSharedSamplePulses, setBobSharedSamplePulses] =
    useState<ISimulationContext['bobSharedSamplePulses']>(null);

  // Initial Simulation Visibility object
  const initialSimStepVisibility = {
    emittedPulses: {
      open: false,
      show: false,
    },
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
  };

  // State object that track which step is open and if it is allowed to show
  // when emit pulse button is clicked pulse is emitted
  // and we make emitPulse section open and allowed to be shown
  const [showSimSteps, setShowSimSteps] = useState<SimulationStepsVisibility>(
    initialSimStepVisibility
  );

  // This method reset all the data to initial values
  function reset() {
    setAliceEmittedPulses(null);
    setBobDetedPulses(null);
    setAliceSamplePulses(null);
    setBobSharedSamplePulses(null);
    setShowSimSteps(initialSimStepVisibility);
  }

  // SimulationContext Provider which is responsible to provide the value as context to its children
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
        reset,
      }}>
      {props.children}
    </simulationContext.Provider>
  );
}
