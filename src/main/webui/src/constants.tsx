/* the maximum number of characters supported by the Postgres database for
any column which is set to type "VARCHAR". See
https://github.com/orppst/pst-gui/issues/21#issuecomment-1786943901 for
 more info.
 */
// constant used to indicate no row has been selected.
// eslint-disable-next-line react-refresh/only-export-components
export const NO_ROW_SELECTED = -1;

/*the expected size of a table before adding a scroll bar. Aims to show 5.5
 rows. */
// eslint-disable-next-line react-refresh/only-export-components
export const TABLE_SCROLL_HEIGHT = 200;

/* enforced min width needed by scrollable containers. */
// eslint-disable-next-line react-refresh/only-export-components
export const TABLE_MIN_WIDTH = 500;

/* color used when a table is in select mode */
// eslint-disable-next-line react-refresh/only-export-components
export const TABLE_HIGH_LIGHT_COLOR = 'var(--mantine-color-blue-light)';

// eslint-disable-next-line react-refresh/only-export-components
export const MAX_CHARS_FOR_INPUTS = 255;

// eslint-disable-next-line react-refresh/only-export-components
export const MAX_CHARS_FOR_JUSTIFICATION = 3072;

/* the app header height*/
// eslint-disable-next-line react-refresh/only-export-components
export const APP_HEADER_HEIGHT = 60;

/* the nav bar default sizes for base, md, lg */
// eslint-disable-next-line react-refresh/only-export-components
export const NAV_BAR_DEFAULT_WIDTH = 300;

// eslint-disable-next-line react-refresh/only-export-components
export const NAV_BAR_MEDIUM_WIDTH = 400;

// eslint-disable-next-line react-refresh/only-export-components
export const NAV_BAR_LARGE_WIDTH = 450;

// the built-in delay before opening things.
// eslint-disable-next-line react-refresh/only-export-components
export const OPEN_DELAY = 1000;

// built in close delay.
// eslint-disable-next-line react-refresh/only-export-components
export const CLOSE_DELAY = 200;

// the default stroke used by labels.
// eslint-disable-next-line react-refresh/only-export-components
export const STROKE = 1.5

// the default size of icons
// eslint-disable-next-line react-refresh/only-export-components
export const ICON_SIZE = "2em";

// the max number of columns on a page
// eslint-disable-next-line react-refresh/only-export-components
export const MAX_COLUMNS = 12;

// the number of decimal places to display numbers
// eslint-disable-next-line react-refresh/only-export-components
export const DEFAULT_DECIMAL_PLACE = 3;

// the number of rows a text area should use.
// eslint-disable-next-line react-refresh/only-export-components
export const TEXTAREA_MAX_ROWS = 3;

// the default font weight for headers
// eslint-disable-next-line react-refresh/only-export-components
export const HEADER_FONT_WEIGHT = 700;

// the default dimmed font weight
// eslint-disable-next-line react-refresh/only-export-components
export const DIMMED_FONT_WEIGHT = 400;

/* the number of spaces used for indentation of json
* used during JSON.stringify */
// eslint-disable-next-line react-refresh/only-export-components
export const JSON_SPACES = 2;

/* The source url for the aladin stuff.*/
// eslint-disable-next-line react-refresh/only-export-components
export const ALADIN_SRC_URL =
    'https://aladin.cds.unistra.fr/AladinLite/api/v3/latest/aladin.js';

/* The source url for the aladin jquery */
// eslint-disable-next-line react-refresh/only-export-components
export const JQUERY_SRC_URL = 'https://code.jquery.com/jquery-1.12.1.min.js';

/* the color selection of yellow needed for errors */
// eslint-disable-next-line react-refresh/only-export-components
export const ERROR_YELLOW = 6;

// eslint-disable-next-line react-refresh/only-export-components
export const err_yellow_str = "yellow.6"

// eslint-disable-next-line react-refresh/only-export-components
export const err_red_str = "red.6"

// eslint-disable-next-line react-refresh/only-export-components
export const err_green_str = "green.6"

/* this constant is the expected name of the file which contains the json data.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const JSON_FILE_NAME = 'proposal.json';

/* the filename of the overview pdf to be exported, but not imported. */
// eslint-disable-next-line react-refresh/only-export-components
export const OVERVIEW_PDF_FILENAME = 'ProposalOverview.pdf';

/* max size of a upload zip (20 MB)*/
// eslint-disable-next-line react-refresh/only-export-components
export const MAX_SUPPORTING_DOCUMENT_SIZE = 100*1024*1024;

/* Simbad URL string for its TAP service */
// eslint-disable-next-line react-refresh/only-export-components
export const SIMBAD_URL_TAP_SERVICE =
    "https://simbad.cds.unistra.fr/simbad/sim-tap/sync?request=doQuery&lang=adql";

// eslint-disable-next-line react-refresh/only-export-components
export const SIMBAD_URL_IDENT =
    "https://simbad.cds.unistra.fr/simbad/sim-id?Ident="

/* Parameters for Json output plus the required 'query=' */
// eslint-disable-next-line react-refresh/only-export-components
export const SIMBAD_JSON_OUTPUT = "&format=json&query="

/* limit the number of search results returned by SIMBAD */
// eslint-disable-next-line react-refresh/only-export-components
export const SIMBAD_TOP_LIMIT = 100;

/* Number of milliseconds delay for debounce used to search the SIMBAD database */
// eslint-disable-next-line react-refresh/only-export-components
export const SIMBAD_DEBOUNCE_DELAY = 1000; //milliseconds

/* Number of milliseconds to wait before aborting a fetch call to a SIMBAD service */
// eslint-disable-next-line react-refresh/only-export-components
export const SIMBAD_TIMEOUT = 5000; //milliseconds

// eslint-disable-next-line react-refresh/only-export-components
export const DEBOUNCE_500_ms = 500; //milliseconds

// eslint-disable-next-line react-refresh/only-export-components
export const DEBOUNCE_1000_ms = 1000; //milliseconds

// default string value for optical telescope data.
// eslint-disable-next-line react-refresh/only-export-components
export const DEFAULT_STRING = "None";

/**
 * the different types of observation.
 */
export type ObservationType = 'Target' | 'Calibration' | '';