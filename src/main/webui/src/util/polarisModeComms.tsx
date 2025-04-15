import {proposalToolFetch} from "../generated/proposalToolFetcher";
import * as Fetcher from "../generated/proposalToolFetcher";

// the error format for extracting the polaris mode.
export type PolarisModeNameError = Fetcher.ErrorWrapper<undefined>;


/**
 * bring about a call to acquire the polaris mode.
 *
 * @param {AbortSignal} signal: the signal for failure.
 * @return {Promise<number>}: the resulting verification. true stating a
 * telescope data exists for the given observation.
 */
export const fetchPolarisMode = (signal?: AbortSignal) =>
    proposalToolFetch<
        number,
        PolarisModeNameError,
        undefined,
        NonNullable<unknown>,
        NonNullable<unknown>,
        NonNullable<unknown>>({
            url: "/pst/api/polarisMode",
            method: "get", signal: signal
    });