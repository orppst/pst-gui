import {CalibrationTargetIntendedUse} from "../../../generated/proposalToolSchemas";
import {TimingWindowGui} from "./timingWindowGui";

/**
 * the different types of observation.
 */
type ObservationType = 'Target' | 'Calibration' | '';

export interface ObservationFormValues {
    observationId: number | undefined,
    observationType: ObservationType,
    calibrationUse: CalibrationTargetIntendedUse | undefined,
    targetDBIds: number[],
    techGoalId: number,
    timingWindows: TimingWindowGui[],
    telescopeName: string,
    instrument: string,
    telescopeTime: {
        unit: string,
        value: string,
    },
    userType: string,
    condition: string,
    elements: Map<string, string>,
}