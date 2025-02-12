import {ReactElement, useState} from "react";
import {Select} from "@mantine/core";
import * as React from "react";

export default
function ObservationModeDetailsShow(p: {
    allModes: {value: string, label: string}[],
    selectedModes: {value: string, label: string}[],
    setSelectedModes:  React.Dispatch<React.SetStateAction<{value: string,label: string }[]>>
}) : ReactElement {

    const [mode, setMode] = useState<{value: string, label: string}>()

    return(
        <>
            <Select
                placeholder={"select mode"}
                data={p.allModes}
                value={mode ? mode.value : null}
                onChange={(_value, option) => {
                    setMode(option)
                    if (option)
                        p.setSelectedModes([option])
                    else
                        p.setSelectedModes(p.allModes)
                }}
            />
        </>
    )
}