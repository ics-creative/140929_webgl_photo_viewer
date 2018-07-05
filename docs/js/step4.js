var demo;
(function (demo) {
    var DeviceOrientationTest = (function () {
        function DeviceOrientationTest() {
            this._consoleText = document.getElementById("consoleText");
            this.eventSetting();
        }
        /** 各種イベント設定 */
        DeviceOrientationTest.prototype.eventSetting = function () {
            var _this = this;
            window.addEventListener("deviceorientation", function (event) {
                return _this.onRotationChange(event);
            });
        };

        /** デバイスの傾きが変わった時 */
        DeviceOrientationTest.prototype.onRotationChange = function (event) {
            var alpha = Math.floor(event.alpha);
            var beta = Math.floor(event.beta);
            var gamma = Math.floor(event.gamma);
            var compassHeading = Math.floor(event.webkitCompassHeading);

            this._consoleText.innerHTML = "z軸の傾き alpha : " + alpha + "<br>" + "方位 CompassHeading : " + compassHeading + "<br>" + "x軸の傾き beta : " + beta + "<br>" + "y軸の傾き gamma : " + gamma;
        };
        return DeviceOrientationTest;
    })();
    demo.DeviceOrientationTest = DeviceOrientationTest;
})(demo || (demo = {}));

window.addEventListener("load", function () {
    new demo.DeviceOrientationTest();
});
//# sourceMappingURL=step4.js.map
