const os = (function(){
      var ua = navigator.userAgent,  
      isWindowsPhone = /(?:Windows Phone)/.test(ua),  
      isSymbian = /(?:SymbianOS)/.test(ua) || isWindowsPhone,   
      isAndroid = /(?:Android)/.test(ua),   
      isFireFox = /(?:Firefox)/.test(ua),   
      isChrome = /(?:Chrome|CriOS)/.test(ua),  
      isTablet = /(?:iPad|PlayBook)/.test(ua) || (isAndroid && !/(?:Mobile)/.test(ua)) || (isFireFox && /(?:Tablet)/.test(ua)),  
      isPhone = /(?:iPhone)/.test(ua) && !isTablet,  
      isPc = !isPhone && !isAndroid && !isSymbian;  
      return {  
           isTablet: isTablet,  
           isPhone: isPhone,  
           isAndroid : isAndroid,  
           isPc : isPc  
      };  
 }());

export default class PolyfillScroll{
    constructor({scrollWrap, scrollContent, cb, bar:{width="10px",height="40px",background="#000",right="2px"} = {}}){
        this.portTouch = {
            sx: 0,
            sy: 0,
            ex: 0,
            ey: 0
        };
        this.pointSE = {
            sx: 0,
            sy: 0,
            ex: 0,
            ey: 0,
            st: 0,
            et: 0
        };
        this.moveDistance = 0;
        this.transitionEndStatus = true;
        this.scrollWrap = document.querySelector(scrollWrap);
        this.scrollContent = document.querySelector(scrollContent);
        this.scrollWrapHeight = parseFloat(window.getComputedStyle(this.scrollWrap,null).getPropertyValue('height'));
        this.contentHeight = parseFloat(window.getComputedStyle(this.scrollContent,null).getPropertyValue('height'));
        if(this.contentHeight <= this.scrollWrapHeight) return;

        this.scrollBarMove = 0;

        this.bar = {};
        this.bar.width = width;
        this.bar.height = height;
        this.bar.background=background;
        this.bar.right=right;

        this.cb = cb;
        this.init();
    }

    init(){
        const that =this;
        this.refresh();
        const bool = !('transform' in document.body.style) && !('webkitTransform' in document.body.style);
        if(bool){
            this.scrollWrap.style.overflowY = 'auto';
            return this.scrollLoad(this.scrollWrap,this.cb);
        }

        if(os.isPc){
            this.setScrollBar();
            return this.moveWheel();
        }

        this.scrollWrap.addEventListener('touchstart',this.touchstart.bind(this));
        this.scrollWrap.addEventListener('touchmove',this.touchmove.bind(this));
        this.scrollWrap.addEventListener('touchend',this.touchend.bind(this));
        this.scrollWrap.addEventListener('touchcancel',this.touchend.bind(this));

        //监听动画结束
        this.scrollContent.addEventListener('transitionend',function(){
            that.transitionEndStatus = true;
        });

    }

    //滚动条
    setScrollBar(){
        const that = this;
        const position = window.getComputedStyle(this.scrollWrap, null).getPropertyValue("position");
        if(/static/.test(position)) this.scrollWrap.style.position="relative";
        const track =document.createElement("div");
        const scrollBar =document.createElement("div");

        track.style.position="absolute";
        track.style.top="0";
        track.style.right = this.bar.right;
        track.style.width = this.bar.width;
        track.style.height = "100%";
        track.style.cursor = "pointer";

        scrollBar.style.width = this.bar.width;
        scrollBar.style.height = this.bar.height;
        scrollBar.style.background= this.bar.background;
        scrollBar.style.borderRadius= parseFloat(this.bar.width)/2+"px";
        scrollBar.style.right = "0px";
        scrollBar.style.top = "0px";
        scrollBar.style.position="absolute";
        track.appendChild(scrollBar);
        this.scrollWrap.appendChild(track);

        let downMove = false;
        let downMoveDistance = 0;
        scrollBar.addEventListener("mousedown",function(e){
            e.preventDefault();
            downMove = true;
            downMoveDistance = e.pageY;
        });

        window.addEventListener("mousemove",function(e){
            if(!downMove) return;
            const barMove = downMoveDistance - e.pageY;
            const contentMove = barMove / (that.scrollWrapHeight-parseFloat(that.bar.height)) * (that.contentHeight-that.scrollWrapHeight);
            that.translateMove(-contentMove,true);
            downMoveDistance = e.pageY;
        });

        window.addEventListener("mouseup",function(e){
            downMove = false;
        });


        this.scrollBar = scrollBar;
    }

