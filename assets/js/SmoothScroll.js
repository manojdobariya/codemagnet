(function(){var defaultOptions={frameRate:150,animationTime:400,stepSize:100,pulseAlgorithm:!0,pulseScale:4,pulseNormalize:1,accelerationDelta:50,accelerationMax:3,keyboardSupport:!0,arrowScroll:50,fixedBackground:!0,excluded:''};var options=defaultOptions;var isExcluded=!1;var isFrame=!1;var direction={x:0,y:0};var initDone=!1;var root=document.documentElement;var activeElement;var observer;var refreshSize;var deltaBuffer=[];var deltaBufferTimer;var isMac=/^Mac/.test(navigator.platform);function initTest(){if(options.keyboardSupport){addEvent('keydown',keydown)}}
function init(){if(initDone||!document.body)return;initDone=!0;var body=document.body;var html=document.documentElement;var windowHeight=window.innerHeight;var scrollHeight=body.scrollHeight;root=(document.compatMode.indexOf('CSS')>=0)?html:body;activeElement=body;initTest();if(top!=self){isFrame=!0}else if(isOldSafari&&scrollHeight>windowHeight&&(body.offsetHeight<=windowHeight||html.offsetHeight<=windowHeight)){var fullPageElem=document.createElement('div');fullPageElem.style.cssText='position:absolute; z-index:-10000; '+'top:0; left:0; right:0; height:'+root.scrollHeight+'px';document.body.appendChild(fullPageElem);var pendingRefresh;refreshSize=function(){if(pendingRefresh)return;pendingRefresh=setTimeout(function(){if(isExcluded)return;fullPageElem.style.height='0';fullPageElem.style.height=root.scrollHeight+'px';pendingRefresh=null},500)};setTimeout(refreshSize,10);addEvent('resize',refreshSize);var config={attributes:!0,childList:!0,characterData:!1};observer=new MutationObserver(refreshSize);observer.observe(body,config);if(root.offsetHeight<=windowHeight){var clearfix=document.createElement('div');clearfix.style.clear='both';body.appendChild(clearfix)}}
if(!options.fixedBackground&&!isExcluded){body.style.backgroundAttachment='scroll';html.style.backgroundAttachment='scroll'}}
function cleanup(){observer&&observer.disconnect();removeEvent(wheelEvent,wheel);removeEvent('mousedown',mousedown);removeEvent('keydown',keydown);removeEvent('resize',refreshSize);removeEvent('load',init)}
var que=[];var pending=!1;var lastScroll=Date.now();function scrollArray(elem,left,top){directionCheck(left,top);if(options.accelerationMax!=1){var now=Date.now();var elapsed=now-lastScroll;if(elapsed<options.accelerationDelta){var factor=(1+(50/elapsed))/2;if(factor>1){factor=Math.min(factor,options.accelerationMax);left*=factor;top*=factor}}
lastScroll=Date.now()}
que.push({x:left,y:top,lastX:(left<0)?0.99:-0.99,lastY:(top<0)?0.99:-0.99,start:Date.now()});if(pending){return}
var scrollRoot=getScrollRoot();var isWindowScroll=(elem===scrollRoot||elem===document.body);if(elem.$scrollBehavior==null&&isScrollBehaviorSmooth(elem)){elem.$scrollBehavior=elem.style.scrollBehavior;elem.style.scrollBehavior='auto'}
var step=function(time){var now=Date.now();var scrollX=0;var scrollY=0;for(var i=0;i<que.length;i++){var item=que[i];var elapsed=now-item.start;var finished=(elapsed>=options.animationTime);var position=(finished)?1:elapsed/options.animationTime;if(options.pulseAlgorithm){position=pulse(position)}
var x=(item.x*position-item.lastX)>>0;var y=(item.y*position-item.lastY)>>0;scrollX+=x;scrollY+=y;item.lastX+=x;item.lastY+=y;if(finished){que.splice(i,1);i--}}
if(isWindowScroll){window.scrollBy(scrollX,scrollY)}else{if(scrollX)elem.scrollLeft+=scrollX;if(scrollY)elem.scrollTop+=scrollY}
if(!left&&!top){que=[]}
if(que.length){requestFrame(step,elem,(1000/options.frameRate+1))}else{pending=!1;if(elem.$scrollBehavior!=null){elem.style.scrollBehavior=elem.$scrollBehavior;elem.$scrollBehavior=null}}};requestFrame(step,elem,0);pending=!0}
function wheel(event){if(!initDone){init()}
var target=getEventTargetDeep(event);if(event.defaultPrevented||event.ctrlKey){return!0}
if(isNodeName(activeElement,'embed')||(isNodeName(target,'embed')&&/\.pdf/i.test(target.src))||isNodeName(activeElement,'object')){return!0}
var deltaX=-event.wheelDeltaX||event.deltaX||0;var deltaY=-event.wheelDeltaY||event.deltaY||0;if(isMac){if(event.wheelDeltaX&&isDivisible(event.wheelDeltaX,120)){deltaX=-120*(event.wheelDeltaX/Math.abs(event.wheelDeltaX))}
if(event.wheelDeltaY&&isDivisible(event.wheelDeltaY,120)){deltaY=-120*(event.wheelDeltaY/Math.abs(event.wheelDeltaY))}}
if(!deltaX&&!deltaY){deltaY=-event.wheelDelta||0}
if(event.deltaMode===1){deltaX*=40;deltaY*=40}
var overflowing=overflowingAncestor(target);if(!overflowing){if(isFrame&&isChrome){Object.defineProperty(event,"target",{value:window.frameElement});return parent.wheel(event)}
return!0}
if(isTouchpad(deltaY)){return!0}
if(Math.abs(deltaX)>1.2){deltaX*=options.stepSize/120}
if(Math.abs(deltaY)>1.2){deltaY*=options.stepSize/120}
scrollArray(overflowing,deltaX,deltaY);event.preventDefault();scheduleClearCache()}
function keydown(event){var target=getEventTargetDeep(event);var modifier=event.ctrlKey||event.altKey||event.metaKey||(event.shiftKey&&event.code!=='Space');if(!document.body.contains(activeElement)){activeElement=document.activeElement}
var inputNodeNames=/^(textarea|select|embed|object)$/i;var buttonTypes=/^(button|submit|radio|checkbox|file|color|image)$/i;if(event.defaultPrevented||inputNodeNames.test(target.nodeName)||isNodeName(target,'input')&&!buttonTypes.test(target.type)||isNodeName(activeElement,'video')||isInsideYoutubeVideo(event)||target.isContentEditable||modifier){return!0}
if((isNodeName(target,'button')||isNodeName(target,'input')&&buttonTypes.test(target.type))&&event.code==='Space'){return!0}
if(isNodeName(target,'input')&&target.type=='radio'&&(event.code==='ArrowUp'||event.code==='ArrowDown'||event.code==='ArrowLeft'||event.code==='ArrowRight')){return!0}
var shift,x=0,y=0;var overflowing=overflowingAncestor(activeElement);if(!overflowing){return(isFrame&&isChrome)?parent.keydown(event):!0}
var clientHeight=overflowing.clientHeight;if(overflowing==document.body){clientHeight=window.innerHeight}
switch(event.code){case 'ArrowUp':y=-options.arrowScroll;break;case 'ArrowDown':y=options.arrowScroll;break;case 'Space':shift=event.shiftKey?1:-1;y=-shift*clientHeight*0.9;break;case 'PageUp':y=-clientHeight*0.9;break;case 'PageDown':y=clientHeight*0.9;break;case 'Home':if(overflowing==document.body&&document.scrollingElement)
overflowing=document.scrollingElement;y=-overflowing.scrollTop;break;case 'End':var scroll=overflowing.scrollHeight-overflowing.scrollTop;var scrollRemaining=scroll-clientHeight;y=(scrollRemaining>0)?scrollRemaining+10:0;break;case 'ArrowLeft':x=-options.arrowScroll;break;case 'ArrowRight':x=options.arrowScroll;break;default:return!0}
scrollArray(overflowing,x,y);event.preventDefault();scheduleClearCache()}
function mousedown(event){activeElement=getEventTargetDeep(event)}
function getEventTargetDeep(event){return event.composedPath?event.composedPath()[0]:event.target}
var uniqueID=(function(){var i=0;return function(el){return el.uniqueID||(el.uniqueID=i++)}})();var cacheX={};var cacheY={};var clearCacheTimer;var smoothBehaviorForElement={};function scheduleClearCache(){clearTimeout(clearCacheTimer);clearCacheTimer=setInterval(function(){cacheX=cacheY=smoothBehaviorForElement={}},1*1000)}
function setCache(elems,overflowing,x){var cache=x?cacheX:cacheY;for(var i=elems.length;i--;)
cache[uniqueID(elems[i])]=overflowing;return overflowing}
function getCache(el,x){return(x?cacheX:cacheY)[uniqueID(el)]}
function overflowingAncestor(el){var elems=[];var body=document.body;var rootScrollHeight=root.scrollHeight;while(el){var cached=getCache(el,!1);if(cached){return setCache(elems,cached)}
elems.push(el);if(rootScrollHeight===el.scrollHeight){var topOverflowsNotHidden=overflowNotHidden(root)&&overflowNotHidden(body);var isOverflowCSS=topOverflowsNotHidden||overflowAutoOrScroll(root);if(isFrame&&isContentOverflowing(root)||!isFrame&&isOverflowCSS){return setCache(elems,getScrollRoot())}}else if(isContentOverflowing(el)&&overflowAutoOrScroll(el)){return setCache(elems,el)}
el=el.parentElement||(el.getRootNode&&el.getRootNode().host)}}
function isContentOverflowing(el){return(el.clientHeight+10<el.scrollHeight)}
function overflowNotHidden(el){var overflow=getComputedStyle(el,'').getPropertyValue('overflow-y');return(overflow!=='hidden')}
function overflowAutoOrScroll(el){var overflow=getComputedStyle(el,'').getPropertyValue('overflow-y');return(overflow==='scroll'||overflow==='auto')}
function isScrollBehaviorSmooth(el){var id=uniqueID(el);if(smoothBehaviorForElement[id]==null){var scrollBehavior=getComputedStyle(el,'')['scroll-behavior'];smoothBehaviorForElement[id]=('smooth'==scrollBehavior)}
return smoothBehaviorForElement[id]}
function addEvent(type,fn,arg){window.addEventListener(type,fn,arg||!1)}
function removeEvent(type,fn,arg){window.removeEventListener(type,fn,arg||!1)}
function isNodeName(el,tag){return el&&(el.nodeName||'').toLowerCase()===tag.toLowerCase()}
function directionCheck(x,y){x=(x>0)?1:-1;y=(y>0)?1:-1;if(direction.x!==x||direction.y!==y){direction.x=x;direction.y=y;que=[];lastScroll=0}}
try{if(localStorage.SS_deltaBuffer){deltaBuffer=localStorage.SS_deltaBuffer.split(',')}}catch(e){}
function isTouchpad(deltaY){if(!deltaY)return;if(!deltaBuffer.length){deltaBuffer=[deltaY,deltaY,deltaY]}
deltaY=Math.abs(deltaY);deltaBuffer.push(deltaY);deltaBuffer.shift();clearTimeout(deltaBufferTimer);deltaBufferTimer=setTimeout(function(){try{localStorage.SS_deltaBuffer=deltaBuffer.join(',')}catch(e){}},1000);var dpiScaledWheelDelta=deltaY>120&&allDeltasDivisableBy(deltaY);var tp=!allDeltasDivisableBy(120)&&!allDeltasDivisableBy(100)&&!dpiScaledWheelDelta;if(deltaY<50)return!0;return tp}
function isDivisible(n,divisor){return(Math.floor(n/divisor)==n/divisor)}
function allDeltasDivisableBy(divisor){return(isDivisible(deltaBuffer[0],divisor)&&isDivisible(deltaBuffer[1],divisor)&&isDivisible(deltaBuffer[2],divisor))}
function isInsideYoutubeVideo(event){var elem=getEventTargetDeep(event);var isControl=!1;if(document.URL.indexOf('www.youtube.com/watch')!=-1){do{isControl=(elem.classList&&elem.classList.contains('html5-video-controls'));if(isControl)break}while((elem=elem.parentNode));}
return isControl}
var requestFrame=(function(){return(window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||function(callback,element,delay){window.setTimeout(callback,delay||(1000/60))})})();var MutationObserver=(window.MutationObserver||window.WebKitMutationObserver||window.MozMutationObserver);var getScrollRoot=(function(){var SCROLL_ROOT=document.scrollingElement;return function(){if(!SCROLL_ROOT){var dummy=document.createElement('div');dummy.style.cssText='height:10000px;width:1px;';document.body.appendChild(dummy);var bodyScrollTop=document.body.scrollTop;var docElScrollTop=document.documentElement.scrollTop;window.scrollBy(0,3);if(document.body.scrollTop!=bodyScrollTop)(SCROLL_ROOT=document.body);else(SCROLL_ROOT=document.documentElement);window.scrollBy(0,-3);document.body.removeChild(dummy)}
return SCROLL_ROOT}})();function pulse_(x){var val,start,expx;x=x*options.pulseScale;if(x<1){val=x-(1-Math.exp(-x))}else{start=Math.exp(-1);x-=1;expx=1-Math.exp(-x);val=start+(expx*(1-start))}
return val*options.pulseNormalize}
function pulse(x){if(x>=1)return 1;if(x<=0)return 0;if(options.pulseNormalize==1){options.pulseNormalize/=pulse_(1)}
return pulse_(x)}
var userAgent=window.navigator.userAgent;var isEdge=/Edge/.test(userAgent);var isChrome=/chrome/i.test(userAgent)&&!isEdge;var isSafari=/safari/i.test(userAgent)&&!isEdge;var isMobile=/mobile/i.test(userAgent);var isIEWin7=/Windows NT 6.1/i.test(userAgent)&&/rv:11/i.test(userAgent);var isOldSafari=isSafari&&(/Version\/8/i.test(userAgent)||/Version\/9/i.test(userAgent));var isEnabledForBrowser=(isChrome||isSafari||isIEWin7)&&!isMobile;var supportsPassive=!1;try{window.addEventListener("test",null,Object.defineProperty({},'passive',{get:function(){supportsPassive=!0}}))}catch(e){}
var wheelOpt=supportsPassive?{passive:!1}:!1;var wheelEvent='onwheel' in document.createElement('div')?'wheel':'mousewheel';if(wheelEvent&&isEnabledForBrowser){addEvent(wheelEvent,wheel,wheelOpt);addEvent('mousedown',mousedown);addEvent('load',init)}
function SmoothScroll(optionsToSet){for(var key in optionsToSet)
if(defaultOptions.hasOwnProperty(key))
options[key]=optionsToSet[key]}
SmoothScroll.destroy=cleanup;if(window.SmoothScrollOptions)
SmoothScroll(window.SmoothScrollOptions);if(typeof define==='function'&&define.amd)
define(function(){return SmoothScroll});else if('object'==typeof exports)
module.exports=SmoothScroll;else window.SmoothScroll=SmoothScroll})()