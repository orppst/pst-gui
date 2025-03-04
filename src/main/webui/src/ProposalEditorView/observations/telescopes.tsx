import { BaseSyntheticEvent, ReactElement, useState } from 'react';
import { Select, Textarea} from '@mantine/core';
import {
    useOpticalTelescopeResourceGetNames,
    useOpticalTelescopeResourceGetTelescopeData,
    useOpticalTelescopeResourceLoadTelescopeData
} from '../../util/telescopeCommsMock';
import { UseFormReturnType } from '@mantine/form';
import { ObservationFormValues } from './edit.group';
import {useParams} from "react-router-dom";
import { Field, Type } from '../../util/telescopeComms';
import { MAX_CHARS_FOR_INPUTS, TEXTAREA_MAX_ROWS } from '../../constants';
import { notifySuccess } from '../../commonPanel/notifications';

/**
 * generates the observation panel.
 * @param {UseFormReturnType<ObservationFormValues>} form the
 * form containing all the data to display.
 * @return {ReactElement} the react html for the observation panel.
 * @constructor
 */
export function Telescopes({form}: {form: UseFormReturnType<ObservationFormValues>}):
        ReactElement {
    const { selectedProposalCode} = useParams();
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
    let userSavedObservationData:  Map<string, Map<string, Map<string, string>>> | undefined =
        useOpticalTelescopeResourceLoadTelescopeData(
            { observationID: form.getValues().observationId!,
                proposalID: selectedProposalCode});

    // state holder to force re renders
    let telescopeState = "None";
    let instrumentState = "None";
    if (userSavedObservationData !== undefined) {
        telescopeState = userSavedObservationData.keys().next().value
        instrumentState = userSavedObservationData.get(
            userSavedObservationData.keys().next().value).keys().next().value;
        const elements: Map<string, string> =
            userSavedObservationData.get(telescopeState).get(instrumentState);
        for (const elementName of elements.keys()) {
            form.getInputProps("elements").value.set(elementName, elements.get(elementName));
        }
    } else {
        userSavedObservationData = new Map<string, Map<string, Map<string, string>>>();
    }

    const [selectedTelescope, setSelectedTelescope] = useState(telescopeState);
    const [selectedInstrument, setSelectedInstrument] = useState(instrumentState);

    // update elements form, but only if a telescope and instrument has been populated.
    setupElementsInForm();

    /**
     *  function to update the UI based off the telescope name selection.
     * @param {string | null} value: the new value of the telescope.
     */
    function useTelescopeNameChange(value: string | null): void {
        form.getInputProps('elements').value.clear();
        form.setDirty('elements');
        form.setFieldValue('telescopeName', value);
        form.setFieldValue('instrument', "None");

        // set the states to force re-renders
        setSelectedInstrument("None")
        setSelectedTelescope(value);
        notifySuccess(
            "new value of telescope name is",
            form.getInputProps('telescopeName').value);
    }

    /**
     * populates the form with elements.
     */
    function setupElementsInForm(): void {
        // update elements form, but only if a telescope and instrument has been populated.
        if (selectedTelescope !== "None" && selectedInstrument !== "None") {
            //populate the form with new states.
            const telescopeData = telescopesData[selectedTelescope];
            const telescopeDataMap: Map<string, unknown> = new Map(Object.entries(telescopeData));
            const elementsData: unknown = telescopeDataMap.get(selectedInstrument);
            const elementsDataMap = new Map(Object.entries(elementsData))

            // extract the telescope
            let userStoresObservationElements = undefined;
            if (userSavedObservationData !== undefined) {
                userStoresObservationElements = userSavedObservationData.get(selectedTelescope);
                if (userStoresObservationElements !== undefined) {
                    userStoresObservationElements =
                        userStoresObservationElements.get(selectedInstrument);
                } else {
                    userStoresObservationElements = undefined;
                }
            }

            // cycle and add new elements.
            for (const elementName of elementsDataMap.keys()) {
                let storedValue = "None";
                if (userStoresObservationElements == undefined) {
                    if (elementsDataMap.get(elementName).values.length !== 0) {
                        // set to the first value
                        if (form.getInputProps("elements").value.get(elementName) == undefined) {
                            form.getInputProps("elements").value.set(
                                elementName, elementsDataMap.get(elementName).values[0]);
                        }
                    } else {
                        // if no options. just set to none.
                        if (form.getInputProps("elements").value.get(elementName) == undefined) {
                            form.getInputProps("elements").value.set(elementName, "");
                        }
                    }
                } else {
                    storedValue = userStoresObservationElements.get(elementName);
                    if (form.getInputProps("elements").value.get(elementName) == undefined) {
                        form.getInputProps("elements").value.set(elementName, storedValue);
                    }
                }
            }
        }
    }

    /**
     * function to update the UI based off the instrument selection.
     * @param {string | null} value: the instrument change.
     */
    function useTelescopeInstrumentChange(value: string | null): void {
        form.setFieldValue('instrument', value);
        form.getInputProps('elements').value.clear();
        form.setDirty('elements');

        // sets the state variables to force a re-render.
        setSelectedInstrument(value)

        // reset elements in form.
        setupElementsInForm();

        // debugger.
        notifySuccess(
            "new value of telescope name is",
            form.getInputProps('instrument').value);
    }

    /**
     * saves a text area change into the form.
     *
     * @param key: element key
     * @param value: element value.
     */
    function handleTextAreaChange(key: string, value: string): void {
        form.getInputProps('elements').value.set(key, value);
        form.setDirty({'elements': true});
        //notifySuccess(
        //    "new value is",
        //    form.getInputProps('elements').value.get(value.target.labels[0].innerText));
    }

    /**
     * saves the state change from the select in the list.
     *
     * @param {string} key: the element name.
     * @param {string} value: the new value.
     */
    function handleSelectChange(key: string, value: string): void {
        form.getInputProps('elements').value.set(key, value);
        form.setDirty({'elements': true});
        notifySuccess(
            `new select value is ${key}`,
            form.getInputProps('elements').value.get(key));
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
                {...form.getInputProps('instrument') ?
                    form.getInputProps('instrument') :
                    telescopeDataMap.keys().next().value}
                onChange = {useTelescopeInstrumentChange}
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

            // generate the html.
            return <>
                {  Object.keys(elementsData).map((key) => {
                    const element: Field = elementsDataMap.get(key) as Field;
                    switch (element.type) {
                        case Type.LIST:
                            return <Select
                                label={key}
                                key={selectedTelescope + selectedInstrument + key}
                                placeholder={"Select the telescope instrument"}
                                data = {Array.from(elementsDataMap.get(key).values)}
                                defaultValue={form.getInputProps("elements").value.get(key)}
                                onChange={(e) => {
                                    handleSelectChange(key, e);
                                }}
                            />
                        case Type.TEXT:
                            return <Textarea label={key}
                                             rows={TEXTAREA_MAX_ROWS}
                                             maxLength={MAX_CHARS_FOR_INPUTS}
                                             key={selectedTelescope + selectedInstrument + key}
                                             defaultValue={form.getInputProps("elements").value.get(key)}
                                             onChange={(e) => {
                                                 handleTextAreaChange(key, e.target.value);
                                             }}
                            />
                        case Type.BOOLEAN:
                            return <label key={"label for" + key}>
                                    <input checked={form.getInputProps("elements").value.get(key)}
                                           type="checkbox"
                                           key={selectedTelescope + selectedInstrument + key}
                                           defaultValue={form.getInputProps("elements").value.get(key)}/>
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
            <Select
                label={"Telescope Name: "}
                placeholder={"Select the optical telescope"}
                data = {telescopeNames}
                {...form.getInputProps('telescopeName') ?
                        form.getInputProps('telescopeName') : "None"}
                onChange = {useTelescopeNameChange}
            />
            {telescopeFields()}
            {instrumentFields()}
        </>
    );
}