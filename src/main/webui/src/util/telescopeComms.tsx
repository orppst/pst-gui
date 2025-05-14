import { proposalToolFetch } from '../generated/proposalToolFetcher';
import * as Fetcher from '../generated/proposalToolFetcher';
import * as reactQuery from "@tanstack/react-query";
import { useProposalToolContext } from '../generated/proposalToolContext';

// the response type for the names of the telescope.
export type ReceivedTelescopeNames = string [];

// the error format for telescope data.
export type SavedTelescopeDataError = Fetcher.ErrorWrapper<undefined>;

// the error format for telescope error response with name.
export type TelescopeNameError = Fetcher.ErrorWrapper<undefined>;

// the error format for telescope error response for data.
export type TelescopeDataError = Fetcher.ErrorWrapper<undefined>;

// the error format for telescope error response for data.
export type TelescopeTimingError = Fetcher.ErrorWrapper<undefined>;

// the error format for telescope error response for load data.
export type TelescopeLoadError = Fetcher.ErrorWrapper<undefined>;

// the error format for telescope error response for save data.
export type TelescopeSaveError = Fetcher.ErrorWrapper<undefined>;

// the error format for telescope error response for verify data.
export type TelescopeVerifyError = Fetcher.ErrorWrapper<undefined>;

// the error format for telescope copy response for verify data.
export type TelescopeCopyError = Fetcher.ErrorWrapper<undefined>;

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
    primaryKey: {proposalID: string, observationID: string},
    telescopeName: string,
    instrumentName: string,
    telescopeTimeUnit: string,
    telescopeTimeValue: string,
    userType: string,
    condition: string,
    choices: Map<string, string>
}

// the type for the extracting data of observation telescope table.
export type TelescopeTableState = {
    telescopeName: string, instrumentName: string
}

// the type for the extracting data of observations for overview telescope table.
export type  TelescopeOverviewTableState = {
    telescopeName: string, instrumentName: string,
    telescopeTimeValue: string, telescopeTimeUnit: string,
    condition: string
}

// Define the type that matches the backend's HashMap structure
export type OpticalTableDataBackendResponse = {
    [observationID: string]: TelescopeTableState
};

// Define the type that matches the backend's HashMap structure
export type OpticalOverviewTableDataBackendResponse = {
    [observationID: string]: TelescopeOverviewTableState
};


// the type for the loading of observation telescope data.
export type LoadTelescopeState = {
    proposalID: string, observationID: string
}

// the type for aiming for a given proposal.
export type OpticalTelescopeProposal = {
    proposalID: string
}

// the type for cloning
export type OpticalTelescopeCopyData = {
    proposalID: string,
    cloneID: string,
    obsIds: number[],
    cloneObsIDs: number[],
}

// the type of data returned from a load request
export type SavedTelescopeData = {
    primaryKey: {
        proposalID: string | null,
        observationID: string,
    }
    telescopeName: string,
    instrumentName: string,
    telescopeTimeValue: string,
    telescopeTimeUnit: string,
    userType: string,
    condition: string,
    choices: {[p: string]: string}
}

/**
 * bring about a call to get telescope names.
 *
 * @param {AbortSignal} signal the signal for failure.
 * @return {Promise<ReceivedTelescopeNames>} the resulting data when received.
 */
export const fetchOpticalTelescopeResourceGetNames = (signal?: AbortSignal) =>
    proposalToolFetch<
        ReceivedTelescopeNames,
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
 * @param {AbortSignal} signal the signal for failure.
 * @return {Promise<ReceivedTelescopeNames>} the resulting data when received.
 */
export const fetchOpticalTelescopeResourceGetTelescopeData =
        (signal?: AbortSignal) =>
    proposalToolFetch<
        Map<string, Telescope>,
        TelescopeDataError,
        undefined,
        NonNullable<unknown>,
        NonNullable<unknown>,
        NonNullable<unknown>>({
        url: "/pst/api/opticalTelescopes/telescopes",
        method: "get", signal: signal
    });

/**
 * bring about a call to verify if there's telescope data for a given
 * observation.
 *
 * @param {LoadTelescopeState} data the proposal and observation id to verify.
 * @param {AbortSignal} signal the signal for failure.
 * @return {Promise<boolean>} the resulting verification. true stating a
 * telescope data exists for the given observation.
 */
