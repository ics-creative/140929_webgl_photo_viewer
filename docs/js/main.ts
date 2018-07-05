// ライブラリを読み込み
/// <reference path="../libs/stagegl-extensions.next.d.ts" />
var isFileUploadScene = true;
var isMainBuild = false;
module demo {
    // Away3Dライブラリを読み込み
    import BitmapData = away.base.BitmapData;
    import View = away.containers.View;
    import DisplayObject = away.base.DisplayObject;
    import DisplayObjectContainer = away.containers.DisplayObjectContainer;
    import Mesh = away.entities.Mesh;
    import DefaultRenderer = away.render.DefaultRenderer;
    import BitmapTexture = away.textures.BitmapTexture;
    import TriangleMethodMaterial = away.materials.TriangleMethodMaterial;
    import LoaderEvent = away.events.LoaderEvent;
    import PrimitivePlanePrefab = away.prefabs.PrimitivePlanePrefab;
    import RequestAnimationFrame = away.utils.RequestAnimationFrame;
    import HoverController = away.controllers.HoverController;
    import Vector3D = away.geom.Vector3D;
    import Matrix = away.geom.Matrix;

    export class Main extends View {
        private _cardContainer:DisplayObjectContainer;
        private _cardLength:number = 0;
        private _imageList:HTMLImageElement[] = [];
        private _cardList:Mesh[] = [];
        private CARD_WIDTH:number = 512;
        // ファイルアップロードエリア
        private _fileZone:HTMLElement;
        private lastPanAngle:number;
        private lastTiltAngle:number;
        private lastMouseX:number;
        private lastMouseY:number;
        private isMouseDown:boolean;
        private cameraController:HoverController;
        // スマートフォンかどうか
        private isSP:boolean;

        constructor() {
            super(new DefaultRenderer());
            this._fileZone = document.getElementById("fileZone");
            var ua = navigator.userAgent;
            this.isSP = ua.indexOf("iPhone") > 0 || ua.indexOf("iPad") > 0 || ua.indexOf("iPod") > 0 || ua.indexOf("Android") > 0;
            this.backgroundColor = 0x333333;
            this.backgroundAlpha = 0;

       }

        /** 初期化処理。HTMLImageの配列を受け取る */
        public init(imageList:HTMLImageElement[]) {
            if (!isMainBuild) {
                isMainBuild = true;
                this.initialize3D();
            }
            else {
                // 一度作成済みの場合は、一度DisplayObjectを破棄
                this.disposeCards();

            }
            this._imageList = imageList;
            this._cardLength = imageList.length;
            this.initializeCard();
        }

        /** View3Dの基本設定を行う */
        private initialize3D():void {
            // カメラコントローラー
            this.cameraController = new HoverController();
            this.cameraController.targetObject = this.camera;
            this.cameraController.yFactor = 1;
            this.cameraController.distance = 900;
            this.cameraController.minTiltAngle = -90;
            this.cameraController.maxTiltAngle = 90;
            if (!this.isSP) {
                this.cameraController.tiltAngle = 0;
            }
            else {
                this.cameraController.wrapPanAngle = true;
            }

            this.eventSetting();

            // レンダリング
            var raf = new RequestAnimationFrame(this.enterFrameHandler, this);
            raf.start();
        }

        /** 写真を作成して立体に配置する */
        private initializeCard():void {
            this._cardContainer = new DisplayObjectContainer();

            // カードを作成
            for (var i:number = 0; i < this._cardLength; i++) {
                this.createCard(i);
            }
            // カードをレイアウト
            this.layoutCard();
            this.scene.addChild(this._cardContainer);

            this._fileZone.className = "off";
            isFileUploadScene = false;

            // canvas用を表示
            var canvas:HTMLElement = document.getElementsByTagName("canvas")[0];
            canvas.style.display = "block";

            if (!isMainBuild) {
                this.initialize3D();
            }
        }

