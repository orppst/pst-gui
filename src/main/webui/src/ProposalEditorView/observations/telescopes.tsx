import { ReactElement, useState } from 'react';
import { Select } from '@mantine/core';
import {
    useOpticalTelescopeResourceGetNames,
    useOpticalTelescopeResourceGetTelescopeData,
    useOpticalTelescopeResourceLoadTelescopeData
} from '../../util/telescopeCommsMock';
import { PanelHeader } from '../../commonPanel/appearance';
import { UseFormReturnType } from '@mantine/form';
import { ObservationFormValues } from './edit.group';
import { ComboboxItem } from '@mantine/core/lib/components/Combobox';
import { notifyError } from '../../commonPanel/notifications';
import getErrorMessage from '../../errorHandling/getErrorMessage';
import { Instrument } from '../../util/telescopeComms';

export interface TelescopeNameFormValues {
    name: string;
}

/**
 * generates the observation panel.
 * @param proposalID: the proposal id.
 * @param observationID: the observation id.
 * @param {UseFormReturnType<ObservationFormValues>} form the
 * form containing all the data to display.
 * @return {ReactElement} the react html for the observation panel.
 * @constructor
 */
export function Telescopes(proposalID: number, observationID: number,
                           form: {form: UseFormReturnType<ObservationFormValues>}):
        ReactElement {
    /**
     * extract data from back end on the telescope names
     */
    const nameData = useOpticalTelescopeResourceGetNames();

    /**
     * extract data from the back end on the telescope options.
     */
    const telescopeDatas = useOpticalTelescopeResourceGetTelescopeData();

    // state holder to force rerenders
    const [selectedTelescope, setSelectedTelescope] = useState('None');

    // function to update the UI based off the telescope name selection.
    function useTelescopeNameChange(value: string | null, option: ComboboxItem): void {
        setSelectedTelescope(value);
        notifyError("Error names",
            "cause: " + getErrorMessage(value));
    }

    /**
     * Builds the section for the telescope bespoke fields.
     *
     * @return {React.ReactElement} the html for the bespoke section.
     */
    function telescopeFields(): ReactElement {
        if (selectedTelescope == "None" || selectedTelescope == undefined) {
            return <></>
        }
        else {
            const telescopeData = telescopeDatas[selectedTelescope];
            const telescopeDataMap = new Map(Object.entries(telescopeData));
            return <Select
                label={"Telescope Instrument:"}
                placeholder={"Select the telescope instrument"}
                data = {Array.from(telescopeDataMap.keys())}
                {...form?.getInputProps('instrument') ?
                    form?.getInputProps('instrument') :
                    telescopeDataMap.keys().next().value}
            />
        }
    }

    /**
     * extract current choices.
     */
    const observationData = useOpticalTelescopeResourceLoadTelescopeData(
        { observationID: observationID.toString(),
            proposalID: proposalID.toString()});

    // add the telescope names to the list.
    let telescopeNames = ["None"]
    telescopeNames = telescopeNames.concat(nameData);

    // return the generated HTML.
    return (
        <>
            <PanelHeader
                itemName={"optical telescopes."}
                panelHeading={"Optical Telescopes"}
                isLoading={false}
            />

            <Select
                label={"Telescope Name: "}
                placeholder={"Select the optical telescope"}
                data = {telescopeNames}
                onChange = {useTelescopeNameChange}
                {...form?.getInputProps('telescopeName') ?
                        form?.getInputProps('telescopeName') : "None"}
            />
            {telescopeFields()}
        </>
    );
}