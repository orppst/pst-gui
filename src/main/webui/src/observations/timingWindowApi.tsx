//type to use to pass data to the API - notice this is different to the
// TimingWindow type in proposalToolSchemas.ts which uses strings for the dates
/**
 * @param {string} @type the object type i.e. 'proposal:TimingWindow'
 * @param {number} startTime the number of milliseconds since the posix epoch
 * @param {number} endTime the number of milliseconds since the posix epoch
 * @param {string} note optional description of the timing window
 * @param {boolean} isAvoidConstraint if true avoid observing between the dates
 * given
 */
type TimingWindowApi = {
    "@type": string,
    startTime: number,
    endTime: number,
    note: string,
    isAvoidConstraint: boolean,
}