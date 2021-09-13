import clsx from 'clsx';
import React, { ReactElement, useState } from 'react';
import { useSimulationContext } from '../context/simulationContext';
import * as objectPath from 'object-path-immutable';

interface Props {}

export default function PhotonDetection({}: Props): ReactElement {
  const [showAlicePhListOfGivenT, setShowAlicePhListOfGivenT] = useState(false);

  const { aliceEmittedPulses, bobDetedPulses, showSimSteps, setShowSimSteps } =
    useSimulationContext();

  return (
    <div className='border border-black p-2 bg-white'>
      <div className='flex items-baseline gap-x-3'>
        <h2 className='text-lg font-medium'>Photon Detection</h2>
        <button
          onClick={() => {
            setShowAlicePhListOfGivenT(true);
            setShowSimSteps(
              objectPath.set(showSimSteps, 'detectError', {
                show: true,
                open: true,
              })
            );
          }}
          className='p-2 px-3 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded  transition shadow-md'>
          share T with Alice
        </button>
      </div>
      <div className='mt-4 flex gap-x-3'>
        <div className='flex items-center gap-x-4 overflow-x-auto'>
          {!!bobDetedPulses && (
            <div
              className='overflow-auto inline-flex'
              style={{ width: '100%' }}>
              <table className='table-fixed w-full border-collapse '>
                {/* <thead></thead> */}
                <tbody>
                  <tr className='sticky top-0 bg-white border-b border-gray-400 border-solid'>
                    <th className='w-80'></th>
                    <th className='w-40 p-2 border border-gray-300 border-solid'>
                      Time
                    </th>
                    {bobDetedPulses?.slice(1).map(pulse => {
                      if (!pulse) {
                        return <></>;
                      }

                      return (
                        <th className='w-14 p-2 border text-center border-gray-300 border-solid'>
                          {pulse.quantumPart.time}
                        </th>
                      );
                    })}
                  </tr>
                  {/* <tr>
                        <td colSpan={1000000}>
                          <div className='flex gap-x-4 bg-gray-100 items-center justify-start'>
                            <h3 className='p-2 font-bold '>
                              Pulse detected by bob
                            </h3>
                          </div>
                        </td>
                      </tr> */}
                  <tr>
                    <th className='w-32 p-2 border border-gray-300 border-solid bg-gray-100'>
                      Pulse detected by bob
                    </th>
                    <th className='w-14 p-2 border border-gray-300 border-solid'>
                      Phase Difference
                    </th>
                    {bobDetedPulses ? (
                      bobDetedPulses?.slice(1).map(pulse => {
                        if (!pulse) {
                          return <></>;
                        }

                        return (
                          <td
                            className={clsx(
                              'w-14 p-2 border text-center font-semibold border-gray-300 border-solid'
                            )}>
                            {pulse.quantumPart.phaseDifference === 0
                              ? '0'
                              : 'π'}
                          </td>
                        );
                      })
                    ) : (
                      <td></td>
                    )}
                  </tr>
                  {showAlicePhListOfGivenT && (
                    <>
                      {/* <tr>
                            <td colSpan={1000000}>
                              <h3 className='p-2 font-bold bg-gray-100'>
                                Alice Pulses At T shared by bob
                              </h3>
                            </td>
                          </tr> */}
                      <tr>
                        <th className='w-32 p-2 border border-gray-300 border-solid bg-gray-100'>
                          Alice Pulses At T shared by bob
                        </th>
                        <th className='w-14 p-2 border border-gray-300 border-solid'>
                          Phase Difference
                        </th>
                        {aliceEmittedPulses ? (
                          aliceEmittedPulses
                            ?.filter(
                              ap => !!bobDetedPulses![ap.quantumPart.time]
                            )
                            .map(pulse => (
                              <td
                                className={
                                  'w-14 p-2 border text-center font-semibold border-gray-300 border-solid'
                                }>
                                {pulse.quantumPart.phaseDifference === 0
                                  ? '0'
                                  : 'π'}
                              </td>
                            ))
                        ) : (
                          <td></td>
                        )}
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
