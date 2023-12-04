import {
    ProposalResourceGetTargetsResponse
} from '../generated/proposalToolComponents.ts';

/**
 * target prop.
 * @param {number} proposalCode the id for the proposal this target is linked to.
 * @param {number} dbid the database id for this target.
 * @param {boolean} showButtons boolean saying if this row can show its buttons.
 * @param {string} key forced upon us.
 * @param {number []} boundTargets the target ids bound to observations.
 */
export type TargetProps = {
    proposalCode: number,
    dbid: number,
    showButtons: boolean,
    key: string,
    boundTargets: (number | undefined)[] | undefined};

export type TargetTableProps = {
    isLoading: boolean,
    data:  ProposalResourceGetTargetsResponse | undefined
    selectedProposalCode: string | undefined,
    showButtons: boolean,
    boundTargets: (number | undefined)[] | undefined,
}