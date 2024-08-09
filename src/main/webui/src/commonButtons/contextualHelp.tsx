import {useState} from "react";
import {Button, Grid, Space} from '@mantine/core';

import {contextualHelpMessages} from "../../public/contextualHelpMessages.jsx";

export function ContextualHelpButton(props : {messageId : string}) {

  const [showingHelp, setShowingHelp] = useState(false);

  const userLang = "-eng"; // hard-coded for now, ideally captured from user

  const singleMessage = contextualHelpMessages.filter(aMessage =>
        aMessage.id === props.messageId + userLang
      );

// need to trap when no message is found...

   const displayHelp = singleMessage.map(aMessage =>
       <ul key={aMessage.id}>
           <>{aMessage.message}</>
       </ul>
   );
   const clearHelp = "";
   const labelClearHelp = "Clear Help";
   const labelShowHelp = "Show Help";

    return (

        <>
        <Space h={"xl"}/>
        <Grid >
           <Grid.Col span={10}></Grid.Col>
           <Button
               rightSection={<IconInfoCircle size={ICON_SIZE}/>}
               color="cyan"
               variant={"subtle"}
               onClick={() => {setShowingHelp(!showingHelp)}}>
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