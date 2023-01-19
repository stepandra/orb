export const renderInner = (server) => ({
    __html: `
    
    <link href="https://fonts.googleapis.com/css?family=Ubuntu:700" rel="stylesheet" type="text/css">

    <div class='popUp__wrapper popUp--connect' id="connecting">
        <div class='popUp__backdrop'></div>
        <div class='popUp'>
            <h2 class='popUp__title'>Connecting</h2>
            <p class='popUp__text'>If you cannot connect to the servers, check if you have some anti virus or firewall blocking the connection.</p>
        </div>
    </div>

    <div class='overlays' id="overlays" style="display: none;">
        <div class='popUp' id="helloDialog">
            <h2 class='popUp__title' id="title">ORBITEZ.IO</h2>

            <!-- <input id="nick" disabled class="form-control" placeholder="Nickname" maxlength="15"> -->
            <select style="display:none" id="gamemode" class="form-control" onchange="setserver(this.value)" required>
                <option value="${server}" selected>ws.orbitez.io</option>
            </select>

            <button class="popUp__btn btn btn--wide btn--center btn-play btn-primary btn-needs-server" id="play-btn">Play</button>

            <div id="settings"></div>

            <p class='popUp__instructions' id="instructions">
                Move your mouse to control your cell<br>
                Press <b>Space</b> to split<br>
                Press <b>W</b> to eject some mass<br>
            </p>
            <p id="footer">Have fun!</p>
        </div>
    </div>

    <div id="mobileStuff" style="display: none;">
        <div id="touchpad"></div>
        <div id="touchCircle" style="display: none;"></div>
        <img src="/img/game-split.png" id="splitBtn">
        <img src="/img/game-eject.png" id="ejectBtn">
    </div>

    <canvas id="canvas" width="800" height="600"></canvas>

    <img style="position:fixed;" id="canvas-bg" src="/img/bg.jpg" />
    <img style="position:fixed;" id="food-png" src="/img/game-food.png" />

    <input class="chatInput" id="chat_textbox" type="text" placeholder="Press enter to chat" maxlength="200">
    <div style="font-family:'Ubuntu'">&nbsp;</div>
`})