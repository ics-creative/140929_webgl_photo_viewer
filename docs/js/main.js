var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
// ライブラリを読み込み
/// <reference path="../libs/stagegl-extensions.next.d.ts" />
var isFileUploadScene = true;
var isMainBuild = false;
var demo;
(function (demo) {
    // Away3Dライブラリを読み込み
    var BitmapData = away.base.BitmapData;
    var View = away.containers.View;

    var DisplayObjectContainer = away.containers.DisplayObjectContainer;
    var Mesh = away.entities.Mesh;
    var DefaultRenderer = away.render.DefaultRenderer;
    var BitmapTexture = away.textures.BitmapTexture;
    var TriangleMethodMaterial = away.materials.TriangleMethodMaterial;

    var PrimitivePlanePrefab = away.prefabs.PrimitivePlanePrefab;
    var RequestAnimationFrame = away.utils.RequestAnimationFrame;
    var HoverController = away.controllers.HoverController;
    var Vector3D = away.geom.Vector3D;
    var Matrix = away.geom.Matrix;

    var Main = (function (_super) {
        __extends(Main, _super);
        function Main() {
            _super.call(this, new DefaultRenderer());
            this._cardLength = 0;
            this._imageList = [];
            this._cardList = [];
            this.CARD_WIDTH = 512;
            this._fileZone = document.getElementById("fileZone");
            var ua = navigator.userAgent;
            this.isSP = ua.indexOf("iPhone") > 0 || ua.indexOf("iPad") > 0 || ua.indexOf("iPod") > 0 || ua.indexOf("Android") > 0;
            this.backgroundColor = 0x333333;
            this.backgroundAlpha = 0;
        }
        /** 初期化処理。HTMLImageの配列を受け取る */
        Main.prototype.init = function (imageList) {
            if (!isMainBuild) {
                isMainBuild = true;
                this.initialize3D();
            } else {
                // 一度作成済みの場合は、一度DisplayObjectを破棄
                this.disposeCards();
            }
            this._imageList = imageList;
            this._cardLength = imageList.length;
            this.initializeCard();
        };

        /** View3Dの基本設定を行う */
        Main.prototype.initialize3D = function () {
            // カメラコントローラー
            this.cameraController = new HoverController();
            this.cameraController.targetObject = this.camera;
            this.cameraController.yFactor = 1;
            this.cameraController.distance = 900;
            this.cameraController.minTiltAngle = -90;
            this.cameraController.maxTiltAngle = 90;
            if (!this.isSP) {
                this.cameraController.tiltAngle = 0;
            } else {
                this.cameraController.wrapPanAngle = true;
            }

            this.eventSetting();

            // レンダリング
            var raf = new RequestAnimationFrame(this.enterFrameHandler, this);
            raf.start();
        };

        /** 写真を作成して立体に配置する */
        Main.prototype.initializeCard = function () {
            this._cardContainer = new DisplayObjectContainer();

            for (var i = 0; i < this._cardLength; i++) {
                this.createCard(i);
            }

            // カードをレイアウト
            this.layoutCard();
            this.scene.addChild(this._cardContainer);

            this._fileZone.className = "off";
            isFileUploadScene = false;

            // canvas用を表示
            var canvas = document.getElementsByTagName("canvas")[0];
            canvas.style.display = "block";

            if (!isMainBuild) {
                this.initialize3D();
            }
        };

        /** 個別の写真を作成する */
        Main.prototype.createCard = function (i) {
            var image = this._imageList[i];
            var resizeRatio;

            // 画像サイズの補正。画像の短辺が、CARD_WIDTHになるようにする。
            if (image.naturalWidth >= image.naturalHeight) {
                resizeRatio = this.CARD_WIDTH / image.naturalHeight;
            } else {
                resizeRatio = this.CARD_WIDTH / image.naturalWidth;
            }

            var bitmapData = new BitmapData(this.CARD_WIDTH, this.CARD_WIDTH, false);
            bitmapData.draw(image, new Matrix(-resizeRatio, 0, 0, resizeRatio, this.CARD_WIDTH));
            var texture = new BitmapTexture(bitmapData);
            var material = new TriangleMethodMaterial(texture);

            var prefab = new PrimitivePlanePrefab(this.CARD_WIDTH, this.CARD_WIDTH, 2, 2, false, true).getNewObject();

            // カードの作成
            var card = prefab;
            card.material = material;
            this._cardList[i] = card;
        };

        /** 写真を3D空間に配置する
        *  配置方法については以下を参考にした。
        *  Spriteを球状に配置するだけ - wonderfl build flash online :
        *  http://wonderfl.net/c/uK8i */
        Main.prototype.layoutCard = function () {
            var zeroPoint = new Vector3D();
            var cardIndex = 0;
            var sphereRadius = 1200;
            var H = Math.floor((2 * sphereRadius * Math.PI) / 2 / this.CARD_WIDTH);
            var angle1 = 0;
            var angle2 = 90;
            for (var i = 0; i < H; i++) {
                angle1 = 0;
                var pn = Math.floor((2 * sphereRadius * Math.cos(angle2 * Math.PI / 180) * Math.PI) / this.CARD_WIDTH);
                for (var j = 0; j < pn; j++) {
                    var rawCard = this._cardList[cardIndex];
                    var card = new Mesh(rawCard.geometry, rawCard.material);
                    card.x = sphereRadius * Math.cos(angle2 * Math.PI / 180) * Math.sin(angle1 * Math.PI / 180);
                    card.y = sphereRadius * Math.sin(angle2 * Math.PI / 180);
                    card.z = sphereRadius * Math.cos(angle2 * Math.PI / 180) * Math.cos(angle1 * Math.PI / 180);
                    this._cardContainer.addChild(card);
                    angle1 += 360 / pn;
                    card.lookAt(zeroPoint);
                    cardIndex++;
                    if (cardIndex >= this._cardLength)
                        cardIndex = 0;
                }
                angle2 -= 180 / H;
            }
        };

        /** 各種イベント設定 */
        Main.prototype.eventSetting = function () {
            var _this = this;
            if (!this.isSP) {
                // デスクトップブラウザでは、ドラッグによる視点移動
                document.addEventListener("mousedown", function (event) {
                    return _this.onMouseDown(event);
                });
                document.addEventListener("mouseup", function (event) {
                    return _this.onMouseUp(event);
                });
                document.addEventListener("mousemove", function (event) {
                    return _this.onMouseMove(event);
                });
            } else if (this.isSP) {
                // スマートフォンブラウザでは、デバイスの傾きによる視点移動
                window.addEventListener("deviceorientation", function (event) {
                    return _this.onRotationChange(event);
                });
            }
            window.addEventListener("resize", function (event) {
                return _this.onResize(event);
            });
            this.onResize();
        };

        /** エンターフレームイベント */
        Main.prototype.enterFrameHandler = function (e) {
            if (typeof e === "undefined") { e = null; }
            this.render();
        };

        /** マウスを押したとき */
        Main.prototype.onMouseDown = function (event) {
            this.lastPanAngle = this.cameraController.panAngle;
            this.lastTiltAngle = this.cameraController.tiltAngle;
            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
            this.isMouseDown = true;

            if (this.isSP) {
                this.cameraController.wrapPanAngle = false;
            }
        };

        /** マウスを離したとき */
        Main.prototype.onMouseUp = function (event) {
            this.isMouseDown = false;
            if (this.isSP) {
                this.cameraController.wrapPanAngle = true;
            }
        };

        /** マウスを動かした時 */
        Main.prototype.onMouseMove = function (event) {
            if (this.isMouseDown) {
                this.cameraController.panAngle = 0.3 * (event.clientX - this.lastMouseX) + this.lastPanAngle;
                this.cameraController.tiltAngle = 0.3 * (event.clientY - this.lastMouseY) + this.lastTiltAngle;
            }
        };

        /** デバイスの傾きが変わった時 */
        Main.prototype.onRotationChange = function (event) {
            if (!this.isMouseDown) {
                var alpha = event.alpha;
                var beta = event.beta;
                var gamma = event.gamma;

                // webkit系では、方位からpanAngleを設定したほうが便利
                this.cameraController.panAngle = event.webkitCompassHeading;

                if (-90 <= gamma && gamma < 90) {
                    this.cameraController.tiltAngle = 90 - beta;
                } else {
                    this.cameraController.tiltAngle = beta - 90;
                }
            }
        };

        /** 画面サイズが変わった時の処理 */
        Main.prototype.onResize = function (event) {
            if (typeof event === "undefined") { event = null; }
            this.y = 0;
            this.x = 0;

            this.width = window.innerWidth;
            this.height = window.innerHeight;

            this.render();

            this.htmlElement.style.width = window.innerWidth + "px";
            this.htmlElement.style.height = window.innerHeight + "px";

            var canvas = document.getElementsByTagName("canvas");
            canvas[0].style.width = window.innerWidth + "px";
            canvas[0].style.height = window.innerHeight + "px";
        };

        // カードの破棄をしたいが、removeChild()が効かないので何もしない。
        Main.prototype.disposeCards = function () {
        };
        return Main;
    })(View);
    demo.Main = Main;
})(demo || (demo = {}));
//# sourceMappingURL=main.js.map
