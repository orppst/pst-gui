import { proposalToolFetch } from '../generated/proposalToolFetcher';
import * as Fetcher from '../generated/proposalToolFetcher';
import * as reactQuery from "@tanstack/react-query";
import { useProposalToolContext } from '../generated/proposalToolContext';

// the response type for the names of the telescope.
export type ReceivedTelescopeNames = string [];

// the error format for telescope error response with name.
export type TelescopeNameError = Fetcher.ErrorWrapper<undefined>;

// the error format for telescope error response for data.
export type TelescopeDataError = Fetcher.ErrorWrapper<undefined>;

// the error format for telescope error response for load data.
export type TelescopeLoadError = Fetcher.ErrorWrapper<undefined>;

// the error format for telescope error response for save data.
export type TelescopeSaveError = Fetcher.ErrorWrapper<undefined>;

// the enum type of the forms of input.
export enum Type {LIST = "LIST", TEXT = "TEXT", BOOLEAN = "BOOLEAN" }

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

// the type for the saving of observation telescope data.
export type SaveTelescopeState = {
    primaryKey: {proposalID: string, observationID: string}, telescopeName: string,
    instrumentName: string, choices: Map<string, string>
}

// the type for the loading of observation telescope data.
export type LoadTelescopeState = {
    proposalID: string, observationID: string
}

// the type of data returned from a load request
export type SavedTelescopeData = {
    primaryKey: {
        proposalID: string | null,
        observationID: string,
    }
    telescopeName: string,
    instrumentName: string,
    choices: {[p: string]: string}
}

/**
 * bring about a call to get telescope names.
 *
 * @param {AbortSignal} signal: the signal for failure.
 * @return {Promise<ReceivedTelescopeNames>}: the resulting data when received.
 */
export const fetchOpticalTelescopeResourceGetNames = (signal?: AbortSignal) =>
    proposalToolFetch<ReceivedTelescopeNames,
        TelescopeNameError,
        undefined,
        NonNullable<unknown>,
        NonNullable<unknown>,
        NonNullable<unknown>>({
        url: "/pst/api/opticalTelescopes/names",
        method: "get", signal: signal
    });

/**
 * bring about a call to get telescope data.
 *
 * @param {AbortSignal} signal: the signal for failure.
 * @return {Promise<ReceivedTelescopeNames>}: the resulting data when received.
 */
export const fetchOpticalTelescopeResourceGetTelescopeData = (signal?: AbortSignal) =>
    proposalToolFetch<
        Map<string, Map<string, Map<string, string>>>,
        TelescopeDataError,
        undefined,
        NonNullable<unknown>,
        NonNullable<unknown>,
        NonNullable<unknown>>({
        url: "/pst/api/opticalTelescopes/telescopes",
        method: "get", signal: signal
    });

/**
 * bring about a call to get observation telescope data.
 *
 * @param {LoadTelescopeState} data: the data to load telescope data from.
 * @param {AbortSignal} signal: the signal for failure.
 * @return {Promise<ReceivedTelescopeNames>}: the resulting data when received.
 */
export const fetchOpticalTelescopeResourceLoadTelescopeData = (
    data: LoadTelescopeState, signal?: AbortSignal) =>
    proposalToolFetch<Map<string, Map<string, Map<string, string>>>,
        TelescopeLoadError,
        LoadTelescopeState,
        NonNullable<unknown>,
        NonNullable<unknown>,
        SaveTelescopeResourceParametersVariables>({
        url: "/pst/api/opticalTelescopes/load",
        method: "post", body: data, signal: signal
    });

export type SavedTelescopeDataError = Fetcher.ErrorWrapper<undefined>;

/**
 * mutation function wrapping around the sending of new state to the backend for telescopes.
 * @param options: the saved data.
 * @return mutation promise holding onSuccess, OnError.
 */
export const useOpticalTelescopeResourceSaveTelescopeData = (
    options?: Omit<
        reactQuery.UseMutationOptions<
            undefined,
            SavedTelescopeDataError,
            SavedTelescopeData>,
        "mutationFn">
) => {
    const { fetcherOptions } = useProposalToolContext();
    return reactQuery.useMutation<
        undefined,
        SavedTelescopeDataError,
        SavedTelescopeData
        >({
        mutationFn: (variables: SavedTelescopeData) =>
            fetchOpticalTelescopeResourceSaveTelescopeData({
                ...fetcherOptions,
                ...variables,
            }),
        ...options,
    });
};


/**
 * bring about a call to save observation telescope data.
 *
 * @param {SavedTelescopeData} data: the data to save.
 * @param {AbortSignal} signal: the signal for failure.
 */
export const fetchOpticalTelescopeResourceSaveTelescopeData = (
    data: SavedTelescopeData, signal?: AbortSignal) =>
    proposalToolFetch<
        boolean,
        TelescopeSaveError,
        SavedTelescopeData,
        NonNullable<unknown>,
        NonNullable<unknown>,
        SaveTelescopeResourceParametersVariables
        >({ url: "/pst/api/opticalTelescopes/save",
        method: "put",
        body: data,
        signal: signal });
