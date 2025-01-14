import 'mapbox-gl/dist/mapbox-gl.css';
import React, { Component } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Elemental } from 'react-elemental';
import PiwikReactRouter from 'piwik-react-router';
import { createBrowserHistory } from 'history';
import Root from 'app/react/root';
import store from 'app/redux/store';

const {
  NODE_ENV,
  PIWIK_URL,
  PIWIK_SITE_ID,
  PIWIK_CLIENT_TRACKER_NAME = 'piwik.js',
  PIWIK_SERVER_TRACKER_NAME = 'piwik.php',
} = process.env;

const isProd = NODE_ENV === 'production';

export default class App extends Component {
  constructor(props) {
    super(props);

    // Silence luma.gl and deck.gl logging
    if (isProd) {
      global.luma.log.priority = 0;
      global.deck.log.priority = 0;
    }

    // Sentry initialization

    // Piwik and react-router initialization
    const piwik = PIWIK_URL && isProd && PiwikReactRouter({
      url: PIWIK_URL,
      siteId: PIWIK_SITE_ID,
      clientTrackerName: PIWIK_CLIENT_TRACKER_NAME,
      serverTrackerName: PIWIK_SERVER_TRACKER_NAME,
    });
    const browserHistory = createBrowserHistory();
    this.history = piwik ? piwik.connectToHistory(browserHistory) : browserHistory;
  }

  render() {
    return (
      <Provider store={store}>
        <Elemental>
          <BrowserRouter>
            <Root />
          </BrowserRouter>
        </Elemental>
      </Provider>
    );
  }
}
