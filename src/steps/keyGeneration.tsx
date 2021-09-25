import clsx from 'clsx';
import React, { ReactElement, useMemo, useState } from 'react';
import { useSimulationContext } from '../context/simulationContext';
import { Pulse } from '../sim/Pulse';
import { Remote } from 'electron';
// import { writeFileSync } from 'original-fs';
import { chunk } from 'lodash';
import saveIcon from '@iconify/icons-mdi/content-save-outline';
import Icon from '@iconify/react';
import isElectron from 'is-electron';

let remote: Remote, writeFileSync;

if (isElectron()) {
  remote = require('electron').remote;

  console.log(isElectron());

  writeFileSync = require('fs').writeFileSync;
}

interface Props {}

export default function KeyGeneration({}: Props): ReactElement {
  // states to store the key values generateo by alice and bob
  const [aliceKey, setAliceKey] = useState<Pulse[]>();
  const [bobKey, setBobKey] = useState<Pulse[]>();

  // accessing the simulation context data
  const {
    aliceEmittedPulses,
    bobDetedPulses,
    aliceSamplePulses,
    bobSharedSamplePulses,
  } = useSimulationContext();

  // Memoizing the bobKey?.filter((k: any) => !k.sample) compute
  const validKeys = useMemo(
    () => bobKey?.filter((k: any) => !k.sample),
    [bobKey]
  );

  // Method to generate the keys for both parties (alice, bob)
  function generateKey() {
    // getting the time T pulses at which bob detects photon
    const availablePulses = bobDetedPulses
      .filter(bit => !!bit)
      .map(bit => [bit.time, bit] as readonly [number, Pulse]);

    // Getting the key for alice and bob
    const _aliceKey = getKeyFor(new Map(availablePulses), [
      ...aliceSamplePulses,
    ]);
    const _bobKey = getKeyFor(new Map(availablePulses), [
      ...bobSharedSamplePulses,
    ]);

    // storing the keys in their respecitve state properties
    setAliceKey(_aliceKey);
    setBobKey(_bobKey);
  }

  // Method to export the key in a .txt file
  async function saveKeyToFile() {
    if (!isElectron()) {
      alert(
        'Save key option will only work in electron environment not in browser!'
      );
      return;
    }
    // Getting the path where to create the file and with which name
    const file = await remote.dialog.showSaveDialog({
      title: 'Save Key',
      defaultPath: 'keyFile.txt',
      buttonLabel: 'Save',
      properties: ['showOverwriteConfirmation'],
    });
    // if user has not canceled the dialog
    // we writes the file to the provided path
    if (!file.canceled) {
      writeFileSync(
        file.filePath,
        // grouping the key bits in to 10 bits in a line
        chunk(validKeys, 10)
          .map(chunk => chunk.map(b => b.quantumPart.phaseDifference).join(''))
          .join('\n')
      );

      // Showing success dialog
      await remote.dialog.showMessageBox({
        message: 'Key File is successfully saved.',
        type: 'info',
        detail: `Your file is successfully saved at ${file.filePath}`,
        title: 'Success',
      });
    }
  }

  // method to generate key from the detected pulse data
  function getKeyFor(availableBits: Map<number, Pulse>, sampleBits: Pulse[]) {
    // Setting the smaple flag to true for the all the pulse used as sample bit in error detection
    // To make these sample look different in UI
    sampleBits.forEach(bit => {
      bit.sample = true;
      availableBits.set(bit.time, bit);
    });

    // Returning only the bit list from the map object
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
        {aliceKey?.length && (
          <button
            onClick={() => saveKeyToFile()}
            className='p-2 px-3 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition shadow-md flex items-center relative pl-9'>
            <Icon icon={saveIcon} className='left-3 absolute text-base' />{' '}
            <span>Save Key</span>
          </button>
        )}
      </div>
      <div className='mt-4 flex gap-x-3 p-2 justify-evenly flex-wrap gap-y-3'>
        {aliceKey && bobKey && (
          <>
            <div>
              <div
                className='inline-grid gap-1'
                style={{ gridTemplateColumns: 'repeat(20, auto)' }}>
                {aliceKey?.map((bit: any) => (
                  <div
                    key={bit.time}
                    className={clsx(
                      'p-2 leading-none',
                      bit.sample && 'bg-red-200 rounded'
                    )}>
                    {bit.quantumPart.phaseDifference}
                  </div>
                ))}
              </div>
              <span className='block text-center mt-1 text-sm'>
                Alice key ({validKeys.length} Bits)
              </span>
            </div>
            <div>
              <div
                className='inline-grid gap-1'
                style={{ gridTemplateColumns: 'repeat(20, auto)' }}>
                {bobKey.map((bit: any) => (
                  <div
                    key={bit.time}
                    className={clsx(
                      'p-2 leading-none',
                      bit.sample && 'bg-red-200 rounded'
                    )}>
                    {bit.quantumPart.phaseDifference}
                  </div>
                ))}
              </div>
              <span className='block text-center mt-1 text-sm'>
                Bob Key ({validKeys.length} Bits)
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
