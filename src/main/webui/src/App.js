import "bootstrap/dist/css/bootstrap.css";
import "./App.css";
import React, {Component} from 'react';
import { BrowserRouter as Router, Switch, Route, Link, useRouteMatch, useParams } from "react-router-dom";
import { useHistory } from 'react-router-dom';
import Auth from "./Auth";
import Menu from "./Menu";
import AddProposal from "./proposal/Add"

export default function App() {
  return (
    <Router>
      <div>
        <h2>Main menu</h2>
        <ul>
          <li>
            <Link to="/">Login</Link>
          </li>
          <li>
            <Link to="/proposal/add">New proposal</Link>
          </li>
          <li>
            <Link to="/help">Help</Link>
          </li>
        </ul>
        <Switch>
          <Route path="/proposal/add">
            <Add />
          </Route>
          <Route path="/help">
            <Help />
          </Route>
          <Route path="/">
            <Login />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

function Login() {
  return <h2><Auth /></h2>;
}

function Add() {
  return <h2><AddProposal /></h2>;
}

function Help() {
  let match = useRouteMatch();

  return (
    <div>
      <h3>Help</h3>

      <ul>
        <li>
          <Link to={`${match.url}/proposals`}>Proposals</Link>
        </li>
        <li>
          <Link to={`${match.url}/authentication`}>
            Authentication
          </Link>
        </li>
      </ul>

      {/* The Topics page has its own <Switch> with more routes
          that build on the /topics URL path. You can think of the
          2nd <Route> here as an "index" page for all topics, or
          the page that is shown when no topic is selected */}
      <Switch>
        <Route path={`${match.path}/:topicId`}>
          <Help />
        </Route>
        <Route path={match.path}>
          <h3>Please select a help topic.</h3>
        </Route>
      </Switch>
    </div>
  );
}

function Topic() {
  let { topicId } = useParams();
  return <h3>Requested topic ID: {topicId}</h3>;
}
