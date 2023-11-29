import { MouseEvent } from 'react';
import {
    AladinBuilderType,
    AladinType,
    IAladinConfig
} from './aladinTypes.tsx';

// A is a global variable from aladin lite source code.
// It is declared for the typescript checker to understand it.
declare var A: AladinBuilderType;

/**
 * code swiped from stack overflow which loads the javascript into the
 * React HTML.
 * @param {HTMLElement} bodyElement the main body of the html.
 * @param {string} url the url where the javascript is located.
 * @param {() => void} onloadCallback the callback once the script has
 * been loaded.
 * @constructor
 */
export const LoadScriptIntoDOM = (
    bodyElement: HTMLElement, url: string,
    onloadCallback?: () => void) => {
    const scriptElement = document.createElement("script");
    scriptElement.setAttribute('src', url);
    scriptElement.async = false;
    if (onloadCallback) {
        scriptElement.onload = onloadCallback;
    }
    bodyElement.appendChild(scriptElement);
}

/**
 * gets some form of offset. Swiped from the NGOT source code.
 *
 * @param {MouseEvent} event the mouse event that contains a drag.
 */
export const GetOffset = (event: MouseEvent): number[] => {
    let el: HTMLElement = event.target as HTMLElement;
    let x = 0;
    let y = 0;

    while (el && !Number.isNaN(el.offsetLeft) &&
    !Number.isNaN(el.offsetTop)) {
        x += el.offsetLeft - el.scrollLeft;
        y += el.offsetTop - el.scrollTop;
        el = el.offsetParent as HTMLElement;
    }

    x = event.clientX - x;
    y = event.clientY - y;

    return [x, y];
}

/**
 * builds the aladin instance.
 *
 * @param {IAladinConfig} initialConfig the configuration data.
 * @return {AladinType} the aladin instance.
 * @constructor
 */
export const PopulateAladin = (initialConfig: IAladinConfig): AladinType => {
    // When the import has succeeded we store the aladin js instance
    // into its component
    const Aladin: AladinType = A.aladin('#aladin-lite-div', initialConfig);

    // add the catalog.
    const catalogue = A.catalog({
        name: 'Pointing Catalogue',
        shape: 'cross',
        sourceSize: 20,
    });

    // is not null, created from javascript.
    Aladin.addCatalog(catalogue);

    // add the overlay.
    const overlay = A.graphicOverlay({
        color: '#009900',
        lineWidth: 3
    });

    // is not null, created from javascript.
    Aladin.addOverlay(overlay);

    return Aladin;
}