import {QueryKey} from "@tanstack/react-query";

/**
 * Convenience function to return a specific QueryKey to use in 'queryClient.invalidateQueries()'
 * when mutating a proposal
 *
 * @param props object containing the proposal ID, the child name e.g., 'observations',
 * and the child's ID
 */
export
function queryKeyProposals(
    props: {proposalId: number, childName: string, childId: number}
): QueryKey
{
    return ["pst", "api", "proposals", props.proposalId, props.childName, props.childId];
}