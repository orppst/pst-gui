export const contextualHelpMessages = [
     {
      id: "General-eng",
      message: " "
          + " Your own proposals are displayed on the left. You can search for others by title or investigator."
          + " Create a new proposal by clicking the Create a new proposal button,"
          + " or upload a new one in a zip file by clicking the Import button."
          + " To maintain an existing proposal, select it from the list and then choose one of the menu items that appear such as Title, Summary, etc. "
          + " The Polaris system will capture only sufficient information to allow the TAC to make an informed decision on time allocation for a proposal."
          + " The detailed requirements will be negotiated once an allocation has been made."
          + " No viability checks will be made by Polaris, "
          + " it is the PI's responsibility to ensure that the intended Observatory is capable of performing the observations described in the proposal."
    }
, {
  id: "Overview-eng",
  message: " "
          + " An overview of the selected proposal is shown below."
          + " You may 'Export' this proposal, which provides a downloaded zip file containing this proposal as JSON, any supporting documents you may have uploaded, and a screen shot of this overview."
          + " You can 'Clone' this proposal, which will create a deep copy as a new proposal."
          + " If you've decided that this proposal is no longer worth pursuing then you may 'Delete' it."
          + " This will remove this proposal permanently."
}
, {
  id: "CreaProp-eng",
  message: " "
       + " You must provide a title and a summary for your new proposal, and select it's 'Kind'."
       + " After they have been entered, you can create the new proposal by clicking the Save button."
       + " You may cancel this action with the Cancel button, which will take you back to the landing page."
}
, {
  id: "MaintTitle-eng",
  message: " Add or edit the title below."
         + " Save your changes with the Save button at bottom right, or cancel and return without saving by clicking the Cancel button."
}
, {
  id: "MaintSum-eng",
  message: " Add or edit the summary below."
         + " Save your changes with the Save button at bottom right, or cancel and return without saving by clicking the Cancel button."
}
, {
  id: "MaintInvestList-eng",
  message: " "
       + " Add a new investigator by clicking the Add button at the bottom right of the list."
       + " Remove an investigator by clicking the Delete button in the same row."
}

,{
  id: "MaintInvestAdd-eng",
  message: " "
       + " Select a new investigator from the drop-down list."
       + " They will automatically be assigned as a co-investigator."
       + " Tick the PhD box if this work forms part of their PhD."
       + " Save your changes with the Save button at bottom right, or cancel and return without saving by clicking the Cancel button."
}
   , {
  id: "MaintJustList-eng",
  message: " "
       + " Click the Edit button next to the scientific or technical justification summary in order to edit it."

}
   , {
  id: "MaintSciJust-eng",
  message: " "
       + " State briefly the justification for your proposal."
       + " This must not include details that should be captured elsewhere in Polaris."
       + " Save your changes with the Save button at bottom right, or cancel and return without saving by clicking the Cancel button."
}

, {
  id: "MaintTechJust-eng",
  message: " "
      + " State briefly the justification for your proposal."
      + " This must not include details that should be captured elsewhere in Polaris."
      + " Save your changes with the Save button at bottom right, or cancel and return without saving by clicking the Cancel button."
}
, {
  id: "MaintTargList-eng",
  message: " Add a new Target by clicking the Add button at bottom right of the list."
    + " Remove a Target by clicking the Delete button in its row."
    + " Notice that you cannot delete a target that is in use by an 'Observation' (you must first delete the 'Observation)."
}
, {
  id: "MaintTarg-eng",
  message: " You must enter a unique target name, its coordinates and their Standard Epoch."
  + " Alternatively, having entered a known target, you can browse for its details using the Lookup button, "
  + " which will fill those values for you if the target can be found in Simbad."
  + " Another possibility, having entered a known target, is to drag the window until the cross-wires are over your desired target."
  + " Releasing the left-click button will populate the details of that location too."
  + " Save your changes with the Save button at bottom right, or cancel and return without saving by clicking the Cancel button."
}
, {
  id: "MaintTechGoalList-eng",
  message: " "
       + " To add a new technical goal click the Add button at bottom right."
       + " To edit an existing technical goal click the Edit button in the row,"
       + " or to remove it click the Delete button."
       + " You can make a copy of any existing technical goal by clicking its Copy button."
}
, {
  id: "MaintTechGoal-eng",
  message: " "
       + " You must provide values and units for the following performance parameters"
       + " - Angular resolution, Largest scale, Sensitivity, and Spectral point."
       + " Spectral windows are optional, but if you select one you must enter values and units for"
       + " Start, End, and Resolution, as well as polarization."
       + " Save your changes with the Save button at bottom right of the spectral windows, or cancel and return without saving by clicking the Cancel button."
}
, {
  id: "MaintObsFieldList-eng",
  message: " "
       + " To add a new observation field click the Add button at bottom right."
       + " To edit an existing observation field click the Edit button in the row,"
       + " or to remove it click the Delete button."
       + " (You can't delete a field that is in use.)"
}
, {
  id: "MaintObsField-eng",
  message: " Enter a unique field name and select its type."
         + " Save your changes with the Save button at bottom right, or cancel and return without saving by clicking the Cancel button."
}
, {
  id: "MaintObsList-eng",
  message: " "
       + " To add a new observation click the Add button at bottom right."
       + " To edit an existing observation click the Edit button in the row,"
       + " or to remove it click the Delete button."
       + " You can make a copy of any existing observation by clicking its Copy button."
}
, {
  id: "MaintObs-eng",
  message: " "
      + " You must select one Target, and one Technical Goal (Performance parameters), followed by both Observation field and type. "
      + " If your observation type is Calibration, you must choose Calibration intended use."
      + " Timing windows are optional, but if you select one, you must provide start and end dates and times"
      + " (choose the date from the calendar and then select a time from the bottom of the calendar)."
      + " The slider next to the time fields identifies the window as one to be avoided, and you may add a brief note."
      + " Save your changes with the Save button at bottom right of the timing windows, or cancel and return without saving by clicking the Cancel button."
}
, {
  id: "ManageDocs-eng",
  message: " "
         + " Upload a document by clicking Choose a file, or cancel your request by clicking the Cancel button."
}
, {
  id: "ManageSubmit-eng",
  message: " "
         + " Select a cycle and confirm your request with the Submit proposal button at bottom right, or cancel and return without submitting by clicking the Cancel button."
}
, {
  id: "ManageSubmitObservingModes-eng",
    message: "Here you may limit the number of Observing Mode selections by specifying combinations of " +
        "'Instruments', 'Backends', and 'Filters' that you may want for your observations. " +
        "The scrollable list shows you the modes available according to the choices you make. " +
        "Notice that these choices are optional and can be left blank such that all modes are available " +
        "for selection for your observations. "
  },
  {
    id: "ManageSubmitObservingModesShow-eng",
    message: "Select an observing mode to see its details i.e., instrument, backend and filter. " +
        "Where appropriate you will also be shown the telescopes that will be used. " +
        "The 'eye' button will toggle the mode details display. " +
        "'Set for all' will set the currently selected observing mode for each observation." +
        "You may set the observing modes for each observation individually."
  }

];

