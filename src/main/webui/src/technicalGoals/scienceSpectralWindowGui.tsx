import {convertToRealQuantity, NumberUnitType} from "../commonInputs/NumberInputPlusUnit.tsx";
import {ExpectedSpectralLine, PolStateEnum, ScienceSpectralWindow} from "../generated/proposalToolSchemas.ts";
import {randomId} from "@mantine/hooks";

/**
 *  Alternative type for ExpectedSpectralLine using 'NumberUnitType'
 *  in place of 'RealQuantity' for input into Mantine 'NumberInput'
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
 */
export type ScienceSpectralWindowGui = {
    index?: number | string
    start: NumberUnitType,
    end: NumberUnitType,
    spectralResolution: NumberUnitType,
    isSkyFrequency: boolean,
    polarization: PolStateEnum | undefined
    expectedSpectralLines: ExpectedSpectralLineGui [],
    key: string
}

/**
 * convert ExpectedSpectralLine type to ExpectedSpectralLineGui type
 */
export function convertToExpectedSpectralLineGui(input: ExpectedSpectralLine) {
    let expectedSpectralLineGui : ExpectedSpectralLineGui = {
        restFrequency: {
            value: input.restFrequency?.value ?? "",
            unit: input.restFrequency?.unit?.value ?? ""
        },
        transition: input.transition,
        splatalogId: input.splatalogId?.value,
        description: input.description
    }

    return expectedSpectralLineGui;
}

/**
 * convert ScienceSpectralWindow type to ScienceSpectralWindowGui type
 */
export function convertToScienceSpectralWindowGui(input: ScienceSpectralWindow) {
    let scienceSpectralWindowGui : ScienceSpectralWindowGui = {
        index: input.index,
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
            unit: input.spectralWindowSetup?.spectralResolution?.unit?.value ?? ""
        },
        isSkyFrequency: input.spectralWindowSetup?.isSkyFrequency ?? false,
        polarization: input.spectralWindowSetup?.polarization ?? undefined,
        expectedSpectralLines: input.expectedSpectralLine ?
            input.expectedSpectralLine.map((line) =>{
                return convertToExpectedSpectralLineGui(line);
            }) : [],
        key: randomId()
    }

    return scienceSpectralWindowGui;
}

/**
 * convert ExpectedSpectralLineGui type to ExpectedSpectralLine type
 */
export function convertToExpectedSpectralLine(input: ExpectedSpectralLineGui) {
    let expectedSpectralLine : ExpectedSpectralLine = {
        restFrequency: convertToRealQuantity(input.restFrequency),
        transition: input.transition,
        splatalogId: {value: input.splatalogId},
        description: input.description
    }

    return expectedSpectralLine;
}

/**
 * convert ScienceSpectralWindowGui type tp ScienceSpectralWindow type
 */
export function convertToScienceSpectralWindow(input: ScienceSpectralWindowGui) {
    let scienceSpectralWindow : ScienceSpectralWindow = {
        index: input.index as number,
        spectralWindowSetup: {
            start: convertToRealQuantity(input.start),
            end: convertToRealQuantity(input.end),
            spectralResolution: convertToRealQuantity(input.spectralResolution),
            isSkyFrequency: input.isSkyFrequency,
            polarization: input.polarization
        },
        expectedSpectralLine: input.expectedSpectralLines.map((lineAlt) => {
            return convertToExpectedSpectralLine(lineAlt)
        })
    }

    return scienceSpectralWindow;
}