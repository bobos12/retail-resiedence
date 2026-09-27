// Photo Sphere Viewer and its stylesheet, split into their own chunk: this module is only
// imported when a visitor presses "Enter 360°".
import '@photo-sphere-viewer/core/index.css';

export { Viewer } from '@photo-sphere-viewer/core';
export { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin';
export { GyroscopePlugin } from '@photo-sphere-viewer/gyroscope-plugin';
