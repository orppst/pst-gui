import { ReactElement, useState } from 'react';
import { Select, Textarea} from '@mantine/core';
import {
    fetchOpticalTelescopeResourceGetNames,
    fetchOpticalTelescopeResourceGetTelescopeData,
    Field, Type, fetchOpticalTelescopeResourceLoadTelescopeData,
    Telescope, SavedTelescopeData
} from '../../util/telescopeComms';
import { UseFormReturnType } from '@mantine/form';
import { ObservationFormValues } from './edit.group';
import {useParams} from "react-router-dom";
import { MAX_CHARS_FOR_INPUTS, TEXTAREA_MAX_ROWS } from '../../constants';
import { notifyError } from '../../commonPanel/notifications';

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
    const [selectedTelescope, setSelectedTelescope] = useState<string | null>(null);
    const [selectedInstrument, setSelectedInstrument] =
        useState<Map<string, Map<string, string>> | null>(null);
    const [getNames, setNames] = useState(["None"]);
    const [getTelescopeData, setTelescopeData] =
        useState<Map<string, Telescope> | null>(null);

    // data holder for the user choices from the back end.
    let userData: Map<string, Map<string, Map<string, string>>> =
        new Map<string, Map<string, Map<string, string>>>();

    /**
     * extract data from back end on the telescope names.
     * only do this once. rest of renders shouldn't call this.
     */
    if (getNames.length == 1) {
        fetchOpticalTelescopeResourceGetNames().then((serverTelescopeNames: string[]) => {
            // populate telescope names for html display.
            setNames(getNames.concat(serverTelescopeNames));
        });
    }

    /**
     * extract data from the back end on the telescope options.
     * only do this once. rest of renders shouldn't call this.
     */
    if (getTelescopeData == null) {
        fetchOpticalTelescopeResourceGetTelescopeData().then(
            (backendTelescopeData: Map<string, Map<string, Map<string, string>>>) => {
                setTelescopeData(new Map(Object.entries(backendTelescopeData)));

                // ensure the telescope data is extracted before asking for the user data.
                fetchOpticalTelescopeResourceLoadTelescopeData(
                    {
                        observationID: form.getValues().observationId!.toString(),
                        proposalID: selectedProposalCode!
                    })
                    .then(
                        (userDataRaw: SavedTelescopeData) => {
                            processUserData(userDataRaw, new Map(Object.entries(backendTelescopeData)));
                        }
                    );
            }
        );
    }

    /**
     * processes user stored data into the form.
     * @param {Map<string, Map<string, Map<string, string>>>} userDataRaw: the loaded data.
     * @param storedTelescopeData: the stored telescope states.
     */
    function processUserData(
            userDataRaw: SavedTelescopeData,
            storedTelescopeData: Map<string, Telescope>): void {
        userData = new Map(Object.entries(userDataRaw));

        // fill out forms
        if(form.getInputProps("telescopeName").value == null && userData.size != 0) {
            form.setValues({
                "telescopeName": userData?.keys().next().value ?
                    userData?.keys().next().value : 'None',
                "instrument": new Map(Object.entries(userData?.get(
                    userData?.keys().next().value))).keys().next().value ?
                    new Map(Object.entries(userData?.get(
                        userData?.keys().next().value))).keys().next().value : 'None',
            });
        }

        // state holder to force re renders
        if (selectedTelescope == null) {
            let telescopeState = null;
            let instrumentState = null;
            if (userData.size !== 0 && !form.isDirty("elements")) {
                telescopeState = userData.keys().next().value
                instrumentState = new Map(Object.entries(userData.get(
                    userData.keys().next().value))).keys().next().value;

                if (telescopeState == form.getInputProps("telescopeName").value &&
                    instrumentState == form.getInputProps("instrument").value) {
                    const elements: Map<string, string> =
                        new Map(Object.entries(new Map(Object.entries(
                            userData.get(telescopeState))).get(instrumentState)));

                    // extract the data types for these elements. as booleans need conversions.
                    const elementDataTypes = new Map(Object.entries(
                        new Map(Object.entries(
                            new Map(Object.entries(
                                storedTelescopeData.get(telescopeState)))
                            .get("instruments")))
                        .get(instrumentState).elements));

                    // set the form based off the data type.
                    for (const elementName of elements.keys()) {
                        switch(elementDataTypes.get(elementName).type) {
                            case Type.TEXT:
                            case Type.LIST:
                                form.getInputProps("elements").value.set(
                                    elementName, elements.get(elementName));
                                break;
                            case Type.BOOLEAN:
                                form.getInputProps("elements").value.set(
                                    elementName, elements.get(elementName) == "true");
                                break;
                            default:
                                notifyError("none recognised type %s",
                                            elementDataTypes.get(elementName).type);
                                break;
                        }
                    }
                } else {
                    userData = new Map<string, Map<string, Map<string, string>>>();
                }
            } else {
                userData = new Map<string, Map<string, Map<string, string>>>();
            }
            setSelectedTelescope(telescopeState);
            setSelectedInstrument(instrumentState);
        }

        // update elements form, but only if a telescope and instrument has been populated.
        setupElementsInForm(selectedTelescope, selectedInstrument);
    }

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

    /**
     * extracts the telescope data for a given instrument.
     * @param {string} telescopeName: the telescope name.
     * @param {string} instrumentName: the instrument name.
     * @return {Map<string, Map<string, string>> | undefined} data.
     */
    function returnElementsFromStore(telescopeName: string, instrumentName: string):
            Map<string, Map<string, string>> {
        if (telescopeName == null || instrumentName == null ||
                getTelescopeData == null) {
            return new Map<string, Map<string, string>>();
        }

        const telescopeData = getTelescopeData.get(telescopeName);

        // manage None state.
        if(telescopeData == undefined) {
            return new Map<string, Map<string, string>>();
        }

        // got data.
        const telescopeDataMap: Map<string, unknown> =
            new Map(Object.entries(telescopeData));
        const instrumentData = new Map(Object.entries(
            telescopeDataMap.get("instruments"))).get(instrumentName);

        if (instrumentData == undefined) {
            return new Map<string, Map<string, string>>();
        }
        return instrumentData;
    }

    /**
     * populates the form with elements.
     * @param telescopeName: the name of the telescope.
     * @param instrumentName: the name of the instrument.
     */
    function setupElementsInForm(
            telescopeName: string, instrumentName: string): void {
        //populate the form with new states.
        const elementData: Map<string, Map<string, string>> =
            returnElementsFromStore(telescopeName, instrumentName);
        if (elementData.size == 0) {
            return;
        }

        // convert to map.
        const elementsDataMap = new Map(Object.entries(elementData));

        // extract the saved state for this telescope if it exists.
        let userStoresObservationElements = undefined;
        if (userData.size !== 0) {
            userStoresObservationElements = userData.get(telescopeName);
            if (userStoresObservationElements !== undefined) {
                // convert to proper map.
                userStoresObservationElements =
                    new Map(Object.entries(userStoresObservationElements));
                userStoresObservationElements =
                    userStoresObservationElements.get(instrumentName);
                if (userStoresObservationElements !== undefined) {
                    userStoresObservationElements =
                        new Map(Object.entries(userStoresObservationElements));
                }
            } else {
                userStoresObservationElements = undefined;
            }
        }

        // cycle and add new elements.
        const elementNames = new Map(Object.entries(elementsDataMap.get("elements")));
        for (const elementName of elementNames.keys()) {
            let storedValue = "None";

            // no saved data.
            if (userStoresObservationElements == undefined) {
                switch(elementNames.get(elementName).type) {
                    case Type.LIST:
                        // set to the first value
                        form.getInputProps("elements").value.set(
                            elementName, elementNames.get(elementName).values[0]);
                        break;
                    case Type.TEXT:
                        if (form.getInputProps("elements").value.get(elementName) == undefined) {
                            form.getInputProps("elements").value.set(elementName, "");
                        }
                        break;
                    case Type.BOOLEAN:
                        form.getInputProps("elements").value.set(elementName, false);
                        break;
                    default:
                        notifyError("none recognised type %s", elementNames.get(elementName).type);
                        break;
                }
            // got saved data.
            } else {
                storedValue = userStoresObservationElements.get(elementName);
                switch(elementNames.get(elementName).type) {
                    case Type.LIST:
                    case Type.TEXT:
                        if (form.getInputProps("elements").value.get(elementName) == undefined) {
                            form.getInputProps("elements").value.set(elementName, storedValue);
                        }
                        break
                    case Type.BOOLEAN:
                        if (form.getInputProps("elements").value.get(elementName) == undefined) {
                            form.getInputProps("elements").value.set(elementName, storedValue == "true");
                        }
                        break;
                    default:
                        notifyError("none recognised type %s", elementNames.get(elementName).type);
                        break;
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

        // reset elements in form.
        setupElementsInForm(selectedTelescope, value);

        // sets the state variables to force a re-render.
        setSelectedInstrument(value);
        form.setDirty('elements');

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
    function handleBooleanChange(key: string, value: boolean): void {
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
        if (selectedTelescope == null || getTelescopeData == null || selectedTelescope == "None") {
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
        const elementsData: Map<string, Map<string, string>> =
            returnElementsFromStore(selectedTelescope, selectedInstrument);
        if (elementsData.size == 0) {
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
                        notifyError("none recognised type %s", element.type);
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