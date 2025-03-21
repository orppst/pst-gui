import { ReactElement, useState } from 'react';
import { Select, Textarea} from '@mantine/core';
import {
    fetchOpticalTelescopeResourceGetNames,
    fetchOpticalTelescopeResourceGetTelescopeData,
    Field, Type, fetchOpticalTelescopeResourceLoadTelescopeData
} from '../../util/telescopeComms';
import { UseFormReturnType } from '@mantine/form';
import { ObservationFormValues } from './edit.group';
import {useParams} from "react-router-dom";
import { MAX_CHARS_FOR_INPUTS, TEXTAREA_MAX_ROWS } from '../../constants';

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

    // state holder to force re renders;
    const [selectedTelescope, setSelectedTelescope] = useState(null);
    const [selectedInstrument, setSelectedInstrument] = useState(null);
    const [getNames, setNames] = useState(["None"]);
    const [getTelescopeData, setTelescopeData] = useState(null);

    // data holder for the user choices from the back end.
    let userSavedObservationData = undefined;

    /**
     * extract data from back end on the telescope names
     */
    fetchOpticalTelescopeResourceGetNames().then((serverTelescopeNames: string[]) => {
        // only save state if it's not been set already.
        if (getNames.length == 1) {
            // populate telescope names for html display.
            setNames(getNames.concat(serverTelescopeNames));
        }
    });

    /**
     * extract data from the back end on the telescope options.
     */
    fetchOpticalTelescopeResourceGetTelescopeData().then(
        (backendTelescopeData: Map<string, Map<string, Map<string, string>>>) => {
            // only save state if its not been saved already.
            if (getTelescopeData == null) {
                setTelescopeData(new Map(Object.entries(backendTelescopeData)));
            }
        }
    );

    fetchOpticalTelescopeResourceLoadTelescopeData(
        { observationID: form.getValues().observationId!,
          proposalID: selectedProposalCode})
    .then(
        (telescopeNameData: Map<string, Map<string, Map<string, string>>>) => {
            userSavedObservationData = new Map(Object.entries(telescopeNameData));

            // state holder to force re renders
            if(selectedTelescope == null) {
                let telescopeState = null;
                let instrumentState = null;
                if (userSavedObservationData !== undefined &&
                        userSavedObservationData.size !== 0 &&
                        !form.isDirty("elements")) {
                    telescopeState = userSavedObservationData.keys().next().value
                    instrumentState = new Map(Object.entries(userSavedObservationData.get(
                        userSavedObservationData.keys().next().value))).keys().next().value;

                    if (telescopeState == form.getInputProps("telescopeName").value &&
                        instrumentState == form.getInputProps("instrument").value) {
                        const elements: Map<string, string> =
                            new Map(Object.entries(new Map(Object.entries(
                                userSavedObservationData.get(telescopeState))).get(instrumentState)));
                        for (const elementName of elements.keys()) {
                            form.getInputProps("elements").value.set(elementName, elements.get(elementName));
                        }
                    } else {
                        userSavedObservationData = new Map<string, Map<string, Map<string, string>>>();
                    }
                } else {
                    userSavedObservationData = new Map<string, Map<string, Map<string, string>>>();
                }
                setSelectedTelescope(telescopeState);
                setSelectedInstrument(instrumentState);
            }
        }
    );

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
    }

    function returnElementsFromStore(): Map<string, Map<string, string>> | undefined {
        if (selectedTelescope == null || selectedInstrument == null || getTelescopeData == null) {
            return undefined;
        }

        const telescopeData = getTelescopeData.get(selectedTelescope);
        const telescopeDataMap: Map<string, unknown> = new Map(Object.entries(telescopeData));
        return new Map(Object.entries(telescopeDataMap.get("instruments"))).get(
            selectedInstrument);
    }

    /**
     * populates the form with elements.
     */
    function setupElementsInForm(): void {
        //populate the form with new states.
        const elementData = returnElementsFromStore();
        if (elementData == undefined) {
            return;
        }

        // convert to map.
        const elementsDataMap = new Map(Object.entries(elementData));

        // extract the telescope
        let userStoresObservationElements = undefined;
        if (userSavedObservationData !== undefined) {
            userStoresObservationElements = userSavedObservationData.get(selectedTelescope);
            if (userStoresObservationElements !== undefined) {
                // convert to proper map.
                userStoresObservationElements =
                    new Map(Object.entries(userStoresObservationElements));
                userStoresObservationElements =
                    userStoresObservationElements.get(selectedInstrument);
            } else {
                userStoresObservationElements = undefined;
            }
        }

        // cycle and add new elements.
        const elementNames = new Map(Object.entries(elementsDataMap.get("elements")));
        for (const elementName of elementNames.keys()) {
            let storedValue = "None";
            if (userStoresObservationElements == undefined) {
                // other types don't transmit values. so if they don't exist. assume empty text will work.
                if (elementNames.get(elementName).values !== undefined &&
                        elementNames.get(elementName).values.length !== 0) {
                    // set to the first value
                    form.getInputProps("elements").value.set(
                        elementName, elementNames.get(elementName).values[0]);
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
    }

    /**
     * saves a boolean change into the form.
     *
     * @param key: element key
     * @param value: element value.
     */
    function handleBooleanChange(key: string, value: string): void {
        form.getInputProps('elements').value.set(key, value);
        form.setDirty({'elements': true});
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
    }

    /**
     * Builds the section for the telescope bespoke fields.
     *
     * @return {React.ReactElement} the html for the bespoke section.
     */
    function telescopeFields(): ReactElement {
        if (selectedTelescope == null || getTelescopeData == null) {
            return <></>
        }
        else {
            const telescopeData = getTelescopeData.get(selectedTelescope);
            const telescopeDataMap = new Map(Object.entries(telescopeData.instruments));
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
        // get the elements and their options.
        const elementsData: unknown = returnElementsFromStore();
        if (elementsData == undefined) {
            return <></>
        }

        // extract elements.
        const elementsDataMap = new Map(Object.entries(elementsData)).get("elements");
        const elementNamesMap = new Map(Object.entries(elementsDataMap));

        // generate the html.
        return <>
            {  Object.keys(elementsDataMap).map((key) => {
                const element: Field = elementNamesMap.get(key) as Field;
                switch (element.type) {
                    case Type.LIST:
                        return <Select
                            label={key}
                            key={selectedTelescope + selectedInstrument + key}
                            placeholder={"Select the telescope instrument"}
                            readOnly={elementNamesMap.get(key).values.length == 1}
                            disabled={elementNamesMap.get(key).values.length == 1}
                            data = {Array.from(elementNamesMap.get(key).values)}
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
                                       defaultValue={form.getInputProps("elements").value.get(key)}
                                       onChange={(e) => {
                                           handleBooleanChange(key, e.target.checked);
                                       }}
                                />
                                {key}
                            </label>
                    default:
                        return <></>
                }
            })}
            </>
    }

    // return the generated HTML.
    return (
        <>
            <Select
                label={"Telescope Name: "}
                placeholder={"Select the optical telescope"}
                data = {getNames}
                {...form.getInputProps('telescopeName') ?
                        form.getInputProps('telescopeName') : "None"}
                onChange = {useTelescopeNameChange}
            />
            {telescopeFields()}
            {instrumentFields()}
        </>
    );
}