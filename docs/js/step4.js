const consoleText = document.getElementById("consoleText");
window.addEventListener("deviceorientation", onRotationChange);

/** デバイスの傾きが変わった時 */
function onRotationChange(event) {
  const alpha = Math.floor(event.alpha); // z軸の傾き
  const beta = Math.floor(event.beta); // x軸の傾き
  const gamma = Math.floor(event.gamma); // y軸の傾き

  // 方位の取得(Webkit限定)
  const compassHeading = Math.floor(event.webkitCompassHeading);

  this.consoleText.innerHTML =
    "z軸の傾き alpha : " + alpha + "<br/>" +
    "方位 CompassHeading : " + compassHeading + "<br />" +
    "x軸の傾き beta : " + beta + "<br/>" +
    "y軸の傾き gamma : " + gamma;
}
