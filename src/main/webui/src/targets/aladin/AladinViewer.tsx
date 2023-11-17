import { MouseEvent, ReactElement, useEffect } from 'react';
import PointingCanvas from './PointingCanvas.tsx';

// A is a global variable from aladin lite source code.
// It is declared for the typescript checker to understand it.
declare var A: any;

// the initial config for the aladin viewer.
const initialConfig = {
    cooFrame: 'ICRS',
    survey: 'P/DSS2/color',
    fov: 0.25,
    showReticle: true,
    showZoomControl: false,
    showLayersControl: true,
    showGotoControl: false,
    showShareControl: false,
    showFrame: false,
    fullScreen: false,
    reticleColor: 'rgb(178, 50, 178)',
    reticleSize: 22,
};

/**
 * the main entrance for the aladin viewer.
 *
 * @return {React.ReactElement} the dynamic html for the aladin viewer.
 * @constructor
 */
export default function AladinViewer(): ReactElement {

    const LoadScriptIntoDOM = (bodyElement: HTMLElement, url: string, onloadCallback?: () => void) => {
        const scriptElement = document.createElement('script');
        scriptElement.setAttribute('src', url);
        scriptElement.async = false;
        if (onloadCallback) {
            scriptElement.onload = onloadCallback;
        }

        bodyElement.appendChild(scriptElement);
    }


    useEffect(() => {
        // Now the component is mounted we can load aladin lite.
        const bodyElement = document.getElementsByTagName('BODY')[0] as HTMLElement;
        // jQuery is a dependency for aladin-lite and therefore must be inserted in the DOM.
        LoadScriptIntoDOM(bodyElement, 'http://code.jquery.com/jquery-1.12.1.min.js');
        // Then we load the aladin lite script.
        LoadScriptIntoDOM(bodyElement, 'http://aladin.u-strasbg.fr/AladinLite/api/v2/beta/aladin.min.js', () => {
            // When the import has succeded we store the aladin js instance into its component
            const aladin = A.aladin('#aladin-lite-div', {
                survey: 'P/DSS2/color',
                fov: 60
            });
            const catalogue = A.catalog({
                name: 'Pointing Catalogue',
                shape: 'cross',
                sourceSize: 20,
            });
            aladin.addCatalog(catalogue);
            const overlay = A.graphicOverlay({
                color: '#009900',
                lineWidth: 3
            });
            aladin.addOverlay(overlay);
        })
    });

    /**
     * handles the different mouse event types.
     * @param {React.MouseEvent<HTMLInputElement>} event the event that occurred.
     */
    const handleEvent = (event: MouseEvent<HTMLInputElement>) => {
        switch (event.type) {
            case "mousemove":
                break;
            case "mouseleave":
                break;
            default:
                console.log(`not caught type ${event.type}`);
                break;
        }
    }

    // generate the html.
    return (
        <>
            <PointingCanvas/>
            <div id="aladin-lite-div"
                onMouseMove={handleEvent}
                onMouseLeave={handleEvent}>
            </div>
        </>
    );
}