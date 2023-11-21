/**
 * target prop.
 * @param proposalCode the id for the proposal this target is linked to.
 * @param dbid the database id for this target.
 * @param showRemove boolean saying if this target can be removed.
 * @param key: forced upon us.
 */
export type TargetProps = {
    proposalCode: number,
    dbid: number,
    showRemove: boolean,
    key: string };