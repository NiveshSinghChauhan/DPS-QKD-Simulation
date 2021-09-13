import Icon from '@iconify/react';
import clsx from 'clsx';
import React, { ReactElement, useRef, useState } from 'react';
import { Pulse } from '../sim/Pulse';
import { compareBits, getSampleBits } from '../sim/Simulation';
import equalIcon from '@iconify/icons-mdi/equal';
import notEqualIcon from '@iconify/icons-mdi/not-equal';
import { useSimulationContext } from '../context/simulationContext';
import * as objectPath from 'object-path-immutable';

interface Props {
  alicePulseList: Pulse[];
  bobPulseList: Pulse[];
}

export default function ErrorDetection({
  alicePulseList,
  bobPulseList,
}: Props): ReactElement {
  const {
    aliceSamplePulses,
    bobSharedSamplePulses,
    setAliceSamplePulses,
    setBobSharedSamplePulses,
    setShowSimSteps,
    showSimSteps,
  } = useSimulationContext();

  const [aliceTPulses] = useState<Pulse[]>(bobPulseList.filter(bp => !!bp));
  const [areBitsSame, setAreBitsSame] = useState(false);
  const [sampleBitPer, setSampleBitPer] = useState(20);

  function getAliceSampleBits() {
    const aliceBits = getSampleBits(aliceTPulses, sampleBitPer / 100);
    setAliceSamplePulses(aliceBits);
    setBobSharedSamplePulses(undefined);
    setAreBitsSame(undefined);
    setShowSimSteps(
      objectPath.set(showSimSteps, 'generateKey', { show: false, open: false })
    );
  }

  function shareSampleBitTwithBob(sampleBitIndexes: number[]) {
    const bobBits = sampleBitIndexes.map(index => bobPulseList[index]);
    setBobSharedSamplePulses(bobBits);
  }

  function compareSampleBits(aliceBits: number[], bobBits: number[]) {
    const comparison = compareBits(aliceBits, bobBits);
    setAreBitsSame(comparison);
    setShowSimSteps(
      objectPath.set(showSimSteps, 'generateKey', { show: true, open: true })
    );
  }

  return (
    <div className='border border-black p-2 bg-white'>
      <div className='flex items-baseline gap-x-3'>
        <h2 className='text-lg font-medium'>Error Detection</h2>
        <div className='rounded shadow overflow-hidden bg-white flex gap-x-4 items-center p-1 mr-3'>
          <span className='text-sm'>Sample Percentage :</span>
          <span className='flex gap-x-2 items-center'>
            <input
              type='number'
              name='photonDetProb'
              value={sampleBitPer}
              min={1}
              max={100}
              className='border border-gray-400 -m-px p-1 w-14 rounded text-center'
              onChange={e => setSampleBitPer(parseInt(e.target.value))}
            />
            <span>%</span>
          </span>
        </div>
        <button
          disabled={aliceTPulses?.length < 10}
          onClick={() => getAliceSampleBits()}
          className={clsx(
            'p-2 px-3  text-white text-sm rounded  transition shadow-md',
            aliceTPulses?.length < 10
              ? ' bg-gray-400 cursor-not-allowed'
              : ' bg-blue-500 hover:bg-blue-600'
          )}>
          Get Sample Bits
        </button>

        {aliceTPulses?.length < 10 && (
          <span className='text-sm text-red-400'>
            Cannot generate sample bits from bit length {'<'} 10
          </span>
        )}
      </div>
      <div className='mt-4 flex gap-x-3'>
        {aliceSamplePulses && (
          <>
            <div className='border border-black'>
              <p className='p-1 text-center'>Sample Bits (Alice)</p>
              <div
                className='inline-grid'
                style={{ gridTemplateColumns: 'repeat(10, auto)' }}>
                {aliceSamplePulses?.map(bit => (
                  <div className={clsx('p-2')}>
                    {bit.quantumPart.phaseDifference}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() =>
                shareSampleBitTwithBob(aliceSamplePulses!.map(bit => bit.time))
              }
              className='p-3 bg-blue-500 text-white self-center m-3 rounded hover:bg-blue-600 transition shadow-md'>
              share with bob
            </button>
          </>
        )}
        {/* bob sample bits */}
        {bobSharedSamplePulses && (
          <>
            <div className='border border-black'>
              <p className='p-1 text-center'>
                Bit at smaples T shared by alice (Bob)
              </p>
              <div
                className='inline-grid'
                style={{ gridTemplateColumns: 'repeat(10, auto)' }}>
                {bobSharedSamplePulses.map(bit => (
                  <div className={clsx('p-2')}>
                    {bit.quantumPart.phaseDifference}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() =>
                compareSampleBits(
                  aliceSamplePulses.map(bit => bit.time),
                  bobSharedSamplePulses.map(bit => bit.time)
                )
              }
              className='p-3 bg-blue-500 text-white self-center m-3 rounded hover:bg-blue-600 transition shadow-md'>
              Compare both bits
            </button>
          </>
        )}
        {/* comparing bits */}
        {areBitsSame && (
          <div className='inline-flex gap-x-2 items-center border border-black p-2'>
            <div>
              <div
                className='inline-grid'
                style={{ gridTemplateColumns: 'repeat(10, auto)' }}>
                {aliceSamplePulses?.map(bit => (
                  <div key={bit.time} className={clsx('p-1')}>
                    {bit.quantumPart.phaseDifference}
                  </div>
                ))}
              </div>
              <span className='block text-center mt-1 text-sm'>Alice Bits</span>
            </div>
            <span className='text-2xl font-bold'>
              {areBitsSame ? (
                <Icon icon={equalIcon} />
              ) : (
                <Icon icon={notEqualIcon} />
              )}
            </span>
            <div>
              <div
                className='inline-grid'
                style={{ gridTemplateColumns: 'repeat(10, auto)' }}>
                {bobSharedSamplePulses.map(bit => (
                  <div key={bit.time} className={clsx('p-1')}>
                    {bit.quantumPart.phaseDifference}
                  </div>
                ))}
              </div>
              <span className='block text-center mt-1 text-sm'>Bob Bits</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
