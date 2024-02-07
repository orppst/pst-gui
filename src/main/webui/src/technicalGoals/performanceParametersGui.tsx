import {convertToNumberUnitType, convertToRealQuantity, NumberUnitType} from "../commonInputs/NumberInputPlusUnit.tsx";
import {PerformanceParameters} from "../generated/proposalToolSchemas.ts";

//type to use with the Mantine form inputs
/**
 * @param {NumberUnitType} angularResolution the desired angular resolution for the observation
 * @param {NumberUnitType} dynamicRange the desired dynamic range for the observation
 * @param {NumberUnitType} sensitivity the desired sensitivity for the observation
 * @param {NumberUnitType} largestScale the largest scale for the observation
 * @param {NumberUnitType} spectralPoint the representative spectral point for the observation
 */
export type PerformanceParametersGui = {
    angularResolution: NumberUnitType,
    dynamicRange: NumberUnitType,
    sensitivity: NumberUnitType,
    largestScale: NumberUnitType,
    spectralPoint: NumberUnitType
}

/**
 *
 * @param input the PerformanceParameters type we want to convert to a PerformanceParametersGui type
 *              can be undefined when using a form for a new TechnicalGoal
 * @return PerformanceParametersGui
 */
export function convertToPerformanceParametersGui(input: PerformanceParameters | undefined):
    PerformanceParametersGui
{
    return ({
        angularResolution: convertToNumberUnitType(input?.desiredAngularResolution),
        largestScale: convertToNumberUnitType(input?.desiredLargestScale),
        sensitivity: convertToNumberUnitType(input?.desiredSensitivity),
        dynamicRange: convertToNumberUnitType(input?.desiredDynamicRange),
        spectralPoint: convertToNumberUnitType(input?.representativeSpectralPoint)
    })
}

/**
 *
 * @param input the PerformanceParameterGui type we want to convert to a PerformanceParameters type
 * @return PerformanceParameters
 */
export function convertToPerformanceParameters(input: PerformanceParametersGui) : PerformanceParameters {
    return ({
        desiredAngularResolution: convertToRealQuantity(input.angularResolution),
        desiredDynamicRange: convertToRealQuantity(input.dynamicRange),
        desiredSensitivity: convertToRealQuantity(input.sensitivity),
        desiredLargestScale: convertToRealQuantity(input.largestScale),
        representativeSpectralPoint: convertToRealQuantity(input.spectralPoint)
    })
}