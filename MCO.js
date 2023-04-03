//ts-check

enchant();

window.onload = function () {
    const game = new Game(1000, 1000);

    game.fps = 24;

    const BoardImgUrl = "Board.png";
    const MarkerImgUrl = "Marker.png";
    const ShadowImgUrl = "Shadow.png";
    const PieceRImgUrl = "PieceR.png";
    const PieceBImgUrl = "PieceB.png";
    const TTRImgUrl = "TTR.png";
    const ScoreImgUrl = "Score.png";
    game.preload(BoardImgUrl, MarkerImgUrl, ShadowImgUrl, PieceRImgUrl, PieceBImgUrl, TTRImgUrl, ScoreImgUrl);
    game.preload("N0.png", "N1.png", "N2.png", "N3.png", "N4.png", "N5.png", "N6.png", "N7.png", "N8.png", "N9.png");

    game.onload = function () {

        let State = 0;
        let Timer = 0;
        let Assist = false;
        let BoardStates = new Array(64).fill(-1);
        let CanPlaces = new Array(64).fill(false);
        let PlacedPiece = 0;
        let PlacedPieceX = 0;
        let PlacedPieceY = 0;
        let SortedLengths = new Array(8).fill(0);
        let Remains = new Array();
        let RemainsId = new Array();
        let OriginalCol = new Array();
        let LinelCol = new Array(8);
        let ClickCountX = 0;
        let ClickCountY = 0;
        let CountCount = 8;

        const mainScene = new Scene();
        game.pushScene(mainScene);
        mainScene.backgroundColor = "white";

        const ScoreTextR = new Label();
        ScoreTextR.font = "64px DM Serif Display";
        ScoreTextR.color = "rgb(255, 64, 64)";
        ScoreTextR.width = 1000;
        mainScene.addChild(ScoreTextR);

        const ScoreTextB = new Label();
        ScoreTextB.font = "64px DM Serif Display";
        ScoreTextB.color = 'rgb(64,64,255)';
        mainScene.addChild(ScoreTextB);

        const BoardImg = new Sprite(1000, 1000);
        BoardImg.image = game.assets[BoardImgUrl];
        mainScene.addChild(BoardImg);

        BoardStates[27] = 1;
        BoardStates[28] = 0;
        BoardStates[35] = 0;
        BoardStates[36] = 1;

        let MarkerImgs = new Array();
        CulcMarkerPos(0);

        let mainSurface = new Surface(1000, 1000);
        let mainSprite = new Sprite(1000, 1000);
        mainSprite.image = mainSurface;
        mainSprite.x = 0;
        mainSprite.y = 0;
        mainScene.addChild(mainSprite);

        let ShadowImgs = new Array();
        let PieceRImgs = new Array();
        let PieceBImgs = new Array();
        DrawPieces();

        const TTRImg = new Sprite(1000, 1000);
        TTRImg.image = game.assets[TTRImgUrl];

        const ScoreImg = new Sprite(1000, 100);
        ScoreImg.image = game.assets[ScoreImgUrl];

        let NowNums = new Array();
        for (let i = 0; i <= 3; i++) {
            NowNums.push(new Sprite(50, 100));
            mainScene.addChild(NowNums[i]);
        }

        let calcnum = 0;

        //Click
        let MainCanvas = document.getElementById("enchant-stage");
        MainCanvas.addEventListener('mouseup', function (event) {
            let clientRect = MainCanvas.getBoundingClientRect();
            if (775 < window.innerWidth) {
                ClickUp(Math.floor((event.pageX - clientRect.left - window.pageXOffset) * 10 / 750) - 1
                    , Math.floor((event.pageY - clientRect.top - window.pageYOffset) * 10 / 750) - 1);
            }
            else {
                ClickUp(Math.floor((event.pageX - clientRect.left - window.pageXOffset) * 10 / (window.innerWidth - 25)) - 1
                    , Math.floor((event.pageY - clientRect.top - window.pageYOffset) * 10 / (window.innerWidth - 25)) - 1);
            }
        });
        function ClickUp(ClickX, ClickY) {
            if (8 <= ClickX) {
                ClickCountX++;
                if (CountCount == ClickCountX) {
                    let LenR = 0;
                    let LenB = 0;
                    for (let i = 0; i <= 63; i++) {
                        if (0 <= BoardStates[i] && BoardStates[i] <= 0.5) {
                            PieceRImgs.push(new Sprite(100, 100));
                            PieceRImgs[LenR].image = game.assets[PieceRImgUrl];
                            mainScene.addChild(PieceRImgs[LenR]);
                            PieceRImgs[LenR].moveTo((i % 8) * 100 + 100, Math.floor(i / 8) * 100 + 100);
                            LenR++;
                        }
                        else if (0.5 <= BoardStates[i]) {
                            PieceBImgs.push(new Sprite(100, 100));
                            PieceBImgs[LenB].image = game.assets[PieceBImgUrl];
                            mainScene.addChild(PieceBImgs[LenB]);
                            PieceBImgs[LenB].moveTo((i % 8) * 100 + 100, Math.floor(i / 8) * 100 + 100);
                            LenB++;
                        }
                    }
                    Assist = true;
                }
            }
            else if (ClickCountX < CountCount) {
                ClickCountX = 0;
            }
            if (8 <= ClickY) {
                ClickCountY++;
                if (CountCount == ClickCountY) {
                    mainScene.addChild(ScoreImg);
                    ScoreImg.moveTo(0, 900);
                    ScoreNum();
                }
            }
            else if (ClickCountY < CountCount) {
                ClickCountY = 0;
            }
            if (0 <= Math.min(ClickX, ClickY) && Math.max(ClickX, ClickY) <= 7 && CanPlaces[ClickX + ClickY * 8] && State == 0) {
                LevelRatios.children[0].children[0].disabled = true;
                LevelRatios.children[1].children[0].disabled = true;
                LevelRatios.children[2].children[0].disabled = true;
                LevelRatios.children[3].children[0].disabled = true;
                LevelRatios.children[4].children[0].disabled = true;
                for (let i = 0; i <= PieceRImgs.length; i++) {
                    mainScene.removeChild(PieceRImgs[i]);
                }
                for (let i = 0; i <= PieceBImgs.length; i++) {
                    mainScene.removeChild(PieceBImgs[i]);
                }
                PieceRImgs = new Array();
                PieceBImgs = new Array();
                for (let i = 0; i <= ShadowImgs.length; i++) {
                    mainScene.removeChild(ShadowImgs[i]);
                }
                ShadowImgs = new Array();
                SortedLengths = new Array(8).fill(0);
                PlacedPiece = ClickX + ClickY * 8;
                PlacedPieceX = ClickX;
                PlacedPieceY = ClickY;
                let RenderedPices = new Array();
                let Len = 0;
                let Dir = [1, -1, 8, -8, 7, -7, 9, -9];
                let DirNums = [7 - ClickX, ClickX, 7 - ClickY, ClickY, Math.min(ClickX, 7 - ClickY), Math.min(7 - ClickX, ClickY)
                    , Math.min(7 - ClickX, 7 - ClickY), Math.min(ClickX, ClickY)];
                let SumColor = 0;
                let SortedLineNum = 0;
                OriginalCol = new Array();
                LinelCol = new Array(8);
                for (let j = 0; j <= 7; j++) {
                    if (DirNums[j] >= 2 && 0 <= BoardStates[PlacedPiece + Dir[j]]) {
                        let MaxLen = DirNums[j];
                        for (let k = 2; k <= DirNums[j]; k++) {
                            if (BoardStates[PlacedPiece + Dir[j] * k] == -1) {
                                MaxLen = k - 1;
                                break;
                            }
                        }
                        for (let k = MaxLen; 2 <= k; k--) {
                            if (0 <= BoardStates[PlacedPiece + Dir[j] * k] && BoardStates[PlacedPiece + Dir[j] * k] <= 0.5) {
                                SortedLengths[j] = k;
                                break;
                            }
                        }
                        if (2 <= SortedLengths[j]) {
                            let TempSumColor = 0
                            BoardStates[PlacedPiece] = 0;
                            for (let k = 0; k <= SortedLengths[j]; k++) {
                                ShadowImgs.push(new Sprite(100, 100));
                                ShadowImgs[Len].image = game.assets[ShadowImgUrl];
                                mainScene.addChild(ShadowImgs[Len]);
                                let WillPlacedPiece = PlacedPiece + Dir[j] * k;
                                ShadowImgs[Len].moveTo((WillPlacedPiece % 8) * 100 + 100, Math.floor(WillPlacedPiece / 8) * 100 + 100);
                                RenderedPices.push(WillPlacedPiece);
                                TempSumColor += BoardStates[WillPlacedPiece];
                                OriginalCol.push(BoardStates[WillPlacedPiece]);
                                Len++;
                            }
                            for (let k = 0; k <= SortedLengths[j]; k++) {
                                BoardStates[PlacedPiece + Dir[j] * k] = TempSumColor / (SortedLengths[j] + 1);
                            }
                            SumColor += TempSumColor / (SortedLengths[j] + 1);
                            SortedLineNum += 1;
                            LinelCol[j] = TempSumColor / (SortedLengths[j] + 1);
                        }
                    }
                }
                mainScene.insertBefore(mainSprite, null);
                BoardStates[PlacedPiece] = SumColor / SortedLineNum;
                Remains = new Array();
                RemainsId = new Array();
                for (let i = 0; i <= 63; i++) {
                    if (0 <= BoardStates[i] && !RenderedPices.includes(i)) {
                        ShadowImgs.push(new Sprite(100, 100));
                        ShadowImgs[Len].image = game.assets[ShadowImgUrl];
                        mainScene.addChild(ShadowImgs[Len]);
                        ShadowImgs[Len].moveTo((i % 8) * 100 + 100, Math.floor(i / 8) * 100 + 100);
                        Len++;
                        Remains.push((i % 8) * 100 + 150, Math.floor(i / 8) * 100 + 150, BoardStates[i]);
                        RemainsId.push(i);
                    }
                }
                State = 1;
                Timer = 1;
                TurnText.textContent = "相手思考中…";
                if (CountCount <= ClickCountY) {
                    ScoreNum();
                }
            }
            else if (State == 4) {
                TurnText.textContent = "あなたの番";
                LevelRatios.children[0].children[0].disabled = false;
                LevelRatios.children[1].children[0].disabled = false;
                LevelRatios.children[2].children[0].disabled = false;
                LevelRatios.children[3].children[0].disabled = false;
                LevelRatios.children[4].children[0].disabled = false;
                BoardStates = new Array(64).fill(-1);
                BoardStates[27] = 1;
                BoardStates[28] = 0;
                BoardStates[35] = 0;
                BoardStates[36] = 1;
                DrawPieces();
                CulcMarkerPos(0);
                mainScene.removeChild(TTRImg);
                for (let i = 0; i <= PieceRImgs.length; i++) {
                    mainScene.removeChild(PieceRImgs[i]);
                }
                for (let i = 0; i <= PieceBImgs.length; i++) {
                    mainScene.removeChild(PieceBImgs[i]);
                }
                PieceRImgs = new Array();
                PieceBImgs = new Array();
                if (ClickCountY < CountCount) {
                    mainScene.removeChild(ScoreImg);
                }
                ScoreNum();
                State = 0;
            }
        };

        //Update
        game.onenterframe = function () {
            switch (State) {
                case 1:
                    mainSurface.context.clearRect(0, 0, 1000, 1000);
                    for (let i = 0; i <= Remains.length / 3 - 1; i++) {
                        mainSurface.context.beginPath();
                        let lineargradient = mainSurface.context.createLinearGradient((RemainsId[i] % 8) * 100 + 100
                            , Math.floor(RemainsId[i] / 8) * 100 + 100, (RemainsId[i] % 8) * 100 + 200, Math.floor(RemainsId[i] / 8) * 100 + 200);
                        lineargradient.addColorStop(0, "rgb(" + (255 - Remains[i * 3 + 2] * 191 - 64) + ",0," + (Remains[i * 3 + 2] * 191) + ")");
                        lineargradient.addColorStop(1, "rgb(" + (255 - Remains[i * 3 + 2] * 191) + ",64," + (Remains[i * 3 + 2] * 191 + 64) + ")");
                        mainSurface.context.fillStyle = lineargradient;
                        mainSurface.context.arc(Remains[i * 3], Remains[i * 3 + 1], 40, 0, Math.PI * 2, true);
                        mainSurface.context.fill();
                    }
                    let TempNum = 0;
                    let DeltaX = [1, -1, 0, 0, -1, 1, 1, -1];
                    let DeltaY = [0, 0, 1, -1, 1, -1, 1, -1];
                    for (let i = 0; i <= 7; i++) {
                        if (2 <= SortedLengths[i]) {
                            for (let j = 0; j <= SortedLengths[i]; j++) {
                                ShadowImgs[TempNum + j].x = (PlacedPieceX + DeltaX[i] * j + (SortedLengths[i] - j * 2) * DeltaX[i] * Timer * (32 - Timer) / 256) * 100 + 100;
                                ShadowImgs[TempNum + j].y = (PlacedPieceY + DeltaY[i] * j + (SortedLengths[i] - j * 2) * DeltaY[i] * Timer * (32 - Timer) / 256) * 100 + 100;
                                if (Timer <= 4) {
                                    mainSurface.context.beginPath();
                                    let lineargradient = mainSurface.context.createLinearGradient((PlacedPieceX + DeltaX[i] * j + (SortedLengths[i] - j * 2) * DeltaX[i] * Timer * (32 - Timer) / 256) * 100 + 100
                                        , (PlacedPieceY + DeltaY[i] * j + (SortedLengths[i] - j * 2) * DeltaY[i] * Timer * (32 - Timer) / 256) * 100 + 100, (PlacedPieceX + DeltaX[i] * j + (SortedLengths[i] - j * 2) * DeltaX[i] * Timer * (32 - Timer) / 256) * 100 + 200, (PlacedPieceY + DeltaY[i] * j + (SortedLengths[i] - j * 2) * DeltaY[i] * Timer * (32 - Timer) / 256) * 100 + 200);
                                    lineargradient.addColorStop(0, "rgb(" + (255 - OriginalCol[TempNum + j] * 191 - 64) + ",0," + (OriginalCol[TempNum + j] * 191) + ")");
                                    lineargradient.addColorStop(1, "rgb(" + (255 - OriginalCol[TempNum + j] * 191) + ",64," + (OriginalCol[TempNum + j] * 191 + 64) + ")");
                                    mainSurface.context.fillStyle = lineargradient;
                                    mainSurface.context.arc((PlacedPieceX + DeltaX[i] * j + (SortedLengths[i] - j * 2) * DeltaX[i] * Timer * (32 - Timer) / 256) * 100 + 150
                                        , (PlacedPieceY + DeltaY[i] * j + (SortedLengths[i] - j * 2) * DeltaY[i] * Timer * (32 - Timer) / 256) * 100 + 150, 40, 0, Math.PI * 2, true);
                                    mainSurface.context.fill();
                                }
                                else {
                                    mainSurface.context.beginPath();
                                    let lineargradient = mainSurface.context.createLinearGradient((PlacedPieceX + DeltaX[i] * j + (SortedLengths[i] - j * 2) * DeltaX[i] * Timer * (32 - Timer) / 256) * 100 + 100
                                        , (PlacedPieceY + DeltaY[i] * j + (SortedLengths[i] - j * 2) * DeltaY[i] * Timer * (32 - Timer) / 256) * 100 + 100, (PlacedPieceX + DeltaX[i] * j + (SortedLengths[i] - j * 2) * DeltaX[i] * Timer * (32 - Timer) / 256) * 100 + 200, (PlacedPieceY + DeltaY[i] * j + (SortedLengths[i] - j * 2) * DeltaY[i] * Timer * (32 - Timer) / 256) * 100 + 200);
                                    lineargradient.addColorStop(0, "rgb(" + (255 - LinelCol[i] * 191 - 64) + ",0," + (LinelCol[i] * 191) + ")");
                                    lineargradient.addColorStop(1, "rgb(" + (255 - LinelCol[i] * 191) + ",64," + (LinelCol[i] * 191 + 64) + ")");
                                    mainSurface.context.fillStyle = lineargradient;
                                    mainSurface.context.arc((PlacedPieceX + DeltaX[i] * j + (SortedLengths[i] - j * 2) * DeltaX[i] * Timer * (32 - Timer) / 256) * 100 + 150
                                        , (PlacedPieceY + DeltaY[i] * j + (SortedLengths[i] - j * 2) * DeltaY[i] * Timer * (32 - Timer) / 256) * 100 + 150, 40, 0, Math.PI * 2, true);
                                    mainSurface.context.fill();
                                }
                            }
                            TempNum += SortedLengths[i] + 1;
                        }
                    }
                    mainScene.insertBefore(mainSprite, null);
                    if (Timer == 16) {
                        CulcMarkerPos(1);
                        let ScoreR = 0;
                        let ScoreB = 0;
                        for (let i = 0; i <= 63; i++) {
                            if (0 <= BoardStates[i] && BoardStates[i] <= 0.5) {
                                ScoreR++;
                            }
                            else if (0.5 <= BoardStates[i]) {
                                ScoreB++;
                            }
                        }
                        if (CanPlaces.reduce(function (sum, element) { return sum + element; }, 0) == 0 || ScoreR * ScoreB == 0) {
                            CulcMarkerPos(0);
                            if (CanPlaces.reduce(function (sum, element) { return sum + element; }, 0) == 0 || ScoreR * ScoreB == 0) {
                                // -> End
                                if (ClickCountY < CountCount) {
                                    mainScene.addChild(ScoreImg);
                                    ScoreImg.moveTo(0, 900);
                                    console.log(ClickCountY);
                                }
                                ScoreNum();
                                if (ScoreR == ScoreB) {
                                    TurnText.textContent = "引き分け";
                                }
                                else if (ScoreR < ScoreB) {
                                    TurnText.textContent = "あなたの負け";
                                }
                                else {
                                    TurnText.textContent = "あなたの勝ち";
                                }
                                State = 4;
                                DrawPieces();
                                mainScene.addChild(TTRImg);
                                TTRImg.moveTo(900, 0);
                                for (let i = 0; i <= PieceRImgs.length; i++) {
                                    mainScene.removeChild(PieceRImgs[i]);
                                }
                                for (let i = 0; i <= PieceBImgs.length; i++) {
                                    mainScene.removeChild(PieceBImgs[i]);
                                }
                                PieceRImgs = new Array();
                                PieceBImgs = new Array();
                                let LenR = 0;
                                let LenB = 0;
                                for (let i = 0; i <= 63; i++) {
                                    if (0 <= BoardStates[i] && BoardStates[i] <= 0.5) {
                                        PieceRImgs.push(new Sprite(100, 100));
                                        PieceRImgs[LenR].image = game.assets[PieceRImgUrl];
                                        mainScene.addChild(PieceRImgs[LenR]);
                                        PieceRImgs[LenR].moveTo((i % 8) * 100 + 100, Math.floor(i / 8) * 100 + 100);
                                        LenR++;
                                    }
                                    else if (0.5 <= BoardStates[i]) {
                                        PieceBImgs.push(new Sprite(100, 100));
                                        PieceBImgs[LenB].image = game.assets[PieceBImgUrl];
                                        mainScene.addChild(PieceBImgs[LenB]);
                                        PieceBImgs[LenB].moveTo((i % 8) * 100 + 100, Math.floor(i / 8) * 100 + 100);
                                        LenB++;
                                    }
                                }
                            }
                            else {
                                // -> Red
                                DrawPieces()
                                State = 0;
                                TurnText.textContent = "あなたの番";
                            }
                        }
                        else {
                            // -> Blue
                            let WillPlacedB = ChoosePos();
                            let WillPlaceBX = WillPlacedB % 8;
                            let WillPlaceBY = Math.floor(WillPlacedB / 8);
                            PlacedPiece = WillPlacedB;
                            PlacedPieceX = WillPlaceBX;
                            PlacedPieceY = WillPlaceBY;
                            for (let i = 0; i <= ShadowImgs.length; i++) {
                                mainScene.removeChild(ShadowImgs[i]);
                            }
                            ShadowImgs = new Array();
                            SortedLengths = new Array(8).fill(0);
                            let RenderedPices = new Array();
                            let Len = 0;
                            let Dir = [1, -1, 8, -8, 7, -7, 9, -9];
                            let DirNums = [7 - WillPlaceBX, WillPlaceBX, 7 - WillPlaceBY, WillPlaceBY, Math.min(WillPlaceBX, 7 - WillPlaceBY), Math.min(7 - WillPlaceBX
                                , WillPlaceBY), Math.min(7 - WillPlaceBX, 7 - WillPlaceBY), Math.min(WillPlaceBX, WillPlaceBY)];
                            let SumColor = 0;
                            let SortedLineNum = 0;
                            OriginalCol = new Array();
                            LinelCol = new Array(8);
                            for (let j = 0; j <= 7; j++) {
                                if (DirNums[j] >= 2 && 0 <= BoardStates[WillPlacedB + Dir[j]]) {
                                    let MaxLen = DirNums[j];
                                    for (let k = 2; k <= DirNums[j]; k++) {
                                        if (BoardStates[WillPlacedB + Dir[j] * k] == -1) {
                                            MaxLen = k - 1;
                                            break;
                                        }
                                    }
                                    for (let k = MaxLen; 2 <= k; k--) {
                                        if (0.5 <= BoardStates[WillPlacedB + Dir[j] * k]) {
                                            SortedLengths[j] = k;
                                            break;
                                        }
                                    }
                                    if (2 <= SortedLengths[j]) {
                                        let TempSumColor = 0
                                        BoardStates[WillPlacedB] = 1;
                                        for (let k = 0; k <= SortedLengths[j]; k++) {
                                            ShadowImgs.push(new Sprite(100, 100));
                                            ShadowImgs[Len].image = game.assets[ShadowImgUrl];
                                            mainScene.addChild(ShadowImgs[Len]);
                                            let WillPlacedPiece = WillPlacedB + Dir[j] * k;
                                            ShadowImgs[Len].moveTo((WillPlacedPiece % 8) * 100 + 100, Math.floor(WillPlacedPiece / 8) * 100 + 100);
                                            RenderedPices.push(WillPlacedPiece);
                                            TempSumColor += BoardStates[WillPlacedPiece];
                                            OriginalCol.push(BoardStates[WillPlacedPiece]);
                                            Len++;
                                        }
                                        for (let k = 0; k <= SortedLengths[j]; k++) {
                                            BoardStates[WillPlacedB + Dir[j] * k] = TempSumColor / (SortedLengths[j] + 1);
                                        }
                                        SumColor += TempSumColor / (SortedLengths[j] + 1);
                                        SortedLineNum += 1;
                                        LinelCol[j] = TempSumColor / (SortedLengths[j] + 1);
                                    }
                                }
                            }
                            BoardStates[WillPlacedB] = SumColor / SortedLineNum;
                            Remains = new Array();
                            RemainsId = new Array();
                            for (let i = 0; i <= 63; i++) {
                                if (0 <= BoardStates[i] && !RenderedPices.includes(i)) {
                                    ShadowImgs.push(new Sprite(100, 100));
                                    ShadowImgs[Len].image = game.assets[ShadowImgUrl];
                                    mainScene.addChild(ShadowImgs[Len]);
                                    ShadowImgs[Len].moveTo((i % 8) * 100 + 100, Math.floor(i / 8) * 100 + 100);
                                    Len++;
                                    Remains.push((i % 8) * 100 + 150, Math.floor(i / 8) * 100 + 150, BoardStates[i]);
                                    RemainsId.push(i);
                                }
                            }
                            mainScene.insertBefore(mainSprite, null);
                            State = 2;
                            Timer = 1;
                            if (CountCount <= ClickCountY) {
                                ScoreNum();
                            }
                        }
                    }
                    Timer++;
                    break;
                case 2:
                    mainSurface.context.clearRect(0, 0, 1000, 1000);
                    for (let i = 0; i <= Remains.length / 3 - 1; i++) {
                        mainSurface.context.beginPath();
                        let lineargradient = mainSurface.context.createLinearGradient((RemainsId[i] % 8) * 100 + 100, Math.floor(RemainsId[i] / 8) * 100 + 100
                            , (RemainsId[i] % 8) * 100 + 200, Math.floor(RemainsId[i] / 8) * 100 + 200);
                        lineargradient.addColorStop(0, "rgb(" + (255 - Remains[i * 3 + 2] * 191 - 64) + ",0," + (Remains[i * 3 + 2] * 191) + ")");
                        lineargradient.addColorStop(1, "rgb(" + (255 - Remains[i * 3 + 2] * 191) + ",64," + (Remains[i * 3 + 2] * 191 + 64) + ")");
                        mainSurface.context.fillStyle = lineargradient;
                        mainSurface.context.arc(Remains[i * 3], Remains[i * 3 + 1], 40, 0, Math.PI * 2, true);
                        mainSurface.context.fill();
                    }
                    let TempNum2 = 0;
                    let DeltaX2 = [1, -1, 0, 0, -1, 1, 1, -1];
                    let DeltaY2 = [0, 0, 1, -1, 1, -1, 1, -1];
                    for (let i = 0; i <= 7; i++) {
                        if (2 <= SortedLengths[i]) {
                            for (let j = 0; j <= SortedLengths[i]; j++) {
                                ShadowImgs[TempNum2 + j].x = (PlacedPieceX + DeltaX2[i] * j + (SortedLengths[i] - j * 2) * DeltaX2[i] * Timer * (32 - Timer) / 256) * 100 + 100;
                                ShadowImgs[TempNum2 + j].y = (PlacedPieceY + DeltaY2[i] * j + (SortedLengths[i] - j * 2) * DeltaY2[i] * Timer * (32 - Timer) / 256) * 100 + 100;
                                if (Timer <= 4) {
                                    mainSurface.context.beginPath();
                                    let lineargradient = mainSurface.context.createLinearGradient((PlacedPieceX + DeltaX2[i] * j + (SortedLengths[i] - j * 2) * DeltaX2[i] * Timer * (32 - Timer) / 256) * 100 + 100
                                        , (PlacedPieceY + DeltaY2[i] * j + (SortedLengths[i] - j * 2) * DeltaY2[i] * Timer * (32 - Timer) / 256) * 100 + 100, (PlacedPieceX + DeltaX2[i] * j + (SortedLengths[i] - j * 2) * DeltaX2[i] * Timer * (32 - Timer) / 256) * 100 + 200, (PlacedPieceY + DeltaY2[i] * j + (SortedLengths[i] - j * 2) * DeltaY2[i] * Timer * (32 - Timer) / 256) * 100 + 200);
                                    lineargradient.addColorStop(0, "rgb(" + (255 - OriginalCol[TempNum2 + j] * 191 - 64) + ",0," + (OriginalCol[TempNum2 + j] * 191) + ")");
                                    lineargradient.addColorStop(1, "rgb(" + (255 - OriginalCol[TempNum2 + j] * 191) + ",64," + (OriginalCol[TempNum2 + j] * 191 + 64) + ")");
                                    mainSurface.context.fillStyle = lineargradient;
                                    mainSurface.context.arc((PlacedPieceX + DeltaX2[i] * j + (SortedLengths[i] - j * 2) * DeltaX2[i] * Timer * (32 - Timer) / 256) * 100 + 150, (PlacedPieceY + DeltaY2[i] * j + (SortedLengths[i] - j * 2) * DeltaY2[i] * Timer * (32 - Timer) / 256) * 100 + 150, 40, 0, Math.PI * 2, true);
                                    mainSurface.context.fill();
                                }
                                else {
                                    let lineargradient = mainSurface.context.createLinearGradient((PlacedPieceX + DeltaX2[i] * j + (SortedLengths[i] - j * 2) * DeltaX2[i] * Timer * (32 - Timer) / 256) * 100 + 100
                                        , (PlacedPieceY + DeltaY2[i] * j + (SortedLengths[i] - j * 2) * DeltaY2[i] * Timer * (32 - Timer) / 256) * 100 + 100, (PlacedPieceX + DeltaX2[i] * j + (SortedLengths[i] - j * 2) * DeltaX2[i] * Timer * (32 - Timer) / 256) * 100 + 200, (PlacedPieceY + DeltaY2[i] * j + (SortedLengths[i] - j * 2) * DeltaY2[i] * Timer * (32 - Timer) / 256) * 100 + 200);
                                    mainSurface.context.beginPath();
                                    lineargradient.addColorStop(0, "rgb(" + (255 - LinelCol[i] * 191 - 64) + ",0," + (LinelCol[i] * 191) + ")");
                                    lineargradient.addColorStop(1, "rgb(" + (255 - LinelCol[i] * 191) + ",64," + (LinelCol[i] * 191 + 64) + ")");
                                    mainSurface.context.fillStyle = lineargradient;
                                    mainSurface.context.arc((PlacedPieceX + DeltaX2[i] * j + (SortedLengths[i] - j * 2) * DeltaX2[i] * Timer * (32 - Timer) / 256) * 100 + 150
                                        , (PlacedPieceY + DeltaY2[i] * j + (SortedLengths[i] - j * 2) * DeltaY2[i] * Timer * (32 - Timer) / 256) * 100 + 150, 40, 0, Math.PI * 2, true);
                                    mainSurface.context.fill();
                                }
                            }
                            TempNum2 += SortedLengths[i] + 1;
                        }
                    }
                    mainScene.insertBefore(mainSprite, null);
                    if (Timer == 16) {
                        CulcMarkerPos(0);
                        let ScoreR = 0;
                        let ScoreB = 0;
                        for (let i = 0; i <= 63; i++) {
                            if (0 <= BoardStates[i] && BoardStates[i] <= 0.5) {
                                ScoreR++;
                            }
                            else if (0.5 <= BoardStates[i]) {
                                ScoreB++;
                            }
                        }
                        if (CanPlaces.reduce(function (sum, element) { return sum + element; }, 0) == 0 || ScoreR * ScoreB == 0) {
                            CulcMarkerPos(1);
                            if (CanPlaces.reduce(function (sum, element) { return sum + element; }, 0) == 0 || ScoreR * ScoreB == 0) {
                                // -> End
                                if (ClickCountY < CountCount) {
                                    mainScene.addChild(ScoreImg);
                                    ScoreImg.moveTo(0, 900);
                                    mainScene.insertBefore(ScoreImg, NowNums[0]);
                                    console.log(ClickCountY);
                                }
                                ScoreNum();
                                if (ScoreR == ScoreB) {
                                    TurnText.textContent = "引き分け";
                                }
                                else if (ScoreR < ScoreB) {
                                    TurnText.textContent = "あなたの負け";
                                }
                                else {
                                    TurnText.textContent = "あなたの勝ち";
                                }
                                State = 4;
                                DrawPieces();
                                mainScene.addChild(TTRImg);
                                TTRImg.moveTo(900, 0);
                                for (let i = 0; i <= PieceRImgs.length; i++) {
                                    mainScene.removeChild(PieceRImgs[i]);
                                }
                                for (let i = 0; i <= PieceBImgs.length; i++) {
                                    mainScene.removeChild(PieceBImgs[i]);
                                }
                                PieceRImgs = new Array();
                                PieceBImgs = new Array();
                                let LenR = 0;
                                let LenB = 0;
                                for (let i = 0; i <= 63; i++) {
                                    if (0 <= BoardStates[i] && BoardStates[i] <= 0.5) {
                                        PieceRImgs.push(new Sprite(100, 100));
                                        PieceRImgs[LenR].image = game.assets[PieceRImgUrl];
                                        mainScene.addChild(PieceRImgs[LenR]);
                                        PieceRImgs[LenR].moveTo((i % 8) * 100 + 100, Math.floor(i / 8) * 100 + 100);
                                        LenR++;
                                    }
                                    else if (0.5 <= BoardStates[i]) {
                                        PieceBImgs.push(new Sprite(100, 100));
                                        PieceBImgs[LenB].image = game.assets[PieceBImgUrl];
                                        mainScene.addChild(PieceBImgs[LenB]);
                                        PieceBImgs[LenB].moveTo((i % 8) * 100 + 100, Math.floor(i / 8) * 100 + 100);
                                        LenB++;
                                    }
                                }
                            }
                            else {
                                // -> Blue
                                let WillPlacedB = ChoosePos();
                                let WillPlaceBX = WillPlacedB % 8;
                                let WillPlaceBY = Math.floor(WillPlacedB / 8);
                                PlacedPiece = WillPlacedB;
                                PlacedPieceX = WillPlaceBX;
                                PlacedPieceY = WillPlaceBY;
                                for (let i = 0; i <= ShadowImgs.length; i++) {
                                    mainScene.removeChild(ShadowImgs[i]);
                                }
                                ShadowImgs = new Array();
                                SortedLengths = new Array(8).fill(0);
                                let RenderedPices = new Array();
                                let Len = 0;
                                let Dir = [1, -1, 8, -8, 7, -7, 9, -9];
                                let DirNums = [7 - WillPlaceBX, WillPlaceBX, 7 - WillPlaceBY, WillPlaceBY, Math.min(WillPlaceBX, 7 - WillPlaceBY), Math.min(7 - WillPlaceBX, WillPlaceBY)
                                    , Math.min(7 - WillPlaceBX, 7 - WillPlaceBY), Math.min(WillPlaceBX, WillPlaceBY)];
                                let SumColor = 0;
                                let SortedLineNum = 0;
                                OriginalCol = new Array();
                                LinelCol = new Array(8);
                                for (let j = 0; j <= 7; j++) {
                                    if (DirNums[j] >= 2 && 0 <= BoardStates[WillPlacedB + Dir[j]]) {
                                        let MaxLen = DirNums[j];
                                        for (let k = 2; k <= DirNums[j]; k++) {
                                            if (BoardStates[WillPlacedB + Dir[j] * k] == -1) {
                                                MaxLen = k - 1;
                                                break;
                                            }
                                        }
                                        for (let k = MaxLen; 2 <= k; k--) {
                                            if (0.5 <= BoardStates[WillPlacedB + Dir[j] * k]) {
                                                SortedLengths[j] = k;
                                                break;
                                            }
                                        }
                                        if (2 <= SortedLengths[j]) {
                                            let TempSumColor = 0
                                            BoardStates[WillPlacedB] = 1;
                                            for (let k = 0; k <= SortedLengths[j]; k++) {
                                                ShadowImgs.push(new Sprite(100, 100));
                                                ShadowImgs[Len].image = game.assets[ShadowImgUrl];
                                                mainScene.addChild(ShadowImgs[Len]);
                                                let WillPlacedPiece = WillPlacedB + Dir[j] * k;
                                                ShadowImgs[Len].moveTo((WillPlacedPiece % 8) * 100 + 100, Math.floor(WillPlacedPiece / 8) * 100 + 100);
                                                RenderedPices.push(WillPlacedPiece);
                                                TempSumColor += BoardStates[WillPlacedPiece];
                                                OriginalCol.push(BoardStates[WillPlacedPiece]);
                                                Len++;
                                            }
                                            for (let k = 0; k <= SortedLengths[j]; k++) {
                                                BoardStates[WillPlacedB + Dir[j] * k] = TempSumColor / (SortedLengths[j] + 1);
                                            }
                                            SumColor += TempSumColor / (SortedLengths[j] + 1);
                                            SortedLineNum += 1;
                                            LinelCol[j] = TempSumColor / (SortedLengths[j] + 1);
                                        }
                                    }
                                }
                                mainScene.insertBefore(mainSprite, null);
                                BoardStates[WillPlacedB] = SumColor / SortedLineNum;
                                Remains = new Array();
                                RemainsId = new Array();
                                for (let i = 0; i <= 63; i++) {
                                    if (0 <= BoardStates[i] && !RenderedPices.includes(i)) {
                                        ShadowImgs.push(new Sprite(100, 100));
                                        ShadowImgs[Len].image = game.assets[ShadowImgUrl];
                                        mainScene.addChild(ShadowImgs[Len]);
                                        ShadowImgs[Len].moveTo((i % 8) * 100 + 100, Math.floor(i / 8) * 100 + 100);
                                        Len++;
                                        Remains.push((i % 8) * 100 + 150, Math.floor(i / 8) * 100 + 150, BoardStates[i]);
                                        RemainsId.push(i);
                                    }
                                }
                                Timer = 1;
                                if (CountCount <= ClickCountY) {
                                    ScoreNum();
                                }
                            }
                        }
                        else {
                            // -> Red
                            TurnText.textContent = "あなたの番";
                            DrawPieces()
                            State = 0;
                        }
                    }
                    Timer++;
                    break;
            }
        };

        function CulcMarkerPos(ColorNum) {
            for (let i = 0; i <= MarkerImgs.length - 1; i++) {
                mainScene.removeChild(MarkerImgs[i]);
            }
            MarkerImgs = new Array();
            CanPlaces = new Array(64).fill(false);
            let Len = 0;
            for (let i = 0; i <= 63; i++) {
                if (BoardStates[i] == -1) {
                    let CanPlace = false;
                    let CurX = i % 8;
                    let CurY = Math.floor(i / 8);
                    let Dir = [1, -1, 8, -8, 7, -7, 9, -9];
                    let DirNums = [7 - CurX, CurX, 7 - CurY, CurY, Math.min(CurX, 7 - CurY), Math.min(7 - CurX, CurY)
                        , Math.min(7 - CurX, 7 - CurY), Math.min(CurX, CurY)];
                    if (ColorNum == 0) {
                        for (let j = 0; j <= 7; j++) {
                            if (DirNums[j] >= 2 && 0 <= BoardStates[i + Dir[j]]) {
                                for (let k = 2; k <= DirNums[j]; k++) {
                                    if (BoardStates[i + Dir[j] * k] == -1) {
                                        break;
                                    }
                                    else if (0 <= BoardStates[i + Dir[j] * k] && BoardStates[i + Dir[j] * k] <= 0.5) {
                                        CanPlace = true;
                                        CanPlaces[i] = true;
                                    }
                                }
                            }
                        }
                    }
                    else {
                        for (let j = 0; j <= 7; j++) {
                            if (DirNums[j] >= 2 && 0 <= BoardStates[i + Dir[j]]) {
                                for (let k = 2; k <= DirNums[j]; k++) {
                                    if (BoardStates[i + Dir[j] * k] == -1) {
                                        break;
                                    }
                                    else if (0.5 <= BoardStates[i + Dir[j] * k]) {
                                        CanPlace = true;
                                        CanPlaces[i] = true;
                                    }
                                }
                            }
                        }
                    }
                    if (CanPlace) {
                        MarkerImgs.push(new Sprite(100, 100));
                        MarkerImgs[Len].image = game.assets[MarkerImgUrl];
                        mainScene.addChild(MarkerImgs[Len]);
                        MarkerImgs[Len].moveTo(CurX * 100 + 100, CurY * 100 + 100);
                        Len++;
                    }
                }
            }
        };

        function DrawPieces() {
            for (let i = 0; i <= ShadowImgs.length; i++) {
                mainScene.removeChild(ShadowImgs[i]);
            }
            ShadowImgs = new Array();
            mainSurface.context.clearRect(0, 0, 1000, 1000);
            let Len = 0;
            for (let i = 0; i <= 63; i++) {
                let CurState = BoardStates[i];
                if (0 <= CurState) {
                    ShadowImgs.push(new Sprite(100, 100));
                    ShadowImgs[Len].image = game.assets[ShadowImgUrl];
                    mainScene.addChild(ShadowImgs[Len]);
                    ShadowImgs[Len].moveTo((i % 8) * 100 + 100, Math.floor(i / 8) * 100 + 100);
                    mainSurface.context.beginPath();
                    let lineargradient = mainSurface.context.createLinearGradient((i % 8) * 100 + 100, Math.floor(i / 8) * 100 + 100, (i % 8) * 100 + 200
                        , Math.floor(i / 8) * 100 + 200);
                    lineargradient.addColorStop(0, "rgb(" + (255 - CurState * 191 - 64) + ",0," + (CurState * 191) + ")");
                    lineargradient.addColorStop(1, "rgb(" + (255 - CurState * 191) + ",64," + (CurState * 191 + 64) + ")");
                    mainSurface.context.fillStyle = lineargradient;
                    mainSurface.context.arc((i % 8) * 100 + 150, Math.floor(i / 8) * 100 + 150, 40, 0, Math.PI * 2, true);
                    mainSurface.context.fill();
                    Len++;
                }
            }
            mainScene.insertBefore(mainSprite, null);
            if (Assist) {
                for (let i = 0; i <= PieceRImgs.length; i++) {
                    mainScene.removeChild(PieceRImgs[i]);
                }
                for (let i = 0; i <= PieceBImgs.length; i++) {
                    mainScene.removeChild(PieceBImgs[i]);
                }
                PieceRImgs = new Array();
                PieceBImgs = new Array();
                let LenR = 0;
                let LenB = 0;
                for (let i = 0; i <= 63; i++) {
                    if (0 <= BoardStates[i] && BoardStates[i] <= 0.5) {
                        PieceRImgs.push(new Sprite(100, 100));
                        PieceRImgs[LenR].image = game.assets[PieceRImgUrl];
                        mainScene.addChild(PieceRImgs[LenR]);
                        PieceRImgs[LenR].moveTo((i % 8) * 100 + 100, Math.floor(i / 8) * 100 + 100);
                        LenR++;
                    }
                    else if (0.5 <= BoardStates[i]) {
                        PieceBImgs.push(new Sprite(100, 100));
                        PieceBImgs[LenB].image = game.assets[PieceBImgUrl];
                        mainScene.addChild(PieceBImgs[LenB]);
                        PieceBImgs[LenB].moveTo((i % 8) * 100 + 100, Math.floor(i / 8) * 100 + 100);
                        LenB++;
                    }
                }
            }
        };

        function ChoosePos() {
            let CPos = 0;
            switch (Level) {
                case 0:
                    // [Just Random]
                    do {
                        CPos = Math.floor(Math.random() * 64)
                    } while (!CanPlaces[CPos])
                    break;
                case 1:
                    // [Predict 1]
                    CPos = Cul1(BoardStates, 1, 9999)[0];
                    break;
                case 2:
                    // [Predict 3]
                    let MinVal2 = 999;
                    let MinPoses2 = new Array();
                    for (let i = 0; i <= 63; i++) {
                        let NBState = Cul3(BoardStates, 1, i);
                        if (NBState != null) {
                            let NVal = Cul4(NBState, 0, MinVal2);
                            if (NVal <= MinVal2) {
                                if (NVal == MinVal2) {
                                    MinPoses2.push(i);
                                }
                                else {
                                    MinVal2 = NVal;
                                    MinPoses2 = [i];
                                }
                            }
                        }
                    }
                    CPos = MinPoses2[Math.floor(Math.random() * MinPoses2.length)];
                    break;
                case 3:
                    // [Predict 5]
                    let MinVal3 = 999;
                    let MinPoses3 = new Array();
                    for (let i = 0; i <= 63; i++) {
                        let NBState = Cul3(BoardStates, 1, i);
                        if (NBState != null) {
                            let NVal = Cul5(NBState, 0, MinVal3, 5);
                            if (NVal <= MinVal3) {
                                if (NVal == MinVal3) {
                                    MinPoses3.push(i);
                                }
                                else {
                                    MinVal3 = NVal;
                                    MinPoses3 = [i];
                                }
                            }
                        }
                    }
                    CPos = MinPoses3[Math.floor(Math.random() * MinPoses3.length)];
                    break;
                case 4:
                    // [Predict 7]
                    calcnum = 0;
                    let MinVal4 = 999;
                    let MinPoses4 = new Array();
                    for (let i = 0; i <= 63; i++) {
                        let NBState = Cul3(BoardStates, 1, i);
                        if (NBState != null) {
                            let NVal = Cul5(NBState, 0, MinVal4, 7);
                            if (NVal <= MinVal4) {
                                if (NVal == MinVal4) {
                                    MinPoses4.push(i);
                                }
                                else {
                                    MinVal4 = NVal;
                                    MinPoses4 = [i];
                                }
                            }
                        }
                    }
                    CPos = MinPoses4[Math.floor(Math.random() * MinPoses4.length)];
                    break;
            }
            return CPos;
        };

        function Val(BState) {
            let ValNum = 0;
            let CountR = 0;
            let CountB = 0;
            for (let i = 0; i <= 63; i++) {
                let ThisValNum = 0;
                let Coef = 0;
                if (0 <= BState[i]) {
                    if (BState[i] <= 0.5) {
                        Coef = 1;
                        CountR++;
                    }
                    else {
                        Coef = -1;
                        CountB++;
                    }
                    if (i % 8 == 0 || i % 8 == 7) {
                        ThisValNum += 4 * Coef;
                    }
                    if (Math.floor(i / 8) == 0 || Math.floor(i / 8) == 7) {
                        ThisValNum += 4 * Coef;
                    }
                    else if (ThisValNum == 0) {
                        ThisValNum = 1 * Coef;
                    }
                    else if (ThisValNum == 8) {
                        ThisValNum = 16;
                    }
                }
                ValNum += ThisValNum;
            }
            if (CountR == 0) {
                ValNum = -999;
            }
            if (CountB == 0) {
                ValNum = 999;
            }
            return ValNum;
        };

        function Cul1(BState, Col, Lim) {
            if (Col == 0) {
                let MaxVal = -999;
                let MaxPoses = new Array();
                for (let i = 0; i <= 63; i++) {
                    let ThisVal = Cul2(BState, 0, i);
                    if (ThisVal != null) {
                        if (MaxVal <= ThisVal) {
                            if (ThisVal == MaxVal) {
                                MaxPoses.push(i);
                            }
                            else {
                                MaxVal = ThisVal;
                                MaxPoses = [i];
                            }
                        }
                        if (Lim <= ThisVal) {
                            break;
                        }
                    }
                }
                return [MaxPoses[Math.floor(Math.random() * MaxPoses.length)], MaxVal];
            }
            if (Col == 1) {
                let MinVal = 999;
                let MinPoses = new Array();
                for (let i = 0; i <= 63; i++) {
                    let ThisVal = Cul2(BState, 1, i);
                    if (ThisVal != null) {
                        if (ThisVal <= MinVal) {
                            if (ThisVal == MinVal) {
                                MinPoses.push(i);
                            }
                            else {
                                MinVal = ThisVal;
                                MinPoses = [i];
                            }
                        }
                        if (ThisVal <= Lim) {
                            break;
                        }
                    }
                }
                calcnum++;
                return [MinPoses[Math.floor(Math.random() * MinPoses.length)], MinVal];
            }
        }

        function Cul2(BState, Col, Pos) {
            let NBState = Cul3(BState, Col, Pos);
            if (NBState == null) {
                return null;
            }
            else {
                return Val(NBState);
            }
        }

        function Cul3(BState, Col, Pos) {
            if (BState[Pos] == -1) {
                let PosX = Pos % 8;
                let PosY = Math.floor(Pos / 8);
                let Dir = [1, -1, 8, -8, 7, -7, 9, -9];
                let DirNums = [7 - PosX, PosX, 7 - PosY, PosY, Math.min(PosX, 7 - PosY), Math.min(7 - PosX, PosY), Math.min(7 - PosX, 7 - PosY), Math.min(PosX, PosY)];
                let CanPlace = false;
                let LineCols = 0;
                let LinesNum = 0;
                let NBState = BState.concat();
                if (Col == 0) {
                    for (let j = 0; j <= 7; j++) {
                        if (DirNums[j] >= 2 && 0 <= BState[Pos + Dir[j]]) {
                            for (let k = 2; k <= DirNums[j]; k++) {
                                if (BState[Pos + Dir[j] * k] == -1) {
                                    break;
                                }
                                else if (0 <= BState[Pos + Dir[j] * k] && BState[Pos + Dir[j] * k] <= 0.5) {
                                    CanPlace = true;
                                    let Length = k;
                                    for (let i = k; i <= DirNums[j]; i++) {
                                        if (BState[Pos + Dir[j] * k] == -1) {
                                            break;
                                        }
                                        else if (0 <= BState[Pos + Dir[j] * i] && BState[Pos + Dir[j] * i] <= 0.5) {
                                            Length = i;
                                        }
                                    }
                                    let TempLineCols = 0;
                                    TempLineCols += 0;
                                    for (let i = 1; i <= Length; i++) {
                                        TempLineCols += BState[Pos + Dir[j] * i];
                                    }
                                    for (let i = 0; i <= Length; i++) {
                                        NBState[Pos + Dir[j] * i] = TempLineCols / (Length + 1);
                                    }
                                    LineCols += TempLineCols / (Length + 1);
                                    LinesNum++;
                                    break;
                                }
                            }
                        }
                    }
                }
                else {
                    for (let j = 0; j <= 7; j++) {
                        if (DirNums[j] >= 2 && 0 <= BState[Pos + Dir[j]]) {
                            for (let k = 2; k <= DirNums[j]; k++) {
                                if (BState[Pos + Dir[j] * k] == -1) {
                                    break;
                                }
                                else if (0.5 <= BState[Pos + Dir[j] * k]) {
                                    CanPlace = true;
                                    let Length = k;
                                    for (let i = k; i <= DirNums[j]; i++) {
                                        if (BState[Pos + Dir[j] * k] == -1) {
                                            break;
                                        }
                                        else if (0.5 <= BState[Pos + Dir[j] * i]) {
                                            Length = i;
                                        }
                                    }
                                    let TempLineCols = 0;
                                    TempLineCols += 1;
                                    for (let i = 1; i <= Length; i++) {
                                        TempLineCols += BState[Pos + Dir[j] * i];
                                    }
                                    for (let i = 0; i <= Length; i++) {
                                        NBState[Pos + Dir[j] * i] = TempLineCols / (Length + 1);
                                    }
                                    LineCols += TempLineCols / (Length + 1);
                                    LinesNum++;
                                    break;
                                }
                            }
                        }
                    }
                }
                if (!CanPlace) {
                    return null;
                }
                NBState[Pos] = LineCols / LinesNum;
                return NBState;
            }
            return null;
        }

        function Cul4(BState, Col, Lim) {
            if (Col == 0) {
                let MaxVal = -999;
                for (let i = 0; i <= 63; i++) {
                    let NBState = Cul3(BState, 0, i);
                    if (NBState != null) {
                        let NVal = Cul1(NBState, 1, MaxVal)[1];
                        if (MaxVal < NVal) {
                            MaxVal = NVal
                        }
                        if (Lim <= NVal) {
                            break;
                        }
                    }
                }
                return MaxVal;
            }
            /*else{
                // Unused! (>_<)
            }*/
        }

        function Cul5(BState, Col, Lim, Pred) {
            if (Col == 0) {
                let MaxVal = -999;
                for (let i = 0; i <= 63; i++) {
                    let NBState = Cul3(BState, 0, i);
                    if (NBState != null) {
                        let NVal = Cul5(NBState, 1, MaxVal, Pred - 2);
                        if (MaxVal < NVal) {
                            MaxVal = NVal
                        }
                        if (Lim <= NVal) {
                            break;
                        }
                    }
                }
                return MaxVal;
            }
            else {
                let MinVal = 999;
                for (let i = 0; i <= 63; i++) {
                    let NBState = Cul3(BState, 1, i);
                    if (NBState != null) {
                        let NVal = 0;
                        if (Pred == 3) {
                            NVal = Cul4(NBState, 0, MinVal);
                        }
                        else {
                            NVal = Cul5(NBState, 0, MinVal, Pred);
                        }
                        if (NVal < MinVal) {
                            MinVal = NVal
                        }
                        if (NVal <= Lim) {
                            break;
                        }
                    }
                }
                return MinVal;
            }
        }

        function ScoreNum() {
            let ScoreR = 0;
            let ScoreB = 0;
            for (let i = 0; i <= 63; i++) {
                if (0 <= BoardStates[i] && BoardStates[i] <= 0.5) {
                    ScoreR++;
                }
                else if (0.5 <= BoardStates[i]) {
                    ScoreB++;
                }
            }
            let Nums = [Math.floor(ScoreR / 10), ScoreR % 10, Math.floor(ScoreB / 10), ScoreB % 10];
            for (let i = 0; i <= 3; i++) {
                mainScene.removeChild(NowNums[i]);
                NowNums[i].image = game.assets["N" + Nums[i] + ".png"];
                mainScene.addChild(NowNums[i]);
                mainScene.insertBefore(NowNums[i], null);
            }
            NowNums[0].moveTo(337.5, 900);
            NowNums[1].moveTo(387.5, 900);
            NowNums[2].moveTo(562.5, 900);
            NowNums[3].moveTo(612.5, 900);
        }
    };
    game.start();
};