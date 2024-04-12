import {
    ProposalResourceGetTargetsResponse
} from 'src/generated/proposalToolComponents.ts';

/**
 * target prop.
 * @param {number} proposalCode the id for the proposal this target is linked to.
 * @param {number} dbid the database id for this target.
 * @param {boolean} showButtons boolean saying if this row can show its buttons.
 * @param {string} key forced upon us.
 * @param {number []} boundTargets the target ids bound to observations.
 * @param {number | undefined} selectedTarget the row to be highlighted in
 * selected mode. If undefined, the view is selected mode is turned off.
 * @param {(value: number) => void}} setSelectedTarget function, if defined for
 * what to do when selected.
 */
export type TargetProps = {
    proposalCode: number,
    dbid: number,
    showButtons: boolean,
    key: string,
    boundTargets: (number | undefined)[] | undefined,
    selectedTarget: number | undefined,
    setSelectedTarget?: (value: number) => void,
}

/**
 * data to transfer to the table generator.
 *
 * @param {boolean} isLoading boolean flagging if the table data is still loading.
 * @param {ProposalResourceGetTargetsResponse | undefined} data the array of
 * targets to display.
 * @param {string | undefined} selectedProposalCode the proposal code.
 * @param {boolean} showButtons boolean flagging if buttons should be visible.
 * @param {(number | undefined)[] | undefined} boundTargets array of targets
 * bound to observations.
 * @param {number | undefined} selectedTarget the row to be highlighted in
 * selected mode. If undefined, the view is selected mode is turned off.
 * @param {(value: number) => void}} setSelectedTarget function, if defined for
 * what to do when selected.
 */
export type TargetTableProps = {
    isLoading: boolean,
    data:  ProposalResourceGetTargetsResponse | undefined
    selectedProposalCode: string | undefined,
    showButtons: boolean,
    boundTargets: (number | undefined)[] | undefined,
    selectedTarget: number | undefined,
    setSelectedTarget?: (value: number) => void,
}