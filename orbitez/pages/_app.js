import React from 'react';

import ContextProviders from '@context/ContextProviders';

import '../styles/game-gallery.css'
import '../styles/game-index.css'
import '../styles/style.scss'
import '../styles/style-lp.scss'

function MyApp({ Component, pageProps }) {

  return (
    <ContextProviders>
      <Component {...pageProps} />
    </ContextProviders>
  )
}

export default MyApp
