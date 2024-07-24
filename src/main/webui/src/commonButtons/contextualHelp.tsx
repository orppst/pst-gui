import { useState } from "react";
import { contextualHelpMessages } from "../../public/contextualHelpMessages.jsx";

export function ContextualHelpButton(props) {

  const [showingHelp, setShowingHelp] = useState(false);

  const userLang = "-eng" // hard-coded for now, ideally captured from user

  const singleMessage = contextualHelpMessages.filter(aMessage =>
        aMessage.id === props.messageId + userLang
      );

// need to trap when no message is found...

// need to sort out a key for this...

      const listMessageItems = singleMessage.map(aMessage =>
       <p>{aMessage.message}</p>
      );

      const extractedRecord = listMessageItems;

  function AssembleContextualHelp () {


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

