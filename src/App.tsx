import React, { useRef, useState } from 'react';
import './App.scss';
import { detectPulses, Simulation } from './sim/Simulation';
import { Pulse } from './sim/Pulse';
import ErrorDetection from './steps/errorDetection';
import { useSimulationContext } from './context/simulationContext';
import KeyGeneration from './steps/keyGeneration';
import Model from './Model';
import PhotonDetection from './steps/photonDetection';
import EmitPulse from './steps/emitPulse';

// Main App component function
function App() {
  // This is the SimulationContextProvider context
  const {
    aliceEmittedPulses,
    bobDetedPulses,
    setAliceEmittedPulses,
    setBobDetedPulses,
    showSimSteps,
    reset,
  } = useSimulationContext();

  // Reference to the simulation class
  const simulationRef = useRef(new Simulation());

  // Reference to the emit method from the model component
  // calling which start the model animation of photon emmition
  const emitFnRef = useRef<(pulse: Pulse) => void>(() => {});

  // These are state data of pulse count and existence of photon per pulse
  const [pulseCount, setPulseCount] = useState(1000);
  const [photonDetProb, setPhotonDetProb] = useState(5);

  // Method to generate data/information to mimic the pulse emittion
  // this is called whenever we want to emit n number of pulses
  function emitPulses(aliceEmittedPulses: Pulse[]) {
    // Update state of the simulation context
    setAliceEmittedPulses(aliceEmittedPulses);

    // Calls the "detectPulses" on "aliceEmittedPulses" to detect pulses with photon
    // And stored the detected pulses in an array with length = to total pulses emmitted by alice
    // with only indices at which photon is detected having pulse data
    // and all other are undefined
    const bobDetectedPulses = detectPulses(aliceEmittedPulses);
    const bobDetectedPulsesInFullTimeSpan = new Array(
      aliceEmittedPulses.length
    ).fill(undefined);
    bobDetectedPulses.forEach(pulse => {
      bobDetectedPulsesInFullTimeSpan[pulse.quantumPart.time] = pulse;
    });
    setBobDetedPulses(bobDetectedPulsesInFullTimeSpan);
  }

  // Methon is used to update photon existence probability per pulse
  // update the state and aslo the property value of the simulation class instance
  function onPhotonProbChange(e: React.ChangeEvent<HTMLInputElement>) {
    // parsing the value to int as the value of input is in string type
    const pulseProb = parseInt(e.target.value);
    setPhotonDetProb(pulseProb);
    simulationRef.current.setPhotonPerPulse(pulseProb);
  }

  return (
    <div className='p-3'>
      {/* 3D model representation of the protocol */}
      <Model
        emit={fn => {
          emitFnRef.current = fn;
        }}
      />

      {/* This is the control buttons block */}
      <div className='mb-4 mt-4 flex gap-x-6'>
        <button
          onClick={() => {
            const pulse = simulationRef.current.generateSinglePulse(
              aliceEmittedPulses?.length ?? 0
            );

            if (aliceEmittedPulses) {
              aliceEmittedPulses.push(pulse);
              emitPulses(aliceEmittedPulses);
            } else {
              emitPulses([pulse]);
            }
            emitFnRef.current(pulse);
          }}
          className='p-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition shadow-md'>
          Emit Single pulse
        </button>

        <div className='rounded shadow-md overflow-hidden'>
          <select
            className='p-3'
            name='pulseCount'
            value={pulseCount}
            onChange={e => setPulseCount(parseInt(e.target.value))}>
            <option value={100}>100 Pulses</option>
            <option value={200}>200 Pulses</option>
            <option value={400}>400 Pulses</option>
            <option value={600}>600 Pulses</option>
            <option value={1000}>1000 Pulses</option>
          </select>
          <button
            onClick={() => {
              const pulses = simulationRef.current.generatePulses(pulseCount);
              emitPulses(pulses);
            }}
            className='p-3 bg-blue-500 text-white hover:bg-blue-600 transition'>
            Emit
          </button>
        </div>

        <div className='rounded shadow-md overflow-hidden bg-white flex gap-x-4 items-center p-2'>
          <span className='font-semibold'>Photon Probability :</span>
          <span className='flex gap-x-2 items-center'>
            <span>1 /</span>
            <input
              type='number'
              name='photonDetProb'
              value={photonDetProb}
              className='border border-gray-400 -m-px p-1 w-14 rounded text-center'
              onChange={onPhotonProbChange}
            />
          </span>
        </div>
        <button
          onClick={() => {
            reset();
          }}
          className='p-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition shadow-md'>
          Reset
        </button>
      </div>

      {/* From here starts the protocol steps
          1.) Pulse Emittion.
          2.) Pulse Detection.
          3.) Error Correction.
          4.) Key generation.

          All the step hide/show on the basis of the control property of simulation context 
       */}

      {aliceEmittedPulses?.length && (
        <div className='mt-3'>
          <EmitPulse />
        </div>
      )}

      {showSimSteps.photonsDetected.show && showSimSteps.photonsDetected.open && (
        <div className='mt-3'>
          <PhotonDetection />
        </div>
      )}

      {showSimSteps.detectError.show && showSimSteps.detectError.open && (
        <div className='mt-3'>
          <ErrorDetection
            alicePulseList={aliceEmittedPulses!}
            bobPulseList={bobDetedPulses!}
          />
        </div>
      )}

      {showSimSteps.generateKey.show && showSimSteps.generateKey.open && (
        <div className='mt-3'>
          <KeyGeneration />
        </div>
      )}
    </div>
  );
}

export default App;
