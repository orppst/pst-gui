import { useState } from "react";
import { Button, Grid, Space } from '@mantine/core';

import {contextualHelpMessages} from "../../public/contextualHelpMessages.jsx";

export function ContextualHelpButton(props : {messageId : string}) {

  const [showingHelp, setShowingHelp] = useState(false);

  const userLang = "-eng"; // hard-coded for now, ideally captured from user

  const singleMessage = contextualHelpMessages.filter(aMessage =>
        aMessage.id === props.messageId + userLang
      );

// need to trap when no message is found...

  const listMessageRow = singleMessage.map(aMessage =>
      <ul key={aMessage.id}>
      <>{aMessage.message}</>
      </ul>
      );

   const extractedRecord = listMessageRow;
   const displayHelp = extractedRecord;
   const clearHelp = "";
   const labelClearHelp = "Clear Help";
   const labelShowHelp = "Show Help";

    return (

        <>
        <Space h={"xl"}/>
        <Grid >
           <Grid.Col span={10}></Grid.Col>
           <Button color="cyan" onClick={() => {setShowingHelp(!showingHelp)}}>
               {showingHelp ? labelClearHelp : labelShowHelp}
           </Button>
        </Grid>
        <Space h={"xl"} />
        <div className="display-linebreak" >
           {showingHelp ? displayHelp : clearHelp}
        </div>
        <Space />
        </>
    )
}