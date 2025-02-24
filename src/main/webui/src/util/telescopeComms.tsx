import { proposalToolFetch } from '../generated/proposalToolFetcher';
import * as Fetcher from '../generated/proposalToolFetcher';

// the response type for the names of the telescope.
export type ReceivedTelescopeNames = { names: string [], length: number}

// the error format for telescope error response with name.
export type TelescopeNameError = Fetcher.ErrorWrapper<undefined>;

// the error format for telescope error response for data.
export type TelescopeDataError = Fetcher.ErrorWrapper<undefined>;

// the enum type of the forms of input.
export enum Type {LIST, TEXT, BOOLEAN }

// the type of field
export type Field = {type: Type, values: string []}

// the type of instrument
export type Instrument = {name: string, elements: Map<string, Field>};

// the type for a telescope.
export type Telescope = { name: string, instruments: Map<string, Instrument>}

// the type for the received data about telescopes.
export type ReceivedTelescopes = {
    telescopes: Telescope [],
    length: number
}

/**
 * bring about a call to get telescope names.
 *
 * @param {AbortSignal} signal: the signal for failure.
 * @return {Promise<ReceivedTelescopeNames>}: the resulting data when received.
 */
export const useOpticalTelescopeResourceGetNames = (signal?: AbortSignal) =>
    proposalToolFetch<
        ReceivedTelescopeNames,
        TelescopeNameError,
        undefined,
        {unknown},
        {unknown},
        {unknown}
        >({ url: "/pst/api/opticalTelescopes/names",
            method: "get", ...{}, signal });

/**
 * bring about a call to get telescope data.
 *
 * @param {AbortSignal} signal: the signal for failure.
 * @return {Promise<ReceivedTelescopeNames>}: the resulting data when received.
 */
export const useOpticalTelescopeResourceGetTelescopeData = (signal?: AbortSignal) =>
    proposalToolFetch<
        ReceivedTelescopes,
        TelescopeDataError,
        undefined,
        {unknown},
        {unknown},
        {unknown}
        >({ url: "/pst/api/opticalTelescopes/telescopes",
        method: "get", ...{}, signal });



