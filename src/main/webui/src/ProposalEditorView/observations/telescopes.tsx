import { ReactElement, useState } from 'react';
import { Select, Text } from '@mantine/core';
import {
    useOpticalTelescopeResourceGetNames,
    useOpticalTelescopeResourceGetTelescopeData,
    useOpticalTelescopeResourceLoadTelescopeData
} from '../../util/telescopeCommsMock';
import { PanelHeader } from '../../commonPanel/appearance';
import { UseFormReturnType } from '@mantine/form';
import { ObservationFormValues } from './edit.group';
import { ComboboxItem } from '@mantine/core/lib/components/Combobox';
import { Field, Instrument, Type } from '../../util/telescopeComms';

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
    const telescopesData = useOpticalTelescopeResourceGetTelescopeData();

    /**
     * extract current choices.
     */
    const observationData = useOpticalTelescopeResourceLoadTelescopeData(
        { observationID: observationID.toString(),
            proposalID: proposalID.toString()});

    // state holder to force re renders
    const [selectedTelescope, setSelectedTelescope] = useState('None');
    const [selectedInstrument, setSelectedInstrument] = useState('None');

    // function to update the UI based off the telescope name selection.
    function useTelescopeNameChange(value: string | null, option: ComboboxItem): void {
        form?.getInputProps('elements').value.clear();
        setSelectedTelescope(value);
        setSelectedInstrument("None")
    }

    // function to update the UI based off the instrument selection.
    function useTelescopeInstrumentChange(value: string | null, option:ComboboxItem): void {
        form?.getInputProps('elements').value.clear();
        setSelectedInstrument(value);
    }

    /**
     * Builds the section for the telescope bespoke fields.
     *
     * @return {React.ReactElement} the html for the bespoke section.
     */
    function telescopeFields(): ReactElement {
        if (selectedTelescope == "None") {
            return <></>
        }
        else {
            const telescopeData = telescopesData[selectedTelescope];
            const telescopeDataMap = new Map(Object.entries(telescopeData));
            return <Select
                label={"Telescope Instrument:"}
                placeholder={"Select the telescope instrument"}
                data = {Array.from(telescopeDataMap.keys())}
                onChange = {useTelescopeInstrumentChange}
                {...form?.getInputProps('instrument') ?
                    form?.getInputProps('instrument') :
                    telescopeDataMap.keys().next().value}
            />
        }
    }

    /**
     * Builds the section for the telescope instrument bespoke fields.
     *
     * @return {React.ReactElement} the html for the bespoke section.
     */
    function instrumentFields(): ReactElement {
        if (selectedTelescope == "None" || selectedInstrument == "None") {
            return <></>
        }
        else {
            // get the elements and their options.
            const telescopeData = telescopesData[selectedTelescope];
            const telescopeDataMap: Map<string, unknown> = new Map(Object.entries(telescopeData));
            const elementsData: unknown = telescopeDataMap.get(selectedInstrument);
            const elementsDataMap = new Map(Object.entries(elementsData))

            //populate the form with new states.
            for (const [elementName] of elementsDataMap.keys()) {
                let storedValue = "None";
                if (observationData != null && observationData.get(selectedInstrument) != null) {
                    const observationElements: Map<string, string> =
                        observationData.get(selectedInstrument);
                    storedValue = observationElements.get(elementName);
                }
                form?.getInputProps("elements").set(elementName, storedValue);
            }

            // generate the html.
            return <>
                {  Object.keys(elementsData).map((key) => {
                    const element: Field = elementsDataMap.get(key) as Field;
                    switch (element.type) {
                        case Type.LIST:
                            return <Select
                                label={key}
                                placeholder={"Select the telescope instrument"}
                                data = {Array.from(elementsDataMap.get(key).values)}
                                {...form?.getInputProps("elements").get(key) ?
                                    form?.getInputProps("elements").get(key) : ""}
                            />
                        case Type.TEXT:
                            return <Text style={{ whiteSpace: 'pre-wrap',
                                                  overflowWrap: 'break-word'}}>
                                {...form?.getInputProps("elements").get(key) ?
                                    form?.getInputProps("elements").get(key) : ""}
                            </Text>
                        case Type.BOOLEAN:
                            return <label>
                                    <input checked={form?.getInputProps("elements").get(key)}
                                           type="checkbox"/>
                                    {key}
                                </label>
                        default:
                            return <></>
                    }
                })}
                </>
        }
    }

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
            {instrumentFields()}
        </>
    );
}