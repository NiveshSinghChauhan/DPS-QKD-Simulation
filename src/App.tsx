import React, { useRef, useState } from 'react';
import './App.scss';
import {
  detectPulses,
  EmitRandom100,
  getSampleBits,
  Simulation,
} from './sim/Simulation';
import { Pulse } from './sim/Pulse';
import clsx from 'clsx';
import ErrorDetection from './steps/errorDetection';
import { useSimulationContext } from './context/simulationContext';
import KeyGeneration from './steps/keyGeneration';
import Model from './Model';
import PhotonDetection from './steps/photonDetection';

function App() {
  const {
    aliceEmittedPulses,
    bobDetedPulses,
    setAliceEmittedPulses,
    setBobDetedPulses,
    showSimSteps,
  } = useSimulationContext();

  const emitFnRef = useRef<(pulse: Pulse) => void>(() => {});
  const simulationRef = useRef(new Simulation());

  // const [alicePulseList, setAlicePulseList] = useState<Pulse[]>();
  // const [bobPulseList, setBobPulseList] = useState<Pulse[]>();

  const [showBobPhotonHitT, setShowBobPhotonHitT] = useState(false);
  const [showAlicePhListOfGivenT, setShowAlicePhListOfGivenT] = useState(false);

  const [showErrorSec, setShowErrorSec] = useState(false);

  // const [aliceSampleBits, setAliceSampleBits] = useState<Pulse[]>();
  // const [bobSampleBits, setBobSampleBits] = useState<Pulse[]>();

  // function emit100Pulse() {
  //   const aliceEmittedPulses = EmitRandom100();
  //   setAliceEmittedPulses(aliceEmittedPulses);

  //   const bobDetectedPulses = detectPulses(aliceEmittedPulses);
  //   const bobDetectedPulsesInFullTimeSpan = new Array(
  //     aliceEmittedPulses.length
  //   ).fill(undefined);

  //   bobDetectedPulses.forEach(pulse => {
  //     bobDetectedPulsesInFullTimeSpan[pulse.quantumPart.time] = pulse;
  //   });

  //   setBobDetedPulses(bobDetectedPulsesInFullTimeSpan);
  // }

  function emitPulses(pulses: Pulse[]) {
    const aliceEmittedPulses = pulses;
    setAliceEmittedPulses(aliceEmittedPulses);

    const bobDetectedPulses = detectPulses(aliceEmittedPulses);
    const bobDetectedPulsesInFullTimeSpan = new Array(
      aliceEmittedPulses.length
    ).fill(undefined);

    bobDetectedPulses.forEach(pulse => {
      bobDetectedPulsesInFullTimeSpan[pulse.quantumPart.time] = pulse;
    });

    setBobDetedPulses(bobDetectedPulsesInFullTimeSpan);
  }

  return (
    <div className='p-3'>
      <Model
        emit={fn => {
          emitFnRef.current = fn;
        }}
      />

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
        <button
          onClick={() => {
            const pulses = simulationRef.current.generatePulses();
            emitPulses(pulses);
          }}
          className='p-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition shadow-md'>
          Emit 100 pulses
        </button>
        {/* <button
          onClick={() => setShowBobPhotonHitT(!showBobPhotonHitT)}
          className='p-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition shadow-md'>
          show bob detected photon T
        </button> */}
        {/* <button
          onClick={() => checkForErrors()}
          className='p-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition shadow-md'>
          Check Errors
        </button> */}
      </div>

      {/* Photon Emitted list */}
      <div className='flex justify-between flex-col bg-white'>
        <div className='inline-block border border-black p-2 bg-white'>
          <div
            className='overflow-y-auto inline-flex'
            style={{ width: '100%' }}>
            <table className='table-fixed w-full border-collapse '>
              {/* <thead></thead> */}
              <tbody>
                <tr className='sticky top-0 bg-white border-b border-gray-400 border-solid'>
                  <th className='w-32'></th>
                  <th className='w-40 p-2 border border-gray-300 border-solid'>
                    Time
                  </th>
                  {aliceEmittedPulses?.length > 1 &&
                    aliceEmittedPulses
                      ?.slice(1)
                      .map(pulse => (
                        <td className='w-14 p-2 border text-center border-gray-300 border-solid'>
                          {pulse.quantumPart.time}
                        </td>
                      ))}
                </tr>
                <tr>
                  <th className='w-32 p-2 border border-gray-300 border-solid'>
                    Alice
                  </th>
                  <th className='w-14 p-2 border border-gray-300 border-solid'>
                    Phase Difference
                  </th>
                  {aliceEmittedPulses?.length > 1 ? (
                    aliceEmittedPulses
                      ?.slice(1)
                      .map(pulse => (
                        <td
                          className={clsx(
                            'w-14 p-2 border text-center font-semibold border-gray-300 border-solid',
                            bobDetedPulses![pulse.quantumPart.time] &&
                              'bg-green-100'
                          )}>
                          {pulse.quantumPart.phaseDifference === 0 ? '0' : 'π'}
                        </td>
                      ))
                  ) : (
                    <td></td>
                  )}
                </tr>
                <tr>
                  <th className='w-32 p-2 border border-gray-300 border-solid'>
                    Bob
                  </th>
                  <th className='w-14 p-2 border border-gray-300 border-solid'>
                    Phase Difference
                  </th>
                  {bobDetedPulses ? (
                    bobDetedPulses
                      ?.slice(1)
                      .map(pulse => (
                        <td
                          className={clsx(
                            'w-14 p-2 border text-center font-semibold border-gray-300 border-solid',
                            pulse && 'bg-green-100'
                          )}>
                          {pulse &&
                            (pulse.quantumPart.phaseDifference === 0
                              ? '0'
                              : 'π')}
                        </td>
                      ))
                  ) : (
                    <td></td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
          <div className='p-2 border-t border-gray-200 flex gap-x-10'>
            <span>
              Pulse Emitted By Alice -{' '}
              <span className='font-semibold'>
                {aliceEmittedPulses?.length}
              </span>
            </span>
            <span>
              Pulse Detected By Bob -{' '}
              <span className='font-semibold'>
                {bobDetedPulses?.filter(bp => !!bp).length}
              </span>
            </span>
          </div>
        </div>
      </div>
      {/* 
      <div className='flex justify-between items-start'>
        {showAlicePhListOfGivenT ? (
          <div className='rounded shadow-md inline-block border border-gray-200 mt-5 bg-white'>
            <h3 className='p-2 font-bold bg-gray-100 text-center'>
              Alice PD At T shared by bob
            </h3>
            <div
              className='overflow-y-auto inline-block  scrollbar scrollbar-thumb-gray-400 scrollbar-thin scrollbar-track-gray-50 scrollbar-thumb-rounded-md'
              style={{ height: '50vh', width: '100%' }}>
              <table className='table-fixed border-collapse'>
                <thead>
                  <tr className='sticky top-0 bg-white border-b border-gray-400 border-solid'>
                    <th className='w-12 p-2 border border-gray-300 border-solid'>
                      Time
                    </th>
                    <th className='w-36 p-2 border border-gray-300 border-solid'>
                      Phase Difference
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {aliceEmittedPulses
                    ?.filter(ap => !!bobDetedPulses![ap.quantumPart.time])
                    .map(pulse => (
                      <tr>
                        <td className='p-2 border text-center border-gray-300 border-solid'>
                          {pulse.quantumPart.time}
                        </td>
                        <td className='p-2 border text-center font-semibold border-gray-300 border-solid'>
                          {pulse.quantumPart.phaseDifference}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div></div>
        )}

        {showBobPhotonHitT ? (
          <div className='rounded shadow-md inline-block border border-gray-200 mt-5 bg-white'>
            <h3 className='p-2 font-bold bg-gray-100 text-center'>
              Pulse detected by bob
            </h3>
            <div
              className='overflow-y-auto inline-block  scrollbar scrollbar-thumb-gray-400 scrollbar-thin scrollbar-track-gray-50 scrollbar-thumb-rounded-md'
              style={{ height: '50vh' }}>
              <table className='table-fixed border-collapse '>
                <thead>
                  <tr className='sticky top-0 bg-white border-b border-gray-400 border-solid'>
                    <th className='w-12 p-2 border border-gray-300 border-solid'>
                      Time
                    </th>
                    <th className='w-36 p-2 border border-gray-300 border-solid'>
                      Phase Difference
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bobDetedPulses
                    ?.filter(bp => !!bp)
                    .map(pulse => (
                      <tr>
                        <td className='p-2 border text-center border-gray-300 border-solid'>
                          {pulse.quantumPart.time}
                        </td>
                        <td className='p-2 border text-center font-semibold border-gray-300 border-solid'>
                          {pulse.quantumPart.phaseDifference}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className='flex'>
              <button
                onClick={() => {
                  setShowAlicePhListOfGivenT(!showAlicePhListOfGivenT);
                  setShowErrorSec(true);
                }}
                className='p-3 bg-blue-500 text-white flex-grow m-3 rounded hover:bg-blue-600 transition shadow-md'>
                share T with Alice
              </button>
            </div>
          </div>
        ) : (
          <div></div>
        )}
      </div> */}

      {bobDetedPulses &&
        showSimSteps.photonsDetected.show &&
        showSimSteps.photonsDetected.open && (
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
