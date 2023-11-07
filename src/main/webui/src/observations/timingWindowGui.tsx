//type to use for the DateTimePickers
/**
 * @param {Date | null} startTime the date the timing window will begin.
 * @param {Date | null} endTime the date the timing window will end.
 * @param {string} note the optional note.
 * @param {boolean} isAvoidConstraint
 * @param {string} key the primary key in the database.
 */
export type TimingWindowGui = {
    startTime: Date | null,
    endTime: Date | null,
    note: string,
    isAvoidConstraint: boolean,
    key: string
}