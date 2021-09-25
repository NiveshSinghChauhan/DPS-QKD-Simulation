import { ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import {
  AmbientLight,
  AnimationAction,
  AnimationMixer,
  Clock,
  DirectionalLight,
  LoopOnce,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  sRGBEncoding,
  WebGLRenderer,
} from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module';
import { Phase, PhaseDifference, Pulse } from 'src/sim/Pulse';

interface ModelDetectors {
  [PhaseDifference.PIE]: Mesh;
  [PhaseDifference.ZERO]: Mesh;
}
interface Props {
  emit: (fn: (pulse: Pulse) => void) => void;
  onEmit?: (value: any) => void;
}

export default function Model(props: Props): ReactElement {
  const [reRender, setReRender] = useState(false);

  // const controls = useRef(new OrbitControls());
  const containerRef = useRef<HTMLDivElement>();
  const scene = useRef(new Scene());
  const loader = useRef(new FBXLoader());
  const camera = useRef<PerspectiveCamera>();
  const mixer = useRef<AnimationMixer>();
  const clock = useRef(new Clock());
  const renderer = useRef(new WebGLRenderer({ antialias: true, alpha: true }));
  const gltfModel = useRef<any>();
  const animationActions = useRef<AnimationAction[]>([]);

  const detectors = useRef<ModelDetectors>();
  // const gui = useRef(new GUI());

  const photon = useRef<Mesh>();

  const resiveListner = (e: UIEvent): void => {
    // const canvas = renderer.current.domElement;
    camera.current.aspect =
      containerRef.current.clientWidth / containerRef.current.clientHeight;
    camera.current.updateProjectionMatrix();
    renderer.current.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
  };

  const gui = useMemo(() => new GUI(), []);

  useEffect(() => {
    window.addEventListener('resize', resiveListner);

    return () => {
      window.removeEventListener('resize', resiveListner);
    };
  }, []);

  useEffect(() => {
    scene.current.clear();

    renderer.current.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.current.setPixelRatio(window.devicePixelRatio);
    renderer.current.outputEncoding = sRGBEncoding;
    containerRef.current.appendChild(renderer.current.domElement);

    // camera
    camera.current = new PerspectiveCamera(
      30,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.current.position.set(-1, 3, 15);
    // camera.current.rotateX(-0.2);
    const cubeFolder = gui.addFolder('Rotation');
    cubeFolder.add(camera.current.rotation, 'x', Math.PI * -2, Math.PI * 2);
    const cameraFolder = gui.addFolder('Camera');
    cameraFolder.add(camera.current.position, 'x', -30, 30);
    cameraFolder.add(camera.current.position, 'y', -30, 30);
    cameraFolder.open();

    // Lights
    const ambient = new AmbientLight(0x404040, 0.8); // soft white light
    ambient.position.set(50, 50, 30);
    scene.current.add(ambient);

    const light = new DirectionalLight(0xffffff, 1);
    light.position.set(150, 200, 30);
    scene.current.add(light);

    // Loading the 3d Model here
    // We are loading fbx file using FBXLoader
    // But can load other files as well which is supported by 3d.js
    // https://threejs.org/docs/index.html#manual/en/introduction/Loading-3D-models
    loader.current.load(
      'Final_files.fbx',
      function (gltf) {
        console.log(gltf);

        gltfModel.current = gltf;
        const model = gltf;

        // Getting the animation from the model object
        const fileAnimations = gltf.animations;
        // // model.rotation.set(0, 4.5, 0);
        // scene.current.rotation.set(0.2, 4.7, 0);

        const led1 = model.getObjectByName('led1') as Mesh;
        const led2 = model.getObjectByName('led2') as Mesh;
        led1.material = (led1.material as MeshStandardMaterial).clone();
        led2.material = (led1.material as MeshStandardMaterial).clone();

        // Saving the detector led reference in detectors ref object
        detectors.current = {
          [PhaseDifference.PIE]: led1,
          [PhaseDifference.ZERO]: led2,
        };

        photon.current = model.getObjectByName('ball1') as Mesh;

        resetDetectorColor();
        // (led1.material as MeshStandardMaterial).color.setHex(0xfdd531);

        mixer.current = new AnimationMixer(model);
        fileAnimations.forEach(anim => {
          const action = mixer.current.clipAction(anim);
          action.clampWhenFinished = true;
          action.loop = LoopOnce;
          action.setDuration(4);
          animationActions.current.push(action);
          // action.paused = true;
        });

        scene.current.add(model);
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );

    animate();
    setReRender(!reRender);
    props.emit(emit);
    // renderer.current.render(scene.current, camera.current);
  }, []);

  function animate() {
    requestAnimationFrame(animate);

    if (mixer.current) {
      mixer.current.update(clock.current.getDelta());
    }
    renderer.current.render(scene.current, camera.current);
  }

  function resetDetectorColor() {
    // Reseting the photon ball color to default blue color
    (photon.current.material as MeshStandardMaterial).color.setRGB(
      0.03600001388788243,
      0.1241529006384745,
      0.800000011920929
    );

    // Reseting the detector color to yellow
    Object.values(detectors.current).forEach(detector => {
      (detector.material as MeshStandardMaterial).color.setStyle('yellow');
    });
  }

  function emit(pulse: Pulse) {
    // Reseting the previously set color of the detector color
    resetDetectorColor();

    // Playing the animation of the modal
    animationActions.current.forEach(action => {
      action.reset();
      action.play();
    });

    // Changing color of the photon ball after passing through the phase modulator
    // red color is the phase is PIE and green otherwise
    setTimeout(() => {
      (photon.current.material as MeshStandardMaterial).color.setStyle(
        pulse.quantumPart.phase === Phase.PIE ? 'red' : 'green'
      );
    }, 720);

    // Removing the finished listner after finishing the animation
    (mixer.current as any)._listeners?.finished.forEach(listnerFn => {
      mixer.current.removeEventListener('finished', listnerFn);
    });

    // Adding listner to call a method after finishing the animation
    mixer.current.addEventListener('finished', onEmitAnimationEnd(pulse));

    mixer.current.update(clock.current.getDelta());
  }

  const onEmitAnimationEnd = (pulse: Pulse) => e => {
    const activeDetector = detectors.current[pulse.quantumPart.phaseDifference];
    console.log(
      activeDetector?.name,
      pulse?.quantumPart.phaseDifference,
      pulse?.quantumPart.isPhotonExist,
      photon.current
    );

    // Changing the color of the detector based on the pulse phase difference property
    if (
      pulse.quantumPart.phaseDifference !== undefined &&
      pulse.quantumPart.isPhotonExist
    ) {
      (activeDetector.material as MeshStandardMaterial).color.setStyle('green');
    }
  };

  return (
    <div className='border border-black bg-white'>
      <div ref={containerRef} style={{ height: '40vh' }}></div>
      {/* <div className='flex gap-x-2 items-center mt-3 p-2'>
        {camera.current && (
          <div className='flex gap-x-3'>
            <div className='flex flex-col gap-x-1'>
              <label className='text-sm'>Camera Position</label>
              <CameraPosition
                initValue={{
                  x: camera.current.position.x,
                  y: camera.current.position.y,
                }}
                onChange={pos => {
                  camera.current.position.y = pos.y;
                  camera.current.position.x = pos.x;
                }}
              />
            </div>
          </div>
        )}
      </div> */}
    </div>
  );
}

interface Axis {
  x?: number;
  y?: number;
  z?: number;
}

function CameraRotate(props: {
  initValue: Axis;
  onChange: (value: Axis) => void;
}): ReactElement {
  const [cameraRotation, setCameraRotation] = useState<Axis>(props.initValue);

  return (
    <div className=''>
      <span className='flex gap-x-1'>
        <span>X: </span>
        <input
          type='range'
          min={0}
          max={Math.PI * 2}
          value={cameraRotation.x}
          onChange={e => {
            const value = e.target.value;
            const updatedPos = {
              ...cameraRotation,
              x: parseInt(value),
            };
            setCameraRotation(updatedPos);

            props.onChange(updatedPos);
          }}
        />
      </span>
      <span className='flex gap-x-1'>
        <span>Y: </span>
        <input
          type='range'
          min={0}
          max={Math.PI * 2}
          value={cameraRotation.y}
          onChange={e => {
            const value = e.target.value;
            const updatedPos = {
              ...cameraRotation,
              y: parseInt(value),
            };
            setCameraRotation(updatedPos);

            props.onChange(updatedPos);
          }}
        />
      </span>
    </div>
  );
}

function CameraPosition(props: {
  initValue: Axis;
  onChange: (value: Axis) => void;
}): ReactElement {
  const [cameraPosition, setCameraPosition] = useState<Axis>(props.initValue);

  return (
    <div>
      <span className='flex gap-x-1'>
        <span>X: </span>
        <input
          type='range'
          min={-30}
          max={30}
          value={cameraPosition.x}
          onChange={e => {
            const value = e.target.value;
            const updatedPos = {
              ...cameraPosition,
              x: parseInt(value),
            };
            setCameraPosition(updatedPos);

            props.onChange(updatedPos);
          }}
        />
      </span>
      <span className='flex gap-x-1'>
        <span>Y: </span>
        <input
          type='range'
          min={-30}
          max={30}
          value={cameraPosition.y}
          onChange={e => {
            const value = e.target.value;
            const updatedPos = {
              ...cameraPosition,
              y: parseInt(value),
            };
            setCameraPosition(updatedPos);

            props.onChange(updatedPos);
          }}
        />
      </span>
    </div>
  );
}