export const fetchOpticalTelescopeResourceGetVerification =
        (data: LoadTelescopeState, signal?: AbortSignal) =>
    proposalToolFetch<
        boolean,
        TelescopeVerifyError,
        LoadTelescopeState,
        NonNullable<unknown>,
        NonNullable<unknown>,
        NonNullable<unknown>>({
        url: "/pst/api/opticalTelescopes/hasEntry",
        method: "post", body: data, signal: signal
    });

/**
 * bring about a call to verify if there's telescope data for a given
 * observation.
 *
 * @param {LoadTelescopeState} variables the proposal and observation id to verify.
 * @param  options things that shouldn't be changed.
 * @return the resulting verification. true stating a
 * telescope data exists for the given observation.
 */
export const useOpticalTelescopeResourceGetVerification = (
    variables: LoadTelescopeState,
    options?: Omit<
        reactQuery.UseQueryOptions<
            boolean,
            TelescopeVerifyError,
            boolean
        >,
        "queryKey" | "queryFn" | "initialData"
    >,
) => {
    const { fetcherOptions, queryOptions, queryKeyFn } =
        useProposalToolContext(options);

    const queryKey = queryKeyFn({
        path: "/pst/api/opticalTelescopes/hasEntry",
        operationId: "opticalTelescopeResourceGetVerification",
        variables,
    });

    const queryFn = ({ signal }: { signal?: AbortSignal }) =>
        fetchOpticalTelescopeResourceGetVerification(
            { ...fetcherOptions, ...variables },
            signal,
        );

    return reactQuery.useQuery<boolean, TelescopeVerifyError, boolean>({
        queryKey,
        queryFn,
        ...options,
        ...queryOptions,
    });
};

/**
 * bring about a call to verify if there's telescope data for a given
 * observation.
 *
 * @param {OpticalTelescopeProposal} data the proposal and observation id to
 * verify.
 * @param {AbortSignal} signal the signal for failure.
 * @return the resulting observation ids that contain optical data.
 */
export const fetchOpticalTelescopeResourceGetProposalObservationIds =
    (data: OpticalTelescopeProposal, signal?: AbortSignal) =>
        proposalToolFetch<
            number [],
            TelescopeVerifyError,
            OpticalTelescopeProposal,
            NonNullable<unknown>,
            NonNullable<unknown>,
            NonNullable<unknown>>({
            url: "/pst/api/opticalTelescopes/verifyProposal",
            method: "post", body: data, signal: signal
        });

/**
 * bring about a call to verify if there's telescope data for a given
 * observation.
 *
 * @param {OpticalTelescopeProposal} variables the proposal and observation id to verify.
 * @param  options things that shouldn't be changed.
 * @return the resulting observation ids that contain optical data.
 */
export const useOpticalTelescopeResourceGetProposalObservationIds = (
    variables: OpticalTelescopeProposal,
    options?: Omit<
        reactQuery.UseQueryOptions<
            number [],
            TelescopeVerifyError,
            number[]
        >,
        "queryKey" | "queryFn" | "initialData"
    >,
) => {
    const { fetcherOptions, queryOptions, queryKeyFn } =
        useProposalToolContext(options);

    const queryKey = queryKeyFn({
        path: "/pst/api/opticalTelescopes/verifyProposal",
        operationId: "opticalTelescopeResourceGetProposalVerification",
        variables,
    });

    const queryFn = ({ signal }: { signal?: AbortSignal }) =>
        fetchOpticalTelescopeResourceGetProposalObservationIds(
            { ...fetcherOptions, ...variables },
            signal,
        );

    return reactQuery.useQuery<
            number[], TelescopeVerifyError, number[]>({
        queryKey,
        queryFn,
        ...options,
        ...queryOptions,
    });
};

/**
 * bring about a call to get observation telescope data.
 *
 * @param {LoadTelescopeState} data the data to load telescope data from.
 * @param {AbortSignal} signal the signal for failure.
 * @return {Promise<ReceivedTelescopeNames>} the resulting data when received.
 */
