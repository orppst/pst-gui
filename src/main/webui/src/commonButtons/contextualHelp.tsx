import { useState } from "react";
import { contextualHelpMessages } from "../../public/contextualHelpMessages.jsx";

export function ContextualHelpButton(propsMessage) {

  const [showingHelp, setShowingHelp] = useState(false);
  const [messageFound, setMessageFound] = useState(false);

// need to trap when no message is found !

const [myExtract, setMyExtract] = useState("");

    const userLang = "-eng" // har-coded for now, ideally captured from user, needs model change or cookie

    const singleMessage = contextualHelpMessages.filter(aMessage =>
        aMessage.id === propsMessage.messageId + userLang
      );

// need to sort out a key for this...
      const listMessageItems = singleMessage.map(aMessage =>
       <p>{aMessage.message}</p>
      );

      const extractedRecord = listMessageItems;

  function AssembleContextualHelp () {

            setMessageFound(extractedRecord.length !== 0);
      setShowingHelp(!showingHelp);

       }

   const displayHelp = extractedRecord;

       const clearHelp = "";
       const labelClearHelp = "Clear Help";
       const labelShowHelp = "Show Help";

    return (

    <>
        <button type="button" onClick={() => AssembleContextualHelp()}>
                        {showingHelp ? labelClearHelp : labelShowHelp}
        </button>
        <div className="display-linebreak" >
            <p>  {showingHelp ? displayHelp : clearHelp} </p>

         </div>
    </>

    )
}

