import clsx from 'clsx';
import React, { ReactElement, useState } from 'react';
import { useSimulationContext } from 'src/context/simulationContext';
import * as objectPath from 'object-path-immutable';

interface Props {}

// This is only used to display the emitted pulses in a table
export default function EmitPulse(props: Props): ReactElement {
  const { aliceEmittedPulses, bobDetedPulses, setShowSimSteps, showSimSteps } =
    useSimulationContext();

  const [showPhaseDiff, setShowPhaseDiff] = useState(false);
  const [showEmitBobBtn, setShowEmitBobBtn] = useState(false);

  return (
    <div className='flex justify-between flex-col  border border-black p-2 bg-white'>
      <div className='flex items-baseline gap-x-3'>
        <h2 className='text-lg font-medium'>Emitted Photon</h2>
        {aliceEmittedPulses?.length > 1 && (
          <button
            onClick={() => {
              setShowPhaseDiff(true);
              setShowEmitBobBtn(true);
            }}
            className='p-2 px-3 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded  transition shadow-md'>
            Calculate Phase Difference
          </button>
        )}
        {showEmitBobBtn && (
          <button
            onClick={() => {
              setShowSimSteps(
                objectPath.set(showSimSteps, 'photonsDetected', {
                  show: true,
                  open: true,
                })
              );
            }}
            className='p-2 px-3 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded  transition shadow-md'>
            Emit to Bob
          </button>
        )}
      </div>
      <div className='mt-4 inline-block bg-white'>
        <div className='overflow-y-auto inline-flex' style={{ width: '100%' }}>
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
              <tr className='sticky top-0 bg-white border-b border-gray-400 border-solid'>
                <th className='w-32'></th>
                <th className='w-40 p-2 border border-gray-300 border-solid'>
                  Phase
                </th>
                {aliceEmittedPulses?.length > 1 &&
                  aliceEmittedPulses
                    ?.slice(1)
                    .map(pulse => (
                      <td
                        className={clsx(
                          'w-14 p-2 border text-center font-semibold border-gray-300 border-solid',
                          bobDetedPulses![pulse.quantumPart.time] &&
                            'bg-green-100'
                        )}>
                        {pulse.quantumPart.phase}
                      </td>
                    ))}
              </tr>
              {showPhaseDiff && (
                <>
                  {' '}
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
                            {pulse.quantumPart.phaseDifference === 0
                              ? '0'
                              : 'π'}
                          </td>
                        ))
                    ) : (
                      <td></td>
                    )}
                  </tr>
                  {/* <tr>
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
                  </tr> */}
                </>
              )}
            </tbody>
          </table>
        </div>
        <div className='p-2 border-t border-gray-200 flex gap-x-10'>
          <span>
            Pulse Emitted By Alice -{' '}
            <span className='font-semibold'>{aliceEmittedPulses?.length}</span>
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
  );
}
