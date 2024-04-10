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
}

/**
 * defines the type of the aladin builder from Javascript.
 *
 * @param {(id: string, config: IAladinConfig) => AladinType} aladin builds the
 * aladin system.
 * @param {(data: aladinCatalog) => any} catalog builds an aladin catalog.
 * @param {(data: AladinOverlay) => any} graphicOverlay builds an aladin
 * graphicOverlay.
 *
 */
export type AladinBuilderType = {
    aladin: (id: string, config: IAladinConfig) => AladinType;
    catalog: (data: aladinCatalog) => any;
    graphicOverlay:(data: AladinOverlay) => any;
}

/**
 * defines the type for the aladin catalog from the Javascript object.
 *
 * @param {string} name the name of the catalog.
 * @param {string} shape the shape of the catalog.
 * @param {number} sourceSize the size of sources in this catalog.
 */
export type aladinCatalog = {
    name: string;
    shape: string;
    sourceSize: number;
}

/**
 * defines the type of the aladin overlay from the javascript object.
 *
 * @param {string} color the color of the overlay.
 * @param {number} lineWidth how wide any lines in the overlay are.
 */
export type AladinOverlay = {
    color: string;
    lineWidth: number;
}

/**
 * defines the configuration types for aladin.
 *
 * @param {string | number[]} target the target coords to use.
 * @param {string} cooFrame the coordinate frame of the viewer.
 * @param {string} survey the survey name.
 * @param {number} fov the field of view value.
 * @param {boolean} showReticle bool indicating if the reticle is shown.
 * @param {boolean} showZoomControl bool indicating if the zoom control
 * should be shown.
 * @param {boolean} showLayersControl bool indicating if the layers control
 * should be shown.
 * @param {boolean} showGotoControl bool indicating if the goto control
 * should be shown.
 * @param {boolean} showShareControl bool indicating if the share control
 * should be shown.
 * @param {boolean} showFrame bool indicating if the frame should be shown.
 * @param {boolean} fullScreen bool indicating if the view is full screen.
 * @param {string} reticleColor the color of the reticle.
 * @param {number} reticleSizethe size of the reticle.
 * @param {boolean} showFullscreenControl bool indicating if the full screen
 * control should be shown.
 * @param {boolean} showCooGridControl bool indicating if the coo grid control
 * should be shown.
 */
export interface IAladinConfig {
    target?: string | number[];
    cooFrame: string;
    survey: string;
    fov: number;
    showReticle: boolean;
    showZoomControl: boolean;
    showLayersControl: boolean;
    showGotoControl: boolean;
    showShareControl: boolean;
    showFrame: boolean;
    fullScreen: boolean;
    reticleColor: string;
    reticleSize: number;
    showFullscreenControl: boolean;
    showCooGridControl: boolean;
}