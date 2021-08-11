import React, { ReactElement, useEffect, useRef, useState } from 'react';
import {
  AmbientLight,
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  BoxGeometry,
  Clock,
  DirectionalLight,
  LoopOnce,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  RectAreaLight,
  Scene,
  SpotLight,
  sRGBEncoding,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module';
import { PhaseDiffDetector, PhaseDifference, Pulse } from 'src/sim/Pulse';

interface Props {
  emit: (fn: (pulse: Pulse) => void) => void;
  onEmit?: (value: any) => void;
}

export default function Model(props: Props): ReactElement {
  const [reRender, setReRender] = useState(false);

  // const controls = useRef(new OrbitControls());
  const containerRef = useRef<HTMLDivElement>();
  const scene = useRef(new Scene());
  const loader = useRef(new GLTFLoader());
  const camera = useRef<PerspectiveCamera>();
  const mixer = useRef<AnimationMixer>();
  const clock = useRef(new Clock());
  const renderer = useRef(new WebGLRenderer({ antialias: true, alpha: true }));
  const gltfModel = useRef<GLTF>();
  const animationActions = useRef<AnimationAction[]>([]);

  const detectors = useRef<{
    [PhaseDifference.PIE]: Mesh;
    [PhaseDifference.ZERO]: Mesh;
  }>();
  // const gui = useRef(new GUI());

  const photon = useRef<Object3D>();

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
    camera.current.position.set(-1, 2, 7);
    camera.current.rotateX(-0.2)

    // Lights
    const ambient = new AmbientLight(0x404040, 0.8); // soft white light
    ambient.position.set(50, 50, 30);
    scene.current.add(ambient);

    const light = new DirectionalLight(0xffffff, 1);
    light.position.set(150, 200, 30);
    scene.current.add(light);

    loader.current.load(
      'lazer2.glb',
      function (gltf) {
        console.log(gltf);

        gltfModel.current = gltf;
        const model = gltf.scene;
        model.children[2].visible = false;
        const fileAnimations = gltf.animations;
        // model.rotation.set(0, 4.5, 0);
        scene.current.rotation.set(0.2, 4.7, 0);

        const led1 = model.getObjectByName('led1') as Mesh;
        const led2 = model.getObjectByName('led2') as Mesh;
        led1.material = (led1.material as MeshStandardMaterial).clone();
        led2.material = (led1.material as MeshStandardMaterial).clone();

        detectors.current = {
          [PhaseDifference.PIE]: led1,
          [PhaseDifference.ZERO]: led2,
        };

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

        photon.current = model.children[15];
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
    Object.values(detectors.current).forEach(detector => {
      (detector.material as MeshStandardMaterial).color.setStyle('yellow');
    });
  }

  function emit(pulse: Pulse) {
    resetDetectorColor();

    animationActions.current.forEach(action => {
      action.reset();
      action.play();
    });

    (mixer.current as any)._listeners?.finished.forEach(listnerFn => {
      mixer.current.removeEventListener('finished', listnerFn);
    });

    mixer.current.addEventListener('finished', onEmitAnimationEnd(pulse));

    mixer.current.update(clock.current.getDelta());
  }

  const onEmitAnimationEnd = (pulse: Pulse) => e => {
    const activeDetector = detectors.current[pulse.quantumPart.phaseDifference];
    console.log(
      activeDetector?.name,
      pulse?.quantumPart.phaseDifference,
      pulse?.quantumPart.isPhotonExist
    );

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
      <div className='flex gap-x-2 items-center mt-3 p-2'>
        {/* <button
          // onClick={() => emit(new Pulse(new))}
          className='p-2 bg-blue-600 text-white rounded'>
          Run Photon Simulation
        </button> */}

        {camera.current && (
          <div className='flex flex-col gap-x-1'>
            <label className='text-sm'>CameraPositionX</label>
            <CameraPositionX
              initValue={{ x: camera.current.position.x }}
              onChange={pos => {
                camera.current.position.x = pos.x;
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function CameraPositionX(props: {
  initValue: { x: number };
  onChange: (value: { x: number }) => void;
}): ReactElement {
  const [cameraPosition, setCameraPosition] = useState<{ x: number }>(
    props.initValue
  );

  return (
    <input
      type='range'
      min={-1}
      max={20}
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
  );
}
