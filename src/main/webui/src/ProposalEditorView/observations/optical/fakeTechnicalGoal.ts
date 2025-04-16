import {TechnicalGoal} from "../../../generated/proposalToolSchemas";

/**
 * holds the fake observation technical goal for optical observations.
 * This is needed to bypass the limitations of the database.
 */
export const fakeGoalData: TechnicalGoal = {
    performance: {
        desiredAngularResolution: {
            "@type": "ivoa:RealQuantity",
            unit: {value: 'microarcsec'},
            value: -1,
        },
        desiredLargestScale: {
            "@type": "ivoa:RealQuantity",
            unit: {value: 'microarcsec'},
            value: -1,
        },
        desiredSensitivity: {
            "@type": "ivoa:RealQuantity",
            unit: {value: 'microJansky'},
            value: -1,
        },
        desiredDynamicRange: {
            "@type": "ivoa:RealQuantity",
            unit: {value: 'dB'},
            value: -1,
        },
        representativeSpectralPoint: {
            "@type": "ivoa:RealQuantity",
            unit: {value: 'kHz'},
            value: -1,
        },
    },
    spectrum: []
}

/**
 * comparison metric for a technical goal vs the fake one.
 * @param other: the other to compare against.
 */
export const checkForFake = (other: TechnicalGoal): boolean => {
    return other.performance!.desiredAngularResolution!.value == -1 &&
        other.performance!.desiredDynamicRange!.value == -1 &&
        other.performance!.desiredLargestScale!.value == -1 &&
        other.performance!.desiredSensitivity!.value == -1 &&
        other.performance!.representativeSpectralPoint!.value == -1 &&
        (other.spectrum == undefined || other.spectrum!.length == 0) &&
        other.performance!.desiredAngularResolution!.unit?.
            value == 'microarcsec' &&
        other.performance!.desiredDynamicRange!.unit?.value == 'dB' &&
        other.performance!.desiredLargestScale!.unit?.value == 'microarcsec' &&
        other.performance!.desiredSensitivity!.unit?.value == 'microJansky' &&
        other.performance!.representativeSpectralPoint!.unit?.value == 'kHz';
}