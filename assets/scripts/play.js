cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function () {
        this.setTouchControl()
    },
    setTouchControl() {
        // touch input
        // cc.eventManager.addListener({
        //     event: cc.EventListener.TOUCH_ONE_BY_ONE,
        //     onTouchBegan: function (touch, event) {
        //         console.log('onTouchBegan', touch, event)
        //         return true;
        //     },
        //     onTouchEnded: function (touch, event) {
        //         console.log('onTouchEnded', touch, event)
        //     }
        // }, this.node);
        this.node.on('touchend', function (event) {
            this.node.dispatchEvent(new cc.Event.EventCustom('gamestart', true))
            this.node.active = false
        }, this)
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
