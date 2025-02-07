import {ReactElement, useState} from "react";
import {ComboboxItem, Select, Stack} from "@mantine/core";


type SelectData = {
    value: string,
    label: string
}

const allInstruments = [
    {value: '1', label: 'instrument_1'},
    {value: '2', label: 'instrument_2'},
    {value: '3', label: 'instrument_3'},
    {value: '4', label: 'instrument_4'},
]

const allBackends = [
    {value: '1', label: 'backend_1'},
    {value: '2', label: 'backend_2'},
    {value: '3', label: 'backend_3'},
    {value: '4', label: 'backend_4'},
]

const allFilters = [
    {value: '1', label: 'filter_1'},
    {value: '2', label: 'filter_2'},
    {value: '3', label: 'filter_3'},
    {value: '4', label: 'filter_4'},
]

//mock some relationships between instruments, backends, and filters.
// e.g., even and odd numbers may not mix
// instrument_1 <--> backend_1 <--> filter_1 okay
// instrument_1 <--> backend_2 <--> filter_1 not okay
// instrument_1 <--> backend_1 <--> filter_3 okay
// instrument_2 <--> backend_2 <--> filter_3 not okay

/*
    Have you ever been on PC Part Picker? Options are unlimited regardless of what you've picked
    previously. A compatibility warning is given if the parts picked aren't compatible.
    This is far less complicated to program then trying to limit options based on previous choices.
 */

function findCompatible (input: string, inArray: SelectData[])
    : SelectData [] {
    if (input.length > 0) {
        //even or odd input thing
        let even : boolean = Number(input.slice(-1)) % 2 === 0;

        //find compatible matches in the array
        return inArray.filter(instrument => {
            let instrumentNum = Number(instrument.label.slice(-1));
            return even ? instrumentNum % 2 === 0 : instrumentNum % 2 === 1;
        });
    } else {
        return inArray;
    }
}

export default
function ObservationModeDetailsSelect() : ReactElement {

    const [instruments, setInstruments] = useState<SelectData[]>(allInstruments);
    const [backends, setBackends] = useState<SelectData[]>(allBackends);
    const [filters, setFilters] = useState<SelectData[]>(allFilters);

    const [instrument, setInstrument] = useState<ComboboxItem | null>(null);
    const [backend, setBackend] = useState<ComboboxItem | null>(null);
    const [filter, setFilter] = useState<ComboboxItem | null>(null);

    return (
        <Stack>
            <Select
                label={"Instruments"}
                placeholder={"pick one"}
                data={instruments}
                value={instrument ? instrument.value : null}
                onChange={(_value, option) => {
                    setBackends(findCompatible(option ? option.label : "", allBackends))
                    setFilters(findCompatible(option ? option.label :  "", allFilters))
                    setInstrument(option)
                }}
            />
            <Select
                label={"Backends"}
                placeholder={"pick one"}
                data={backends}
                value={backend ? backend.value : null}
                onChange={(_value, option) => {
                    setInstruments(findCompatible(option ? option.label : "", allInstruments))
                    setFilters(findCompatible(option ? option.label : "", allFilters))
                    setBackend(option)
                }}
            />
            <Select
                label={"Filters"}
                placeholder={"pick one"}
                data={filters}
                value={filter ? filter.value : null}
                onChange={(_value, option) =>{
                    setBackends(findCompatible(option ? option.label : "", allBackends))
                    setInstruments(findCompatible(option ? option.label : "", allInstruments))
                    setFilter(option)
                }}
            />
        </Stack>
    )

}