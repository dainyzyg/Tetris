cc.Class({
    extends: cc.Component,
    properties: {
        backGround: {
            default: null,
            type: cc.Node
        },
        diamondsPrefab: {
            default: null,
            type: cc.Prefab
        },
        diamondsPosition: {
            default: {},
            type: cc.Object
        },
        activeDiamonds: {
            default: null,
            type: cc.Node
        },
        scoreLabel: {
            default: null,
            type: cc.Label
        },
        leftBtn: {
            default: null,
            type: cc.Node
        },
        rightBtn: {
            default: null,
            type: cc.Node
        },
        rotationBtn: {
            default: null,
            type: cc.Node
        },
        downBtn: {
            default: null,
            type: cc.Node
        },
        gameOverPanel: {
            default: null,
            type: cc.Node
        },
        restartBtn: {
            default: null,
            type: cc.Node
        },
        pauseBtn: {
            default: null,
            type: cc.Node
        },
        resumeBtn: {
            default: null,
            type: cc.Node
        },
        left: false,
        right: false,
        rotation: false,
        down: false
    },
    // use this for initialization
    onLoad: function () {
        this.addListener()

    },
    addVirtualBtnListener() {
        var virtualBtn = ['left', 'right', 'down', 'rotation']
        virtualBtn.forEach(btnName => {
            this[`${btnName}Btn`].on('touchstart', event => {
                this[btnName] = true
                var callback = function () {
                    if (this[btnName]) {
                        this.activeDiamonds.move(btnName)
                    } else {
                        this.unschedule(callback)
                    }
                }
                this.activeDiamonds.move(btnName)
                this.schedule(callback, .05, cc.macro.REPEAT_FOREVER, .2)
            }, this)

            this[`${btnName}Btn`].on('touchend', event => {
                this[btnName] = false
            }, this)
        })
    },
    addListener() {
        this.node.on('gamestart', event => {
            console.log('gamestart')
            this.startGame()
        }, this)
        this.addVirtualBtnListener()
        this.restartBtn.on('touchstart', event => {
            this.gameOverPanel.active = false
            this.restart()
        }, this)
        this.pauseBtn.on('touchstart', event => {
            this.pauseBtn.active = false
            this.resumeBtn.active = true
            cc.director.pause()
        }, this)
        this.resumeBtn.on('touchstart', event => {
            this.pauseBtn.active = true
            this.resumeBtn.active = false
            cc.director.resume()
        }, this)
    },
    restart() {
        for (var y in this.diamondsPosition) {
            this.diamondsPosition[y].forEach((value, key, map) => {
                value.destroy()
            })
        }
        this.diamondsPosition = {}
        this.scoreLabel.string = 0
        this.spawnNewDiamonds()
    },
    startGame() {
        this.spawnNewDiamonds()
        this.setInputControl()
    },
    addDiamondsPosition(diamondsInfo) {
        var isGameOver = false
        console.log('addDiamondsPosition')
        diamondsInfo.forEach(info => {
            this.diamondsPosition[info.v2.y] = this.diamondsPosition[info.v2.y] || new Map()
            this.diamondsPosition[info.v2.y].set(info.v2.x, info.node)
            info.node.removeFromParent()
            this.backGround.addChild(info.node)
            info.node.setPosition(info.v2)
            if (info.v2.y > 640) {
                console.log(info.v2.y)
                isGameOver = true
            }
        })
        if (isGameOver) {
            this.gameOver()
        } else {
            this.clearDiamonds()
        }
    },
    gameOver() {
        console.log('gameOver')
        this.gameOverPanel.active = true
        //cc.game.pause()
    },
    spawnNewDiamonds() {
        var diamonds = cc.instantiate(this.diamondsPrefab)
        this.activeDiamonds = diamonds.getComponent('diamond')
        this.activeDiamonds.game = this
        // 将新增的节点添加到 Canvas 节点下面
        this.backGround.addChild(diamonds)
    },
    addScore(score) {
        this.scoreLabel.string = Number(this.scoreLabel.string) + score
    },
    clearDiamonds() {
        var diamondsPosition = this.diamondsPosition
        var clearYs = []
        for (var y in diamondsPosition) {
            if (diamondsPosition[y].size >= 10) {
                clearYs.push(y)
            }
        }
        if (clearYs.length) {
            this.diamondsDown(clearYs)
        } else {
            this.spawnNewDiamonds()
        }

    },
    diamondsDown(clearYs) {
        var diamondsPosition = this.diamondsPosition
        var count = clearYs.length * 10
        clearYs.forEach(y => {
            diamondsPosition[y].forEach((value, key, map) => {
                var action = cc.blink(.5, 3)
                var callBack = cc.callFunc(() => {
                    value.destroy()
                    count--
                    if (count == 0) {
                        var newDiamondsPosition = {}
                        Object.keys(diamondsPosition).forEach(py => {
                            if (clearYs.indexOf(py) == -1) {
                                var clearCount = clearYs.filter(item => {
                                    return Number(py) > Number(item)
                                }).length
                                diamondsPosition[py].forEach((value, key, map) => {
                                    value.y -= 64 * clearCount
                                })
                                newDiamondsPosition[py - 64 * clearCount] = diamondsPosition[py]
                            }
                        })
                        this.diamondsPosition = diamondsPosition = newDiamondsPosition
                        this.addScore(clearYs.length)
                        this.spawnNewDiamonds()
                    }
                }, value)
                value.runAction(cc.sequence(action, callBack))
            })
        })
    },
    setInputControl: function () {
        var self = this;
        // 添加键盘事件监听
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            // 有按键按下时，判断是否是我们指定的方向控制键，并设置向对应方向加速
            onKeyPressed: function (keyCode, event) {
                switch (keyCode) {
                    case cc.KEY.a:
                        self.activeDiamonds.move('left')
                        break;
                    case cc.KEY.d:
                        self.activeDiamonds.move('right')
                        break;
                    case cc.KEY.w:
                        self.activeDiamonds.move('rotation')
                        break;
                    case cc.KEY.s:
                        self.activeDiamonds.move('down')
                        break;
                }
            },
            // 松开按键时，停止向该方向的加速
            onKeyReleased: function (keyCode, event) {
                switch (keyCode) {
                    case cc.KEY.s:
                        break;
                    case cc.KEY.d:
                        break;
                }
            }
        }, self.node);
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {    
    // },
});
