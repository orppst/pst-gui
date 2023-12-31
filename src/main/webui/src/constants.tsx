/* the maximum number of characters supported by the Postgres database for
any column which is set to type "VARCHAR". See
https://github.com/orppst/pst-gui/issues/21#issuecomment-1786943901 for
 more info.
 */

export const MAX_CHARS_FOR_INPUTS = 255;

/* the app header height*/
export const APP_HEADER_HEIGHT = 60;

/* the nav bar default sizes for base, md, lg */
export const NAV_BAR_DEFAULT_WIDTH = 300;
export const NAV_BAR_MEDIUM_WIDTH = 400;
export const NAV_BAR_LARGE_WIDTH = 450;

// the built-in delay before opening things.
export const OPEN_DELAY = 1000;

// built in close delay.
export const CLOSE_DELAY = 200;

// the default stroke used by labels.
export const STROKE = 1.5

// the default size of icons
export const ICON_SIZE = "2rem";

// the max number of columns on a page
export const MAX_COLUMNS = 12;

// the number of decimal places to display numbers
export const DEFAULT_DECIMAL_PLACE = 3;

// the number of rows a text area should use.
export const TEXTAREA_MAX_ROWS = 3;

// the default font weight for headers
export const HEADER_FONT_WEIGHT = 700;

// the default dimmed font weight
export const DIMMED_FONT_WEIGHT = 400;

/* the number of spaces used for indentation of json
* used during JSON.stringify */
export const JSON_SPACES = 2;

/* The source url for the aladin stuff.*/
export const ALADIN_SRC_URL =
    'https://aladin.u-strasbg.fr/AladinLite/api/v2/beta/aladin.min.js';

/* The source url for the aladin jquery */
export const JQUERY_SRC_URL = 'https://code.jquery.com/jquery-1.12.1.min.js';