import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { transitions, positions, Provider } from "react-alert"
import posterDownloader from './posterDownloader/posterDownloader'
import AlertTemplate from './utilities/AlertTemplate'

const options = {
  timeout: 6000,
  position: positions.TOP_CENTER,
  transition: transitions.FADE
}

export default function App() {
  return (
    <Provider template={AlertTemplate} {...options}>
      <Router>
        <Switch>
          <Route path="/" component={posterDownloader}/>
        </Switch>
      </Router>
    </Provider>
  )
}