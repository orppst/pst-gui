/*
 Add more unit labels as and when we need them
 */

export const angularUnits =  [
    {value: 'microarcsec', label: '\u{03bc}as'},
    {value: 'milliarcsec', label: 'mas'},
    {value: 'arcsec', label: 'arcsec'},
    {value: 'arcmin', label: 'arcmin'},
    {value: 'milliradians', label: 'mrad'},
    {value: 'degrees', label: 'deg'}
]

export const frequencyUnits = [
    {value: 'kHz', label: 'kHz'},
    {value: 'MHz', label: 'MHz'},
    {value: 'GHz', label: 'GHz'},
    {value: 'THz', label: 'THz'},
    {value: 'PHz', label: 'PHz'},
    {value: 'EHz', label: 'EHz'}
]

export const sensitivityUnits = [
    {value: 'dB', label: 'db'},
    {value: 'bel', label: 'bel'}
]

/**
 * helper method to determine the correct label.
 * @param array the array of value and labels from physical units.
 * @param value the value to find the label of.
 * @return {{value: string, label: string} | undefined} the found value, label combo.
 */
export const locateLabel = (
        array: Array<{value:string, label:string}>,
        value: string | undefined): { value: string; label: string; } | undefined => {
    return array.find((object) => {
        return object.value == value
    })
}