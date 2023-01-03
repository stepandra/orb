import { useEffect, useState } from 'react';
import { InnerHtml } from './innerHtml';
import { Shaders } from './Shaders'
import { useScript } from '@hooks/useScript';

export function PlanetGenerator(props) { 
  useScript('/assets/js/jquery-3.2.0.min.js');
  useScript('/assets/js/seedrandom.js')
  useScript('/assets/js/webgl/fxhash.js')
  useScript('/assets/js/webgl/main.js')
  useScript('/assets/js/bundle.js')

  const [ shouldRenderPlanet, setShouldRenderPlanet ] = useState(false)

  const updatePlanet = () => {
    localStorage.setItem('fxHash', props.mint_hash)
    window?.fxHashGen()
    window?.main()
    window?.initPlanet(props.mint_hash);
    window?.bundle()
  }

  useEffect(() => {
    const tryLoadPlanet = () => {
      try {
        updatePlanet()
      } catch(e) {
        setTimeout(() => {
          tryLoadPlanet()
        }, 500)
      }
    }

    setTimeout(() => {
      setShouldRenderPlanet(true)
      tryLoadPlanet()
    }, 0)

  }, [props.mint_hash])

  return (
    <>
      <Shaders />
      {!props.mint_hash && <p style={{ position: 'absolute', top: '50%' }}>Loading NFT, please wait...</p>}
      { shouldRenderPlanet && <div id="planetCanvas" dangerouslySetInnerHTML={InnerHtml} ></div> }
    </>
  )
}
