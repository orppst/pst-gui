import {proposalToolFetch} from "../generated/proposalToolFetcher";
import * as Schemas from "../generated/proposalToolSchemas";
import * as reactQuery from "@tanstack/react-query";
import {ProposalToolContext, useProposalToolContext} from "../generated/proposalToolContext";
import {
    SubmittedProposalResourceGetSubmittedProposalError,
} from "../generated/proposalToolComponents";

export type SubmittedProposalResourceGetSubmittedProposalExportPathParams = {
    /**
     * @format int64
     */
    cycleCode: number;
    /**
     * @format int64
     */
    submittedProposalId: number;
    /**
     * @format boolean
     */
    investigatorsIncluded: boolean;
};

export type SubmittedProposalResourceGetSubmittedProposalExportVariables = {
    pathParams: SubmittedProposalResourceGetSubmittedProposalExportPathParams;
} & ProposalToolContext["fetcherOptions"];


export const fetchSubmittedProposalResourceGetSubmittedProposalExport = (
    variables: SubmittedProposalResourceGetSubmittedProposalExportVariables,
    signal?: AbortSignal,
) =>
    proposalToolFetch<
        undefined,
        SubmittedProposalResourceGetSubmittedProposalError,
        undefined,
        NonNullable<unknown>,
        NonNullable<unknown>,
        SubmittedProposalResourceGetSubmittedProposalExportPathParams
    >({
        url: "/pst/api/proposalCycles/{cycleCode}/submittedProposals/{submittedProposalId}/{investigatorsIncluded}/export",
        method: "get",
        ...variables,
        signal,
    });

export const useSubmittedProposalResourceGetSubmittedProposal = <
    TData = Schemas.SubmittedProposal,
>(
    variables: SubmittedProposalResourceGetSubmittedProposalExportVariables,
    options?: Omit<
        reactQuery.UseQueryOptions<
            undefined,
            SubmittedProposalResourceGetSubmittedProposalError,
            TData
        >,
        "queryKey" | "queryFn" | "initialData"
    >,
) => {
    const { fetcherOptions, queryOptions, queryKeyFn } =
        useProposalToolContext(options);
    return reactQuery.useQuery<
        undefined,
        SubmittedProposalResourceGetSubmittedProposalError,
        TData
    >({
        queryKey: queryKeyFn({
            path: "/pst/api/proposalCycles/{cycleCode}/submittedProposals/{submittedProposalId}/{investigatorsIncluded}/export",
            operationId: "submittedProposalResourceGetSubmittedProposalExport",
            variables,
        }),
        queryFn: ({ signal }) =>
            fetchSubmittedProposalResourceGetSubmittedProposalExport(
                { ...fetcherOptions, ...variables },
                signal,
            ),
        ...options,
        ...queryOptions,
    });
};