import {
    convertToRealQuantity,
    NumberUnitType
} from '../commonInputs/NumberInputPlusUnit.tsx';
import {
    ExpectedSpectralLine,
    PolStateEnum,
    ScienceSpectralWindow
} from '../generated/proposalToolSchemas.ts';
import { randomId } from '@mantine/hooks';

/**
 *  Alternative type for ExpectedSpectralLine using 'NumberUnitType'
 *  in place of 'RealQuantity' for input into Mantine 'NumberInput'
 *
 * @param {NumberUnitType} restFrequency the frequency of the spectral line.
 * @param {string} transition a optional parameter with a transition
 * description.
 * @param {string} splatalogId the splatalog id given to this line, if
 * applicable.
 * @param {string} description optional parameter with a description of this
 * line.
 */
export type ExpectedSpectralLineGui = {
    restFrequency: NumberUnitType,
    transition?: string,
    splatalogId?: string,
    description?: string
}

/**
 *  Alternative type for ScienceSpectralWindow using 'NumberUnitType'
 *  in place of 'RealQuantity' for input into Mantine 'NumberInput'.
 *  Notice that we have transferred the members of 'SpectralWindowSetup'
 *  to be direct children of this type.
 *
 * @param {NumberUnitType} start the start of the window.
 * @param {NumberUnitType} end the end of the window.
 * @param {NumberUnitType} spectralResolution the resolution of the window.
 * @param {boolean} isSkyFrequency if the window is in sky frequency mode.
 * @param {PolStateEnum | null} polarization the type of polarization used
 * in this window.
 * @param {ExpectedSpectralLineGui []} the array of line guis.
 * @param {string} key: the database key.
 */
export type ScienceSpectralWindowGui = {
    start: NumberUnitType,
    end: NumberUnitType,
    spectralResolution: NumberUnitType,
    isSkyFrequency: boolean,
    polarization: PolStateEnum | null
    expectedSpectralLines: ExpectedSpectralLineGui [],
    key: string
}

/**
 * convert ExpectedSpectralLine type to ExpectedSpectralLineGui type.
 *
 * @param {ExpectedSpectralLine} input the line to convert to a GUI.
 * @return {ExpectedSpectralLineGui} the converted GUI object.
 *
 */
export function convertToExpectedSpectralLineGui(
        input: ExpectedSpectralLine): ExpectedSpectralLineGui {
    // return the converted gui.
    return {
        restFrequency: {
            value: input.restFrequency?.value ?? "",
            unit: input.restFrequency?.unit?.value ?? ""
        },
        transition: input.transition,
        splatalogId: input.splatalogId?.value,
        description: input.description
    };
}

/**
 * convert ScienceSpectralWindow type to ScienceSpectralWindowGui type.
 *
 * @param {ScienceSpectralWindow} input the window to convert to a gui.
 * @return {ScienceSpectralWindowGui} the converted gui.
 */
export function convertToScienceSpectralWindowGui(
        input: ScienceSpectralWindow): ScienceSpectralWindowGui {
    // return the converted gui.
    return {
        start: {
            value: input.spectralWindowSetup?.start?.value ?? "",
            unit: input.spectralWindowSetup?.start?.unit?.value ?? ""
        },
        end: {
            value: input.spectralWindowSetup?.end?.value ?? "",
            unit: input.spectralWindowSetup?.end?.unit?.value ?? ""
        },
        spectralResolution: {
            value: input.spectralWindowSetup?.spectralResolution?.value ?? "",
            unit:
                input.spectralWindowSetup?.spectralResolution?.unit?.value ?? ""
        },
        isSkyFrequency: input.spectralWindowSetup?.isSkyFrequency ?? false,
        polarization: input.spectralWindowSetup?.polarization ?? null,
        expectedSpectralLines: input.expectedSpectralLine ?
            input.expectedSpectralLine.map((line) => {
                return convertToExpectedSpectralLineGui(line);
            }) : [],
        key: randomId()
    };
}

/**
 * convert ExpectedSpectralLineGui type to ExpectedSpectralLine type.
 *
 * @param {ExpectedSpectralLineGui} input the line gui to convert.
 * @return {ExpectedSpectralLine} the converted line.
 */
export function convertToExpectedSpectralLine(
        input: ExpectedSpectralLineGui): ExpectedSpectralLine {
    // return the converted spectral line.
    return {
        restFrequency: convertToRealQuantity(input.restFrequency),
        transition: input.transition,
        splatalogId: { value: input.splatalogId },
        description: input.description
    };
}

/**
 * convert ScienceSpectralWindowGui type to ScienceSpectralWindow type.
 *
 * @param {ScienceSpectralWindowGui} input the window gui to convert.
 * @return {ScienceSpectralWindow} the converted window.
 */
export function convertToScienceSpectralWindow(
        input: ScienceSpectralWindowGui): ScienceSpectralWindow {
    // return the new window
    return {
        spectralWindowSetup: {
            start: convertToRealQuantity(input.start),
            end: convertToRealQuantity(input.end),
            spectralResolution: convertToRealQuantity(input.spectralResolution),
            isSkyFrequency: input.isSkyFrequency,
            polarization: input.polarization as PolStateEnum
        },
        expectedSpectralLine: input.expectedSpectralLines.map((lineAlt) => {
            return convertToExpectedSpectralLine(lineAlt)
        })
    };
}