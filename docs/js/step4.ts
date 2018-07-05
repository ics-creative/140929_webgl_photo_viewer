module demo {
    export class DeviceOrientationTest {
        // コンソールのテキスト
        private _consoleText:HTMLElement;

        constructor() {
            this._consoleText = document.getElementById("consoleText");
            this.eventSetting();
        }

        /** 各種イベント設定 */
        private eventSetting():void {
            window.addEventListener("deviceorientation", (event:DeviceOrientationEvent) => this.onRotationChange(event));
        }

        /** デバイスの傾きが変わった時 */
        private onRotationChange(event:DeviceOrientationEvent):void {
            var alpha:number = Math.floor(event.alpha);  // z軸の傾き
            var beta:number = Math.floor(event.beta);  // x軸の傾き
            var gamma:number = Math.floor(event.gamma);  // y軸の傾き
            var compassHeading:number = Math.floor(event.webkitCompassHeading); // 方位の取得(Webkit限定)

            this._consoleText.innerHTML =
                "z軸の傾き alpha : " + alpha + "<br>" +
                "方位 CompassHeading : " + compassHeading + "<br>" +
                "x軸の傾き beta : " + beta + "<br>" +
                "y軸の傾き gamma : " + gamma;
        }
    }
}

window.addEventListener("load", function () {
    new demo.DeviceOrientationTest();
});
