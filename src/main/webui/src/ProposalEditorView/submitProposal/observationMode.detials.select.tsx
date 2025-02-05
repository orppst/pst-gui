import {ReactElement} from "react";
import {Select, Stack} from "@mantine/core";

const instruments = [
    {value: '1', label: 'instrument_1'},
    {value: '2', label: 'instrument_2'},
    {value: '3', label: 'instrument_3'},
    {value: '4', label: 'instrument_4'},
]

const backends = [
    {value: '1', label: 'backend_1'},
    {value: '2', label: 'backend_2'},
    {value: '3', label: 'backend_3'},
    {value: '4', label: 'backend_4'},
]

const filters = [
    {value: '1', label: 'filter_1'},
    {value: '2', label: 'filter_2'},
    {value: '3', label: 'filter_3'},
    {value: '4', label: 'filter_4'},
]

export default
function ObservationModeDetailsSelect() : ReactElement {

    return (
        <Stack>
            <Select
                data={instruments}
                placeholder={"Have you ever, ever felt like this?"}
            />
            <Select
                data={backends}
                placeholder={"Have strange things happened,"}
            />
            <Select
                data={filters}
                placeholder={"Are you going round the twist?"}
            />
        </Stack>
    )

}