import {MouseEvent} from 'react';


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
 * Seems to work well. I think its meant to try to coords in the
 * aladin view off the browser view.
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