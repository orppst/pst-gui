import { ReactElement } from 'react';
import { Box, Select } from '@mantine/core';
import {
    useOpticalTelescopeResourceGetNames,
    useOpticalTelescopeResourceGetTelescopeData,
    useOpticalTelescopeResourceLoadTelescopeData
} from '../../util/telescopeCommsMock';
import { JSON_SPACES } from '../../constants';
import { PanelHeader } from '../../commonPanel/appearance';
import { LoadTelescopeState, SavedTelescopeData } from '../../util/telescopeComms';
import { UseFormReturnType } from '@mantine/form';
import { ObservationFormValues } from './edit.group';

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
    const { data: ReceivedTelescopeNames, error: TelescopeNameError,
            isLoading: telescopeNameIsLoading} =
        useOpticalTelescopeResourceGetNames();

    /**
     * extract data from the back end on the telescope options.
     */
    const { data: ReceivedTelescopes, error: TelescopeDataError,
            isLoading: telescopeDataIsLoading} =
        useOpticalTelescopeResourceGetTelescopeData();

    /**
     * extract current choices.
     */
    const { data: SavedTelescopeData, error: TelescopeLoadError} =
        useOpticalTelescopeResourceLoadTelescopeData(
            { observationID: observationID.toString(), proposalID: proposalID.toString()});

    // cover any errors.
    if (TelescopeNameError) {
        return (
            <Box>
                <pre>{JSON.stringify(TelescopeNameError, null, JSON_SPACES)}</pre>
            </Box>
        );
    }
    if (TelescopeDataError) {
        return (
            <Box>
                <pre>{JSON.stringify(TelescopeDataError, null, JSON_SPACES)}</pre>
            </Box>
        );
    }
    if (TelescopeLoadError) {
        return (
            <Box>
                <pre>{JSON.stringify(TelescopeLoadError, null, JSON_SPACES)}</pre>
            </Box>
        );
    }

    // add the telescope names to the list.
    const telescopeNames = ["None"]
    telescopeNames.concat(ReceivedTelescopeNames.names);
    form

    // return the generated HTML.
    return (
        <>
            <form>
                <PanelHeader
                    itemName={"optical telescopes."}
                    panelHeading={"Optical Telescopes"}
                    isLoading={telescopeNameIsLoading || telescopeDataIsLoading}
                />

                <Select
                    label={"Telescope Name: "}
                    placeholder={"Select the optical telescope"}
                    data = {telescopeNames}
                    {...form.getInputProps('telescopeName')}
                />
            </form>



        </>
    );
}