        /** 個別の写真を作成する */
        private createCard(i:number):void {
            var image:HTMLImageElement = this._imageList[i];
            var resizeRatio:number;

            // 画像サイズの補正。画像の短辺が、CARD_WIDTHになるようにする。
            if (image.naturalWidth >= image.naturalHeight) {
                resizeRatio = this.CARD_WIDTH / image.naturalHeight;
            }
            else {
                resizeRatio = this.CARD_WIDTH / image.naturalWidth;
            }

            var bitmapData:BitmapData = new BitmapData(this.CARD_WIDTH, this.CARD_WIDTH, false);
            bitmapData.draw(image, new Matrix(-resizeRatio, 0, 0, resizeRatio, this.CARD_WIDTH));
            var texture:BitmapTexture = new BitmapTexture(bitmapData);
            var material:TriangleMethodMaterial = new TriangleMethodMaterial(texture);

            var prefab:DisplayObject = new PrimitivePlanePrefab(this.CARD_WIDTH, this.CARD_WIDTH, 2, 2, false, true).getNewObject();

            // カードの作成
            var card:Mesh = <Mesh> prefab;
            card.material = material;
            this._cardList[i] = card;
        }

        /** 写真を3D空間に配置する
         *  配置方法については以下を参考にした。
         *  Spriteを球状に配置するだけ - wonderfl build flash online :
         *  http://wonderfl.net/c/uK8i */
        private layoutCard():void {
            var zeroPoint:Vector3D = new Vector3D();
            var cardIndex:number = 0;
            var sphereRadius:number = 1200;
            var H:number = Math.floor((2 * sphereRadius * Math.PI) / 2 / this.CARD_WIDTH);
            var angle1:number = 0;
            var angle2:number = 90;
            for (var i:number = 0; i < H; i++) {
                angle1 = 0;
                var pn:number = Math.floor((2 * sphereRadius * Math.cos(angle2 * Math.PI / 180) * Math.PI) / this.CARD_WIDTH);
                for (var j:number = 0; j < pn; j++) {
                    var rawCard:Mesh = this._cardList[cardIndex];
                    var card:Mesh = new Mesh(rawCard.geometry, rawCard.material);
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
        }

        /** 各種イベント設定 */
        private eventSetting():void {
            if (!this.isSP) {
                // デスクトップブラウザでは、ドラッグによる視点移動
                document.addEventListener("mousedown", (event:MouseEvent) => this.onMouseDown(event));
                document.addEventListener("mouseup", (event:MouseEvent) => this.onMouseUp(event));
                document.addEventListener("mousemove", (event:MouseEvent) => this.onMouseMove(event));
            }
            else if (this.isSP) {
                // スマートフォンブラウザでは、デバイスの傾きによる視点移動
                window.addEventListener("deviceorientation", (event:DeviceOrientationEvent) => this.onRotationChange(event));
            }
            window.addEventListener("resize", (event:Event) => this.onResize(event));
            this.onResize();
        }

        /** エンターフレームイベント */
        private enterFrameHandler(e = null):void {
            this.render();
        }

        /** マウスを押したとき */
        private onMouseDown(event) {
            this.lastPanAngle = this.cameraController.panAngle;
            this.lastTiltAngle = this.cameraController.tiltAngle;
            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
            this.isMouseDown = true;

            if (this.isSP) {
                this.cameraController.wrapPanAngle = false;
            }
        }

        /** マウスを離したとき */
        private onMouseUp(event) {
            this.isMouseDown = false;
            if (this.isSP) {
                this.cameraController.wrapPanAngle = true;
            }
        }

        /** マウスを動かした時 */
        private onMouseMove(event) {
            if (this.isMouseDown) {
                this.cameraController.panAngle = 0.3 * (event.clientX - this.lastMouseX) + this.lastPanAngle;
                this.cameraController.tiltAngle = 0.3 * (event.clientY - this.lastMouseY) + this.lastTiltAngle;
            }
        }

        /** デバイスの傾きが変わった時 */
        private onRotationChange(event:DeviceOrientationEvent):void {
            if (!this.isMouseDown) {
                var alpha:number = event.alpha;
                var beta:number = event.beta;
                var gamma:number = event.gamma;

                // webkit系では、方位からpanAngleを設定したほうが便利
                this.cameraController.panAngle = event.webkitCompassHeading;

                if (-90 <= gamma && gamma < 90) {
                    this.cameraController.tiltAngle = 90 - beta;
                }
                else {
                    this.cameraController.tiltAngle = beta - 90;
                }
            }
        }

        /** 画面サイズが変わった時の処理 */
        private onResize(event = null) {
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
        }

        // カードの破棄をしたいが、removeChild()が効かないので何もしない。
        private disposeCards():void {
        }
    }
}
