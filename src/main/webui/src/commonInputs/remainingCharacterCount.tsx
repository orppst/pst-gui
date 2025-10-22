import {DIMMED_FONT_WEIGHT, MAX_CHARS_FOR_INPUTS} from "../constants";
import {ReactElement} from "react";
import {Box} from "@mantine/core";


/**
 * used by the MaxCharsForInputRemaining function.
 *
 * @param {number} length: the current length of the string.
 * @param {number} limit: optional value for the max length limit, defaults to MAX_CHARS_FOR_INPUT
 */
interface CharCountInputProps {
    length: number
    limit?: number
}

/**
 * Renders a characters remaining box, based on MAX_CHARS_FOR_INPUTS or the provided limit
 *
 * @param {CharCountInputProps} props the number of characters entered and optional max limit
 * @return {ReactElement} a Mantine Box element containing the number of chars remaining
 * @constructor
 */
export default function MaxCharsForInputRemaining(props: CharCountInputProps): ReactElement {
    return (<Box ta="right" fz={"sm"} c={"dimmed"} fw={DIMMED_FONT_WEIGHT}>
        Characters remaining:
        {(props.limit ?? MAX_CHARS_FOR_INPUTS) - props.length}
    </Box>)
}