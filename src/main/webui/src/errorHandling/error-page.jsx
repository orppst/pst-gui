// MWA... lifted straight from this tutorial https://reactrouter.com/en/main/start/tutorial#handling-not-found-errors

import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <center>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>Polaris reports this message <i>{error.statusText || error.message}</i> </p>
      <p>...please report it to the support team.</p>
      </center>
    </div>
  );
}