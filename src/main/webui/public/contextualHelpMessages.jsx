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
    },
  {
    id: "Overview-eng",
    message: " "
          + " An overview of the selected proposal is shown below."
          + " You may 'Export' this proposal, which provides a downloaded zip file containing this proposal as JSON, any supporting documents you may have uploaded, and a screen shot of this overview."
          + " You can 'Clone' this proposal, which will create a deep copy as a new proposal."
          + " If you've decided that this proposal is no longer worth pursuing then you may 'Delete' it."
          + " This will remove this proposal permanently."
  }, {
    id: "CreaProp-eng",
    message: " "
         + " You must provide a title and a summary for your new proposal, and select it's 'Kind'."
         + " After they have been entered, you can create the new proposal by clicking the Save button."
         + " You may cancel this action with the Cancel button, which will take you back to the landing page."
  }, {
    id: "MaintTitle-eng",
    message: " Add or edit the title below."
           + " Save your changes with the Save button at bottom right, or cancel and return without saving by clicking the Cancel button."
  }, {
    id: "MaintSum-eng",
    message: " Add or edit the summary below."
           + " Save your changes with the Save button at bottom right, or cancel and return without saving by clicking the Cancel button."
  }, {
    id: "MaintInvestList-eng",
    message: " "
         + " Add a new investigator by clicking the Add button at the bottom right of the list."
         + " Remove an investigator by clicking the Delete button in the same row."
  }, {
    id: "MaintInvestAdd-eng",
    message: " "
         + " Find a new investigator by entering their email address."
         + " If not found, please contact them to ensure they are registered on Polaris with that email."
         + " They will automatically be assigned as a co-investigator."
         + " Tick the PhD box if this work forms part of their PhD."
         + " Save your changes with the Save button at bottom right, or cancel and return without saving by clicking the Cancel button."
  }, {
    id: "MaintJustList-eng",
    message: " "
         + " Here you input the texts for your scientific and technical justifications, as well as uploading any resource files (images and a single bibtex - renamed to \"refs.bib\" in the backend)."
    + " The texts will be inserted into a LaTex file in the backend, under a corresponding section header, ready to be compiled to a PDF."
    + " For more detailed help see the 'Help' tab below."

  }, {
    id: "MaintSciJust-eng",
    message: " "
         + " State briefly the justification for your proposal."
         + " This must not include details that should be captured elsewhere in Polaris."
         + " Save your changes with the Save button at bottom right, or cancel and return without saving by clicking the Cancel button."
  }, {
    id: "MaintTechJust-eng",
    message: " "
        + " State briefly the justification for your proposal."
        + " This must not include details that should be captured elsewhere in Polaris."
        + " Save your changes with the Save button at bottom right, or cancel and return without saving by clicking the Cancel button."
  }, {
    id: "MaintTargList-eng",
    message: "You may add a single target at a time or provide a list of targets via a file upload."
        + " File formats supported are VOTable xml, AstroPy ecsv (or just csv), and comma-seperated plain text (txt)."
        + " The data must consist of the target 'name' and the RA,Dec coordinates in degrees."
        + " Please note that in all cases we assume that the reference system is 'ICRS' and the epoch is 'J2000.0'."
  }, {
    id: "MaintTarg-eng",
    message: " You must enter a unique target name, its coordinates and their Standard Epoch."
    + " Alternatively, having entered a known target, you can browse for its details using the Lookup button, "
    + " which will fill those values for you if the target can be found in Simbad."
    + " Another possibility, having entered a known target, is to drag the window until the cross-wires are over your desired target."
    + " Releasing the left-click button will populate the details of that location too."
    + " Save your changes with the Save button at bottom right, or cancel and return without saving by clicking the Cancel button."
  }, {
    id: "MaintTechGoalList-eng",
    message: " "
         + " To add a new technical goal click the Add button at bottom right."
         + " To edit an existing technical goal click the Edit button in the row,"
         + " or to remove it click the Delete button."
         + " You can make a copy of any existing technical goal by clicking its Copy button."
  }, {
    id: "MaintTechGoal-eng",
    message: " "
        + " You must provide values and units for the following performance parameters:"
        + " - angular resolution; largest scale; sensitivity; and spectral point."
        + " Spectral windows are optional."
  }, {
    id: "MaintTechGoalSpectralWindows-eng",
    message: " "
        + " Spectral windows are optional. Click 'Add' to bring up a window form. "
        + " You must enter values and units for the start, end, and resolution, as well as polarization, of the window."
        + " You may add multiple windows. "
        + " If 'Save' is enabled this will also capture the Performance Parameter input values you entered."
  }, {
    id: "MaintObsFieldList-eng",
    message: " "
         + " To add a new observation field click the Add button at bottom right."
         + " To edit an existing observation field click the Edit button in the row,"
         + " or to remove it click the Delete button."
         + " (You can't delete a field that is in use.)"
  }, {
    id: "MaintObsField-eng",
    message: " Enter a unique field name and select its type."
           + " Save your changes with the Save button at bottom right, or cancel and return without saving by clicking the Cancel button."
  }, {
    id: "MaintObsList-eng",
    message: " "
         + " To add a new observation click the Add button at bottom right."
         + " To edit an existing observation click the Edit button in the row,"
         + " or to remove it click the Delete button."
         + " You can make a copy of any existing observation by clicking its Copy button."
  }, {
    id: "MaintObs-eng",
    message: " "
        + " Select the 'type' observation, either 'Target' or 'Calibration'. "
        + " A 'Calibration Observation' requires you pick an intended use e.g., Pointing, Bandpass, etc."
        + " You must select at least one Target, and exactly one Technical Goal. "
        + " 'Timing Windows' are optional. If you must provide one then you have to define both start and end dates-times for the window. "
        + " Notice that the end date-time must be after the start date-time. "
        + " The semantics of the avoid flag is to communicate a timing window that must be avoided for this observation. You may also add a brief optional note."
  }, {
    id: "ManageDocs-eng",
    message: " "
           + " Upload a document by clicking Choose a file, or cancel your request by clicking the Cancel button."
  }, {
    id: "ManageSubmit-eng",
    message: " "
           + " Select a cycle and confirm your request with the Submit proposal button at bottom right, or cancel and return without submitting by clicking the Cancel button."
  }, {
    id: "ManageSubmitObservingModes-eng",
    message: "Here you may limit the number of Observing Mode selections by specifying combinations of " +
        "'Instruments', 'Backends', and 'Filters' that you may want for your observations. " +
        "The scrollable list shows you the modes available according to the choices you make. " +
        "Notice that these choices are optional and can be left blank such that all modes are available " +
        "for selection for your observations. "
    }, {
    id: "ManageSubmitObservingModesShow-eng",
    message: "Select an observing mode to see its details i.e., instrument, backend and filter. " +
        "Where appropriate you will also be shown the telescopes that will be used. " +
        "The 'eye' button will toggle the mode details display. " +
        "'Set for all' will set the currently selected observing mode for each observation." +
        "You may also set the observing modes for each observation individually."
  }, {
    id: "ManageSubmitObservingModesFilter-eng",
    message: "Here you may refine the number of selectable Observing Modes by choosing an Instrument, " +
        "Backend and/or Filter. This will limit the choices in the select dropdown inputs below. " +
        "Notice that if you specify all three items you will limit the choice of modes to one (or fewer*); " +
        "an Observing Mode is uniquely defined as a combination of instrument, backend, and filter. " +
        "*Observatories define their observing modes and some combinations will be incompatible."
  }
];

