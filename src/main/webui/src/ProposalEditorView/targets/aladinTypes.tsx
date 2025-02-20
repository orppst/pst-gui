/**
 * type guidance for the IDE for the Javascript Aladin object.
 *
 * @param {(ra: number, dec: number) => void}} gotoRaDec route aladin to
 * location.
 * @param {(data: any) => void} addCatalog adds a catalog to aladin.
 * @param {(data: any) => void} addOverlay adds an overlay to aladin.
 */
export type AladinType = {
    gotoRaDec: (ra: number, dec: number) => void;
    addCatalog: (data: any) => void;
    addOverlay: (data: any) => void;
    pix2world: (x: number, y: number) => number [];
    adjustFovForObject: (objectName: string) => void;
}
/**
 * defines the configuration types for aladin; default values in comments
 *
 *  see Aladin-lite documentation https://aladin.cds.unistra.fr/AladinLite/doc/API/
 */
export interface IAladinConfig {
    target?: string | number[]; // 0 +0 i.e., [0,0]
    cooFrame?: string; //'ICRS' | 'ICRSd' | 'galactic'; 'ICRS'
    survey?: string; // 'P/DSS2/color'
    fov?: number; // 60 (degrees)
    showReticle?: boolean; // true
    showCooGrid?: boolean; // false
    showCooGridControl?: boolean; // false
    projection?: string; //'SIN' | 'AIT' | 'MOL' | 'ARC' | 'TAN' | +<others>; 'SIN'
    showProjectionControl?: boolean; // true
    showZoomControl?: boolean; // true
    showFullscreenControl?: boolean; // true
    showLayersControl?: boolean; // true
    expandLayersControl?: boolean;// false
    showGotoControl?: boolean; // true
    showShareControl?: boolean; // false
    showSimbadPointerControl?: boolean; // false
    showContextMenu?: boolean; // false
    showFrame?: boolean; // true
    fullScreen?: boolean; // false
    reticleColor?: string; // "rgb(178, 50, 178)"
    reticleSize?: number; // 22 (pixels)
}