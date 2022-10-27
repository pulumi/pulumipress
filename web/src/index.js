import React from 'react';
import ReactDOM from 'react-dom';
import { Navbar, Nav } from 'react-bootstrap'
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Header from './navigation/navigation'
import {withRouter} from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import 'bootstrap/dist/css/bootstrap.min.css';
import { WorkshopsForm } from './workshops/form';
import { WorkshopsList } from './workshops/list';
import { WorkshopEdit } from './workshops/edit';


ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Header />
      <Switch>
        <Route exact path="/" component={App} />
        <Route path="/workshop/new" component={WorkshopsForm} />
        <Route path="/workshop/list" component={WorkshopsList} />
        <Route path="/workshop/edit/:url" component={withRouter((props) => <WorkshopEdit {...props}></WorkshopEdit>)} />
        {/* <Route path="/workshop-edit" component={WorkshopsList} /> */}
      </Switch>
    </Router>
    {/* <App /> */}
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
