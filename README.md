#### PolyfillScroll
pc滚动条样式修改有极大兼容性问题，为了网页美观，polyfillScroll模拟滚动条，内容通过css3 translate3d模拟滚动，兼容移动端+PC，模拟滚动兼容IE9，如果是IE9以下会使用默认滚动条。cb回调函数会在触发滚动的时候发布distance，也就是滚动内容移动的距离。
适用于：模拟滚动，模拟滚动条，滚动加载
PolyfillScroll支持模拟内容以下事件：
- 移动端touch
- PC鼠标滚轮滚动
- PC拖动滚动条

#### Use
```
[PolyfillScroll touch容器 内容模拟滚动]
@param  {string} scrollWrap    [touch容器]
@param  {string} scrollContent [transform内容]
@param  {Object} bar [scrollBar style] 可选参数
@param  {Function} cb(distance) [每次触发移动就会发布cb函数；distance：从容器顶部滑动了的距离，符号为正数]
@return null
 *
@example  ***scrollWrap建议类名.scroll-wrap；scrollContent建议类名.scroll-content***
 *
const entity = new PolyfillScroll({
   scrollWrap:".scroll-wrap",
   scrollContent: ".scroll-content",
   bar:{   //=>可以省略或者添加单个bar.width字段
       width:"10px",
       height: "40px",
       background: "#000",
       right:"2px"
   },
   cb(distance){
       console.log(distance)
   }
});

@example
 let scrollWrap = document.querySelector('.scroll-wrap');
 let scrollContent = document.querySelector('.scroll-wrap ul');
 let scrollWrapHeight = parseFloat(window.getComputedStyle(scrollWrap,null).getPropertyValue('height'));
 const entity = new PolyfillScroll({
     scrollWrap:".scroll-wrap",
     scrollContent: ".scroll-wrap ul",
     cb(distance){
         console.log(distance);
         const contentHeight = parseFloat(window.getComputedStyle(scrollContent,null).getPropertyValue('height'));
         if(contentHeight - distance - scrollWrapHeight < 150){
             if(that.scrollLock) return;
             that.scrollLock = true;
             if(that.currentIdx === 0){
                 that.getModRank();
             }else{
                 that.getUserRank();
             }
         }
     }
 });
```