export const fetchOpticalTelescopeResourceLoadTelescopeData = (
    data: LoadTelescopeState, signal?: AbortSignal) =>
    proposalToolFetch<
        SaveTelescopeState,
        TelescopeLoadError,
        LoadTelescopeState,
        NonNullable<unknown>,
        NonNullable<unknown>,
        SaveTelescopeResourceParametersVariables>({
        url: "/pst/api/opticalTelescopes/load",
        method: "post", body: data, signal: signal
    });

/**
 * mutation function wrapping around the sending of new state to the backend
 * for telescopes.
 *
 * @param options the saved data.
 * @return mutation promise holding onSuccess, OnError.
 */
export const useOpticalTelescopeResourceSaveTelescopeData = (
    options?: Omit<
        reactQuery.UseMutationOptions<
            boolean,
            SavedTelescopeDataError,
            SavedTelescopeData>,
        "mutationFn">
) => {
    const { fetcherOptions } = useProposalToolContext();
    return reactQuery.useMutation<
        boolean,
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
 * @param {SavedTelescopeData} data the data to save.
 * @param {AbortSignal} signal the signal for failure.
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

/**
 * mutation function wrapping around the sending of delete request
 * to the backend for a given observation.
 *
 * @param options the proposal id and observation id for deletion.
 * @return mutation promise holding onSuccess, OnError.
 */
export const useOpticalTelescopeResourceDeleteObservationTelescopeData = (
    options?: Omit<
        reactQuery.UseMutationOptions<
            boolean,
            SavedTelescopeDataError,
            LoadTelescopeState>,
        "mutationFn">
) => {
    const { fetcherOptions } = useProposalToolContext();
    return reactQuery.useMutation<
        boolean,
        SavedTelescopeDataError,
        LoadTelescopeState
    >({
        mutationFn: (variables: LoadTelescopeState) =>
            fetchOpticalTelescopeResourceDeleteObservationTelescopeData({
                ...fetcherOptions,
                ...variables,
            }),
        ...options,
    });
};

/**
 * bring about a call to delete observation telescope data.
 *
 * @param {LoadTelescopeState} data the proposal and observation id for deletion.
 * @param {AbortSignal} signal the signal for failure.
 */
export const fetchOpticalTelescopeResourceDeleteObservationTelescopeData = (
    data: LoadTelescopeState, signal?: AbortSignal) =>
    proposalToolFetch<
        boolean,
        TelescopeSaveError,
        LoadTelescopeState,
        NonNullable<unknown>,
        NonNullable<unknown>,
        SaveTelescopeResourceParametersVariables
    >({ url: "/pst/api/opticalTelescopes/deleteObs",
        method: "post",
        body: data,
        signal: signal });

/**
 * mutation function wrapping around the sending of delete request
 * to the backend for a given proposal.
 *
 * @param options the proposal id.
 * @return mutation promise holding onSuccess, OnError.
 */
export const useOpticalTelescopeResourceDeleteProposalTelescopeData = (
    options?: Omit<
        reactQuery.UseMutationOptions<
            boolean,
            SavedTelescopeDataError,
            OpticalTelescopeProposal>,
        "mutationFn">
) => {
    const { fetcherOptions } = useProposalToolContext();
    return reactQuery.useMutation<
        boolean,
        SavedTelescopeDataError,
        OpticalTelescopeProposal
    >({
        mutationFn: (variables: OpticalTelescopeProposal) =>
            fetchOpticalTelescopeResourceDeleteProposalTelescopeData({
                ...fetcherOptions,
                ...variables,
            }),
        ...options,
    });
};

/**
 * bring about a call to save observation telescope data.
 *
 * @param {LoadTelescopeState} data the proposal id for deletion.
 * @param {AbortSignal} signal the signal for failure.
 */
export const fetchOpticalTelescopeResourceDeleteProposalTelescopeData = (
    data: OpticalTelescopeProposal, signal?: AbortSignal) =>
    proposalToolFetch<
        boolean,
        TelescopeSaveError,
        OpticalTelescopeProposal,
        NonNullable<unknown>,
        NonNullable<unknown>,
        SaveTelescopeResourceParametersVariables
    >({ url: "/pst/api/opticalTelescopes/deleteProposal",
        method: "post",
        body: data,
        signal: signal });

/**
 * bring about a call to get observation optical table data.
 *
 * @param {OpticalTelescopeProposal} data the data to get the optical table.
 * @param {AbortSignal} signal the signal for failure.
 * @return {Promise<TelescopeTableState[]>} the resulting data when received.
 */
export const fetchOpticalTelescopeTableData = (
    data: OpticalTelescopeProposal, signal?: AbortSignal) =>
    proposalToolFetch<
        OpticalTableDataBackendResponse,
        TelescopeLoadError,
        OpticalTelescopeProposal,
        NonNullable<unknown>,
        NonNullable<unknown>,
        SaveTelescopeResourceParametersVariables>({
        url: "/pst/api/opticalTelescopes/opticalTableData",
        method: "post", body: data, signal: signal
    });

/**
 * mutation function wrapping around data extraction for optical table.
 * @param {OpticalTelescopeProposal} proposalData the proposal id.
 * @param options the saved data.
 * @return mutation promise holding onSuccess, OnError.
 */
export const useOpticalTelescopeTableData = (
    proposalData: OpticalTelescopeProposal,
    options?: Omit<
        reactQuery.UseQueryOptions<
            OpticalTableDataBackendResponse,
            TelescopeLoadError,
            Map<string, TelescopeTableState>,
            reactQuery.QueryKey
        >,
        "queryKey" | "queryFn" | "select" // Add "select" to the Omit
    >
) => {
    const { fetcherOptions, queryOptions, queryKeyFn } =
        useProposalToolContext(options);

    const queryKey = queryKeyFn({
        path: "/pst/api/opticalTelescopes/opticalTableData",
        operationId: "fetchOpticalTelescopeTableData",
        variables: proposalData,
    });

    const queryFn = ({ signal }: { signal?: AbortSignal }) =>
        fetchOpticalTelescopeTableData(
            { ...fetcherOptions, ...proposalData },
            signal
        );

    return reactQuery.useQuery<
        OpticalTableDataBackendResponse, // Raw data from fetch
        TelescopeLoadError,
        Map<string, TelescopeTableState> // Transformed data for the component
    >({
        queryKey,
        queryFn,
        select: (backendResponse) => {
            // converts weird object into real map for easier processing later
            // on.
            return new Map(Object.entries(backendResponse));
        },
        ...options,
        ...queryOptions,
    });
};

/**
 * bring about a call to get observation optical table data.
 *
 * @param {OpticalTelescopeProposal} data the data to get the optical table.
 * @param {AbortSignal} signal the signal for failure.
 * @return {Promise<TelescopeTableState[]>} the resulting data when received.
 */
export const fetchOpticalOverviewTelescopeTableData = (
    data: OpticalTelescopeProposal, signal?: AbortSignal) =>
    proposalToolFetch<
        OpticalOverviewTableDataBackendResponse,
        TelescopeLoadError,
        OpticalTelescopeProposal,
        NonNullable<unknown>,
        NonNullable<unknown>,
        SaveTelescopeResourceParametersVariables>({
        url: "/pst/api/opticalTelescopes/opticalOverviewTableData",
        method: "post", body: data, signal: signal
    });

/**
 * mutation function wrapping around data extraction for optical overview table.
 * @param {OpticalTelescopeProposal} proposalData the proposal id.
 * @param options the saved data.
 * @return mutation promise holding onSuccess, OnError.
 */
export const useOpticalOverviewTelescopeTableData = (
    proposalData: OpticalTelescopeProposal,
    options?: Omit<
        reactQuery.UseQueryOptions<
            OpticalOverviewTableDataBackendResponse,
            TelescopeLoadError,
            Map<string, TelescopeOverviewTableState>,
            reactQuery.QueryKey
        >,
        "queryKey" | "queryFn" | "select" // Add "select" to the Omit
    >
) => {
    const { fetcherOptions, queryOptions, queryKeyFn } =
        useProposalToolContext(options);

    const queryKey = queryKeyFn({
        path: "/pst/api/opticalTelescopes/opticalOverviewTableData",
        operationId: "opticalOverviewTableData",
        variables: proposalData,
    });

    const queryFn = ({ signal }: { signal?: AbortSignal }) =>
        fetchOpticalOverviewTelescopeTableData(
            { ...fetcherOptions, ...proposalData },
            signal
        );

    return reactQuery.useQuery<
        OpticalOverviewTableDataBackendResponse, // Raw data from fetch
        TelescopeLoadError,
        Map<string, TelescopeOverviewTableState> // Transformed data for the component
    >({
        queryKey,
        queryFn,
        select: (backendResponse) => {
            // converts weird object into real map for easier processing later
            // on.
            return new Map(Object.entries(backendResponse));
        },
        ...options,
        ...queryOptions,
    });
};


/**
 * bring about a call to get observation optical table data.
 *
 * @param {OpticalTelescopeProposal} data the data to get the optical table.
 * @param {AbortSignal} signal the signal for failure.
 * @return {Promise<TelescopeTableState[]>} the resulting data when received.
 */
export const fetchOpticalCopyProposal = (
    data: OpticalTelescopeCopyData,
    signal?: AbortSignal
): Promise<boolean> => // Explicitly return Promise<boolean>
    proposalToolFetch<
        boolean,
        TelescopeCopyError,
        OpticalTelescopeCopyData,
        NonNullable<unknown>,
        NonNullable<unknown>,
        NonNullable<unknown>
    >({
        url: "/pst/api/opticalTelescopes/copyProposal",
        method: "post",
        body: data,
        signal: signal,
    });

/**
 * mutation function wrapping around data extraction for optical overview table.
 * @param options the saved data.
 * @return mutation promise holding onSuccess, OnError.
 */
export const useMutationOpticalCopyProposal = (
    options?: Omit<
        reactQuery.UseMutationOptions<
            boolean,
            TelescopeCopyError,
            OpticalTelescopeCopyData
        >,
        "mutationFn"
    >,
) => {
    const { fetcherOptions } = useProposalToolContext();
    return reactQuery.useMutation<
        boolean,
        TelescopeCopyError,
        OpticalTelescopeCopyData
    >({
        mutationFn: (variables: OpticalTelescopeCopyData) =>
            fetchOpticalCopyProposal({
                ...fetcherOptions,
                ...variables,
            }),
        ...options,
    });
};

/**
 * bring about a call to get observation optical table data.
 *
 * @param {AbortSignal} signal the signal for failure.
 * @return {Promise<TelescopeTableState[]>} the resulting data when received.
 */
export const fetchOpticalOverviewTelescopeTimingData = (
    signal?: AbortSignal) =>
    proposalToolFetch<
        Map<string, number>,
        TelescopeTimingError,
        undefined,
        NonNullable<unknown>,
        NonNullable<unknown>,
        NonNullable<unknown>>({
        url: "/pst/api/opticalTelescopes/nightRelationships",
        method: "get", signal: signal
    });

/**
 * mutation function wrapping around data extraction for optical overview table.
 * @param options the saved data.
 * @return mutation promise holding onSuccess, OnError.
 */
export const useOpticalOverviewTelescopeTimingData = (
    options?: Omit<
        reactQuery.UseQueryOptions<
            Map<string, number>,
            TelescopeTimingError,
            undefined,
            reactQuery.QueryKey
        >,
        "queryKey" | "queryFn" | "select" // Add "select" to the Omit
    >
) => {
    const {queryOptions, queryKeyFn } = useProposalToolContext(options);

    const queryKey = queryKeyFn({
        path: "/pst/api/opticalTelescopes/nightRelationships",
        operationId: "nightRelationships",
        variables: {},
    });

    const queryFn = ({ signal }: { signal?: AbortSignal }) =>
        fetchOpticalOverviewTelescopeTimingData(
            signal
        );

    return reactQuery.useQuery<
        Map<string, number>, // Raw data from fetch
        TelescopeTimingError,
        Map<string, number> // Transformed data for the component
    >({
        queryKey,
        queryFn,
        select: (backendResponse) => {
            // converts weird object into real map for easier processing later
            // on.
            return new Map(Object.entries(backendResponse));
        },
        ...options,
        ...queryOptions,
    });
};