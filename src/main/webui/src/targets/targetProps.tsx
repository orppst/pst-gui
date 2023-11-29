/**
 * target prop.
 * @param {number} proposalCode the id for the proposal this target is linked to.
 * @param {number} dbid the database id for this target.
 * @param {boolean} showRemove boolean saying if this target can be removed.
 * @param {string} key forced upon us.
 * @param {number []} boundTargets the target ids bound to observations.
 */
export type TargetProps = {
    proposalCode: number,
    dbid: number,
    showRemove: boolean,
    key: string,
    boundTargets: (number | undefined)[] | undefined,
    selectedTarget?: number,
    setSelectedTarget?: (value: number) => void,
};
