export const InnerHtml = {
  __html: `
    <canvas id="c" width="800" height="800"></canvas>
    <div style="display:none" id="stats"></div>
    <div style="display:none" id="txt"></div>
    
    <div style="display:none" id="DownloadDiv" style="width: 100% !important; position: absolute;">
        <a download="Planet.png" id="download" onmouseover="writeImageData();" class="button"><img src="/img/planet-download-image.png"><div class="tooltip">Download Image</div></a>
    </div>
  `
}