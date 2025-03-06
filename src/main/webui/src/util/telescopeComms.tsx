import { proposalToolFetch } from '../generated/proposalToolFetcher';
import * as Fetcher from '../generated/proposalToolFetcher';

// the response type for the names of the telescope.
export type ReceivedTelescopeNames = { names: string []}

// the error format for telescope error response with name.
export type TelescopeNameError = Fetcher.ErrorWrapper<undefined>;

// the error format for telescope error response for data.
export type TelescopeDataError = Fetcher.ErrorWrapper<undefined>;

// the error format for telescope error response for load data.
export type TelescopeLoadError = Fetcher.ErrorWrapper<undefined>;

// the error format for telescope error response for save data.
export type TelescopeSaveError = Fetcher.ErrorWrapper<undefined>;

// the enum type of the forms of input.
export enum Type {LIST, TEXT, BOOLEAN }

// the type of field
export type Field = {type: Type, values: string []}

// the type of instrument
export type Instrument = {name: string, elements: Map<string, Field>};

// the type for a telescope.
export type Telescope = { name: string, instruments: Map<string, Instrument>}

// type used to transfer data to the back end for saving state.
export type SaveTelescopeResourceParametersVariables = {
    body?: SaveTelescopeState;
}

// the type for the received data about telescopes.
export type ReceivedTelescopes = {
    telescopes: Map<string, Telescope>
}

// the type for the saving of observation telescope data.
export type SaveTelescopeState = {
    proposalID: string, observationID: string, telescopeName: string,
    instrumentName: string, choices: Map<string, string>
}

// the type for the loading of observation telescope data.
export type LoadTelescopeState = {
    proposalID: string, observationID: string
}

// the type of data returned from a load request
export type SavedTelescopeData = {
    proposalID: string, observationID: string, telescopeName: string, choices: Map<string, string>
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

/**
 * bring about a call to save observation telescope data.
 *
 * @param {SaveTelescopeState} data: the data to save.
 * @param {AbortSignal} signal: the signal for failure.
 * @return {Promise<ReceivedTelescopeNames>}: the resulting data when received.
 */
export const useOpticalTelescopeResourceSaveTelescopeData = (
    data: SaveTelescopeState, signal?: AbortSignal) =>
    proposalToolFetch<
        boolean,
        TelescopeDataError,
        SaveTelescopeState,
        {unknown},
        {unknown},
        SaveTelescopeResourceParametersVariables
        >({ url: "/pst/api/opticalTelescopes/save",
        method: "put", ...data, signal });

/**
 * bring about a call to get observation telescope data.
 *
 * @param {LoadTelescopeState} data: the data to load telescope data from.
 * @param {AbortSignal} signal: the signal for failure.
 * @return {Promise<ReceivedTelescopeNames>}: the resulting data when received.
 */
export const useOpticalTelescopeResourceLoadTelescopeData = (
    data: LoadTelescopeState, signal?: AbortSignal) =>
    proposalToolFetch<
        SavedTelescopeData,
        TelescopeDataError,
        LoadTelescopeState,
        {unknown},
        {unknown},
        SaveTelescopeResourceParametersVariables
        >({ url: "/pst/api/opticalTelescopes/load",
        method: "post", ...data, signal });
