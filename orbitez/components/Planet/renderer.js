import React from 'react'
import PropTypes from 'prop-types'

import * as THREE from 'three'
import ReactResizeDetector from 'react-resize-detector'


/**
 * Implements WebGL rendering with <canvas/> and Three.js
 */
class Renderer extends React.Component {

  // props contain user callbacks
  static propTypes = {
    initScene: PropTypes.func,
    onResize: PropTypes.func,
    renderScene: PropTypes.func,
  }

  // default callbacks are no-op
  static defaultProps = {
    initScene: () => {},
    onResize: () => {},
    renderScene: () => {},
  }

  constructor(props, context) {
    super(props, context)
  }

  componentDidMount = () => {
    // At this point, the component has been mounted to the DOM
    // and it is now safe to manipulate the canvas.

    this.canvas = document.getElementById('canvas')

    // Create Three.js renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    })

    // Take WebGLRenderingContext for raw GL operations
    this.gl = this.renderer.context

    // Call user's callback for initialization
    this.props.initScene(this.renderer, this.gl)

    // When browser will be ready to repaint canvas,
    // this.handleAnimationFrame will be called
    this.frameId = requestAnimationFrame(this.handleAnimationFrame)
  }

  componentWillUnmount = () => {
    // At this point, the component is about to be unmounted.
    // Cancel pending amination request.

    cancelAnimationFrame(this.frameId)
  }

  handleResize = (width, height) => {
    // At this point, element has been resized to (width, height)

    // Resize Three.js renderer
    this.renderer.setSize(width, height)

    // Call user's callback for resizing
    this.props.onResize(this.renderer, this.gl, { width, height })
  }

  handleAnimationFrame = () => {
    // At this point, browser is ready to repaint the canvas

    // Call user's callback to render a frame
    this.props.renderScene(this.renderer, this.gl)

    // When browser will be ready to repaint canvas,
    // this.handleAnimationFrame will be called again
    this.frameId = window.requestAnimationFrame(this.handleAnimationFrame)
  }



  render = () => {
    return (
      <>
        <canvas id={'canvas'}/>

        <ReactResizeDetector
          onResize={this.handleResize}
          handleWidth={true}
          handleHeight={true}
        />

        {/*language=CSS*/}
        <style jsx>{`
          #canvas {
            width: 100vw;
            height: 100vh;
            display: block;
          }
        `}</style>
      </>
    )
  }
}

export default Renderer