    //moveWheel
    moveWheel(){
        // 参考来源：http://www.dengzhr.com/js/440
        const that = this;
        function wheel(event){
            let delta = 0;
            if(event.wheelDelta){
                delta = event.wheelDelta/120;
                if(window.opera) delta = -delta;
            }else if(event.detail){
                delta = -event.detail/3;
            }
            const deltaMove = delta*30;
            that.prevent.call(that,event,deltaMove);
            that.translateMove(-deltaMove,true);
        }

        this.scrollWrap.addEventListener("mousewheel",wheel,false);
        this.scrollWrap.addEventListener("DOMMouseScroll",wheel,false);

    }

    //移动滚动条
    moveScrollBar(){
        this.scrollBarMove = this.moveDistance * (this.scrollWrapHeight - parseFloat(this.bar.height)) / (this.contentHeight - this.scrollWrapHeight);
        this.scrollBar && (this.scrollBar.style.top = this.scrollBarMove + "px");
    }

    // fix某些浏览器不支持transfrom属性
    scrollLoad(ele,callback){
        const _ele = ele;
        _ele.addEventListener('scroll',function(){
            const scrollTop = this.scrollTop;
            callback && callback(-scrollTop);
        });
    }

    //move content
    translateMove(moveY,isPC,slide){
        this.contentHeight = parseFloat(window.getComputedStyle(this.scrollContent,null).getPropertyValue('height'));
        if(this.moveDistance + moveY <= 0){
            this.moveDistance = 0;
        }else if(this.moveDistance + moveY >= this.contentHeight-this.scrollWrapHeight){
            this.moveDistance = this.contentHeight-this.scrollWrapHeight;
        }else{
            this.moveDistance += moveY;
        }
        if(slide){
            this.scrollContent.setAttribute('style','-webkit-transform:translate3d(0px, '+(-this.moveDistance)+'px, 0px);-webkit-transition:-webkit-transform 0.3s cubic-bezier(0.3333, 0.6666, 0.6666, 1);');
            this.transitionEndStatus = false;
        }else{
            this.scrollContent.setAttribute('style','-webkit-transform:translate3d(0px, '+(-this.moveDistance)+'px, 0px);-ms-transform:translate3d(0px, '+(-this.moveDistance)+'px, 0px);-moz-transform:translate3d(0px, '+(-this.moveDistance)+'px, 0px);transform:translate3d(0px, '+(-this.moveDistance)+'px, 0px);');
        }
        if(isPC) this.moveScrollBar(); // pc有滚动条

        //移动 发布移动的距离
        this.cb && this.cb(this.moveDistance);
    }

    //停止自由滚动
    stopSlide(){
        if(!this.transitionEndStatus){
            var style = window.getComputedStyle(this.scrollContent,null);
            var transform = new WebKitCSSMatrix(style.webkitTransform);
            this.scrollContent.setAttribute('style','-webkit-transform:translate3d(0px, '+transform.m42+'px, 0px);');
        }
    }

    //滑动开始
    touchstart(e){
        this.stopSlide();
        this.portTouch.sx = e.targetTouches[0].clientX;
        this.portTouch.sy = e.targetTouches[0].clientY;

        this.pointSE.sx = this.portTouch.sx;
        this.pointSE.sy = this.portTouch.sy;
        this.pointSE.st = +new Date;
    }

    //滑动ing
    touchmove(e){
        this.portTouch.ex = e.targetTouches[0].clientX;
        this.portTouch.ey = e.targetTouches[0].clientY;
        var moveY = this.portTouch.ey - this.portTouch.sy;
        if(Math.abs(moveY) > Math.abs(this.portTouch.ex - this.portTouch.sx)){
            this.translateMove(-moveY);
        }

        this.portTouch.sx = this.portTouch.ex;
        this.portTouch.sy = this.portTouch.ey;

        //是否取消touch默认事件
        this.prevent(e,moveY);
    }

    //滑动结束
    touchend(e){
        this.pointSE.ex = this.portTouch.sx;
        this.pointSE.ey = this.portTouch.sy;
        this.pointSE.et = +new Date;
        var rate = Math.abs(this.pointSE.ey - this.pointSE.sy) / (this.pointSE.et - this.pointSE.st);
        var symbol = this.pointSE.ey - this.pointSE.sy > 0 ? 1 : -1;
        rate = parseInt(rate * 100)/100;
        if((Math.abs(this.pointSE.ey - this.pointSE.sy) > Math.abs(this.pointSE.ex - this.pointSE.sx))/* && rate > 0.7*/){
            this.translateMove(-rate*300*symbol,false,true);
        }
    }

    //取消默认事件
    prevent(e,changeDistance){
        if((this.moveDistance - changeDistance <= 0) || (this.moveDistance - changeDistance > this.contentHeight-this.scrollWrapHeight)) return true;
        e.preventDefault();
        e.stopPropagation();
    }

    //刷新
    refresh(){
        this.moveDistance = 0;
        if(os.isPc) this.translateMove(0,true);
        else this.translateMove(0);
    }
}