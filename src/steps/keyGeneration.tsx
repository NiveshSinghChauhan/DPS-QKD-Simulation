import clsx from 'clsx';
import React, { ReactElement, useState } from 'react';
import { useSimulationContext } from '../context/simulationContext';
import { Pulse } from '../sim/Pulse';

interface Props {}

export default function KeyGeneration({}: Props): ReactElement {
  const [aliceKey, setAliceKey] = useState<Pulse[]>();
  const [bobKey, setBobKey] = useState<Pulse[]>();

  const {
    aliceEmittedPulses,
    bobDetedPulses,
    aliceSamplePulses,
    bobSharedSamplePulses,
  } = useSimulationContext();

  function generateKey() {
    const availablePulses = bobDetedPulses
      .filter(bit => !!bit)
      .map(bit => [bit.time, bit] as readonly [number, Pulse]);

    console.log(availablePulses.length, aliceSamplePulses);
    const _aliceKey = getKeyFor(new Map(availablePulses), [
      ...aliceSamplePulses,
    ]);
    const _bobKey = getKeyFor(new Map(availablePulses), [
      ...bobSharedSamplePulses,
    ]);

    setAliceKey(_aliceKey);
    setBobKey(_bobKey);
  }

  function getKeyFor(availableBits: Map<number, Pulse>, sampleBits: Pulse[]) {
    sampleBits.forEach(bit => {
      availableBits.delete(bit.time);
    });

    return Array.from(availableBits.values());
  }

  return (
    <div className='border border-black p-2 bg-white'>
      <div className='flex items-baseline gap-x-3'>
        <h2 className='text-lg font-medium'>Key Generation</h2>
        <button
          onClick={() => generateKey()}
          className='p-2 px-3 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition shadow-md'>
          Generate Key
        </button>
      </div>
      <div className='mt-4 flex gap-x-3'>
        {aliceKey && bobKey && (
          <div className='inline-flex gap-x-5 items-center p-2'>
            <div>
              <div
                className='inline-grid'
                style={{ gridTemplateColumns: 'repeat(20, auto)' }}>
                {aliceKey?.map(bit => (
                  <div key={bit.time} className={clsx('p-1')}>
                    {bit.quantumPart.phaseDifference}
                  </div>
                ))}
              </div>
              <span className='block text-center mt-1 text-sm'>Alice key</span>
            </div>
            <div>
              <div
                className='inline-grid'
                style={{ gridTemplateColumns: 'repeat(20, auto)' }}>
                {bobKey.map(bit => (
                  <div key={bit.time} className={clsx('p-1')}>
                    {bit.quantumPart.phaseDifference}
                  </div>
                ))}
              </div>
              <span className='block text-center mt-1 text-sm'>Bob Key</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
