cc.Class({
    extends: cc.Component,
    properties: {
        speed: .8,
        timer: 0,
        hasDown: false
    },
    initDiamonds() {
        var diamondsArray = [
            {
                name: 'I',
                position: cc.v2(0, 768),
                childrenPosition: [cc.v2(32, -32), cc.v2(32, -96), cc.v2(32, 96), cc.v2(32, 32)],
                rotationLimit: 90
            },
            {
                name: 'T',
                position: cc.v2(32, 736),
                childrenPosition: [cc.v2(0, 0), cc.v2(64, 0), cc.v2(-64, 0), cc.v2(0, 64)],
                rotationLimit: 270
            },
            {
                name: 'S',
                position: cc.v2(32, 736),
                childrenPosition: [cc.v2(0, 0), cc.v2(64, 0), cc.v2(0, -64), cc.v2(-64, -64)],
                rotationLimit: 90
            },
            {
                name: 'Z',
                position: cc.v2(32, 736),
                childrenPosition: [cc.v2(0, 0), cc.v2(-64, 0), cc.v2(0, -64), cc.v2(64, -64)],
                rotationLimit: 90
            },
            {
                name: 'O',
                position: cc.v2(0, 704),
                childrenPosition: [cc.v2(32, 32), cc.v2(-32, 32), cc.v2(-32, -32), cc.v2(32, -32)],
                rotationLimit: 90
            },
            {
                name: 'L',
                position: cc.v2(32, 736),
                childrenPosition: [cc.v2(0, 0), cc.v2(64, 0), cc.v2(-64, 0), cc.v2(64, 64)],
                rotationLimit: 270
            },
            {
                name: 'J',
                position: cc.v2(32, 736),
                childrenPosition: [cc.v2(0, 0), cc.v2(64, 0), cc.v2(-64, 0), cc.v2(-64, 64)],
                rotationLimit: 270
            },
        ]
        //随机取一个方块
        var randomIndex = Math.floor(Math.random() * diamondsArray.length)
        var diamond = diamondsArray[randomIndex]
        this.node.children.forEach(item => {
            item.setPosition(diamond.childrenPosition.pop())
        })
        var randomRotation = Math.floor(Math.random() * (diamond.rotationLimit / 90 + 1)) * 90
        this.node.rotation = randomRotation
        this.node.setPosition(diamond.position)
        this.rotationLimit = diamond.rotationLimit
    },
    // use this for initialization
    onLoad: function () {
        this.initDiamonds()
    },
    move(type) {
        if (this.hasDown) {
            return
        }
        var x = 0, y = 0, rotation = this.node.rotation
        switch (type) {
            case 'left':
                x = - 64
                break
            case 'right':
                x = 64
                break
            case 'rotation':
                if (this.node.rotation + 90 > this.rotationLimit) {
                    rotation = 0;
                } else {
                    rotation = this.node.rotation + 90
                }
                break
            case 'down':
                y -= 64
                break
        }
        var moveable = !this.node.children.some(item => {
            var newVec2 = this.convertToParentPosition(item, rotation)
            newVec2.y += y
            newVec2.x += x
            //触底或者触碰左右边缘
            if (newVec2.y <= -32 || Math.abs(newVec2.x) >= 352) {
                return true
            }
            //触碰其他方块
            if (this.game.diamondsPosition[newVec2.y] && this.game.diamondsPosition[newVec2.y].has(newVec2.x)) {
                return true
            }
            return false
        })
        if (moveable) {
            this.node.x += x
            this.node.y += y
            this.node.rotation = rotation
        }
        if (!moveable && type == 'down') {
            var diamondsInfo = []
            this.node.children.forEach(item => {
                var newVec2 = this.convertToParentPosition(item);
                diamondsInfo.push({
                    v2: newVec2,
                    node: item
                })
            })
            this.game.addDiamondsPosition(diamondsInfo)
            this.node.destroy()
            this.hasDown = true
        }
    },
    convertToParentPosition(node, newRotation) {
        var rotation = typeof (newRotation) != "undefined" ? newRotation : this.node.rotation
        Math.sin(2 * Math.PI / 360 * 180)
        var x = node.x * Math.round(Math.cos(rotation / 180 * Math.PI)) + node.y * Math.round(Math.sin(rotation / 180 * Math.PI))
        var y = -node.x * Math.round(Math.sin(rotation / 180 * Math.PI)) + node.y * Math.round(Math.cos(rotation / 180 * Math.PI))
        x += this.node.x
        y += this.node.y
        return cc.v2(x, y)
    },
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (this.hasDown) {
            return
        }
        if (this.timer >= this.speed) {
            this.move('down')
            this.timer = 0
        }
        this.timer += dt;
    },
});
