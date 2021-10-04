# Differential Phase Shift Quantum Key Distribution (DPS-QKD)

This application shows the general working of the DPS-QKD protocol with the 3D model representation.
Which has been proposed and developed at NTT and Osaka University, which utilizes a coherent pulse train instead of individual photons as in traditional QKD protocols such as BB84.

This application is created using the javascript desktop framework [electron.js](https://www.electronjs.org/) and for the GUI [react](https://reactjs.org/) is used.

## Prerequisite

- [Node.js](https://nodejs.org/) == 12.22.1
- npm == 6.14.12

## How to run the application in dev mode

1. Install the dependecies for the application
   `npm install`
2. To run the GUI
   `npm start`

The application will run on [http://localhost:3000](http://localhost:3000).
The page will reload if you make edits.
You will also see any lint errors in the console.

## How to build Desktop Application

### Prerequisites

- Install required npm dependencies using `npm install`

After fullfilling the prerequisites run this commmand to build destop application `npm run build:electron:dist`

Application will be compiled in the **_electron_dist_** folder

## 3D Model

3d Model is in the [public\qkdModel3d.fbx](public/qkdModel3d.fbx)
Its is build in the [Maya](https://www.autodesk.com/products/maya) and exported as FBX file

## How Simulation Works

[SIMULATION_WOKRING.md](SIMULATION_WORKING.md)

## References

- https://www.st-andrews.ac.uk/physics/quvis/simulations_html5/sims/BB84_photons/BB84_photons.html
- https://www.ntt-review.jp/archive/ntttechnical.php?contents=ntr201109fa8.html
- https://www.youtube.com/watch?v=rwJGbOiZeCo
- https://www.st-andrews.ac.uk/physics/quvis/simulations_html5/sims/Mach_Zehnder_PhaseShifter/Mach_Zehnder_PhaseShifter.html

## Author

- Nivesh Singh Chauhan
- Rahul Choudahry

## Github

https://github.com/NiveshSinghChauhan/DPS-QKD-Simulation
