// ==UserScript==
// @name 通用VIP视频解析
// @author 河丶蟹
// @version 2.2.9
// @description 爱奇艺、腾讯视频、优酷、乐视、芒果TV、搜狐、1905、PPTV、B站。
// @include *
// @match *
// @createTime 2021-03-03 12:00:47
// @updateTime 2021-06-28 22:25:16
// ==/UserScript==
(function() {
	/*
	 * 自定义区域
	 * 变量值可自行更改
	 */
	// 主颜色(图标整体颜色,如方框颜色)
	const mianColor = "#de473c";
	// 副颜色(图标层次颜色,如字体颜色)
	const secondColor = "#f3f1e7";
	// 图标右边框距离
	const iconMarginRight = 2;
	// 图标上边框距离
	const iconMarginTop = 100;
	// 图标宽(最小30)
	var iconWidth = 45;
	// 图标高(图标大小)
	const iconHeight = 35;
	// 图标圆角比例(当高、宽一致时，0.5为圆圈)
	const iconFilletPercent = 0.3;
	// 解析接口菜单框展开的高度
	var developMenuHeight = 315;
	// 解析接口菜单框展开的速度（如果展开动画卡顿请设置0,单位是秒）
	var developMenuSecond = 0.2;
	// 解析接口（可多个）
	const parseInterfaces =["https://z1.m1907.cn/?eps=0&jx=","https://vip.parwix.com:4433/player/?url=","https://lecurl.cn/?url=","https://jx.m3u8.tv/jiexi/?url=","https://api.leduotv.com/wp-api/ifr.php?isDp=1&vid=","https://okjx.cc/?url=","https://m2090.com/?url=","http://51wujin.net/?url=","https://vip.2ktvb.com/player/?url=","https://660e.com/?url=","https://api.sigujx.com/?url=","https://jiexi.janan.net/jiexi/?url=","https://jx.618g.com/?url=","https://jx.ergan.top/?url=","https://api.147g.cc/m3u8.php?url=","http://17kyun.com/api.php?url="];
	/*
	 * 非自定义区域
	 * 以下代码勿动
	 * 以下代码勿动
	 * 以下代码勿动
	 */
	// 视频网站(规则已定，不可随意更改)
	const videoSites = ["v.qq.com","tv.sohu.com","iqiyi.com","youku.com","mgtv.com","m.le.com","www.le.com","1905.com","pptv.com","bilibili.com"];
	const currentUrl = document.location.href;
	// 判断是否加载后续代码
	if (self != top) {
		return;
	}
	var result = videoSites.some(site=>{
		if (currentUrl.match(site)) {
            return true;
		}
        return false;
	})
    if(!result){
        return;
    }
	// 图标宽度最小值判断（小于30默认30）
    if(iconWidth<30){
        iconWidth=30;
    }
	// 解析接口框高度判断（小于30默认30）
    if(developMenuHeight<(iconWidth*2.6)){
        developMenuHeight=iconWidth*2.6;
    }
	// 判断PC、移动端
	var uaLogo="pc";
	if(/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {
		uaLogo="mobile";
	}
	// 图标整体定位样式
	const globalStyle = "cursor:pointer;position:fixed;right:"+iconMarginRight+"px;top:"+iconMarginTop+"px;z-index:2147483647;";
	// 主图标(矩形)样式
	const mainIconStyle = "height:"+iconHeight+"px;width:"+iconWidth+"px;background:"+mianColor+";border-radius:"+(iconFilletPercent*iconWidth)+"px;box-sizing:border-box;box-shadow:-4px 4px 4px 0px rgba(0,0,0,0.4);";
	// 副图标(三角形)样式
	const triangleStyle = "border-left:"+(iconWidth*0.3)+"px solid "+secondColor+";border-top:"+(iconHeight*0.2)+"px solid transparent;border-bottom:"+(iconHeight*0.2)+"px solid transparent;position:absolute;right:31%;top:30%;";
	// 副图标(正方形)样式
	const squareStyle = "background:"+secondColor+";width:"+(iconWidth*0.26)+"px;height:"+(iconWidth*0.26)+"px;position:absolute;right:37%;top:37%;";
	// 菜单框外层样式
    const inMenuBoxStyle = "width:115%;height:100%;overflow-y:scroll;overflow-x:hidden;";
	// 菜单框里层样式
	const outMenuBoxStyle = "background:"+mianColor+";height:0px;overflow:hidden;font-size:"+(iconWidth*0.4)+"px;width:"+(iconWidth*2.4)+"px;position:absolute;right:0px;top:"+iconHeight+"px;box-shadow:-4px 4px 4px 0px rgba(0,0,0,0.4);border-radius:13px 0 1px 13px;transition:height "+developMenuSecond+"s;-moz-transition:height "+developMenuSecond+"s;-webkit-transition:height "+developMenuSecond+"s;-o-transition:height "+developMenuSecond+"s;";
	// 菜单项样式
	const MenuItemsStyle = "color:"+secondColor+";display: block;padding:"+(iconWidth*0.12)+"px "+(iconWidth*0.12)+"px "+(iconWidth*0.12)+"px "+(iconWidth*0.2)+"px ;width:"+(iconWidth*3)+"px;";
	// Iframe样式
	const IframeStyle = "frameborder='no' width='100%' height='100%' allowfullscreen='true' allowtransparency='true' frameborder='0' scrolling='no';";
    // 视频播放框类ID
	var classAndIDMap	= {"pc":{"v.qq.com":"mod_player","iqiyi.com":"flashbox","youku.com":"ykPlayer","mgtv.com":"mgtv-player-wrap","sohu.com":"x-player","le.com":"fla_box","1905.com":"player","pptv.com":"pplive-player","bilibili.com":"bilibili-player-video-wrap|player-limit-mask"},"mobile":{"v.qq.com":"mod_player","iqiyi.com":"m-box","youku.com":"h5-detail-player","mgtv.com":"video-area","sohu.com":"player-view","le.com":"playB","1905.com":"player","pptv.com":"pp-details-video","bilibili.com":"bilibiliPlayer|player-wrapper"}};
    // 创建图标
    createIcon();
	// 判断页面加载完成以后图标是否存在
	document.onreadystatechange = function(){
        if(document.readyState == 'complete'){
            if(!document.getElementById("mainIcon")){
                createIcon();
            }
        }
    }
    function createIcon(){
        try{
            var div = document.createElement("div");
            div.style.cssText = globalStyle;
            div.setAttribute("id","mainIcon");
            var html = "<div id='mainButton' style='"+mainIconStyle+"'><div id='triangle' style='"+triangleStyle+"'></div></div><div id='dropDownBox' style='"+outMenuBoxStyle+"'><div style="+inMenuBoxStyle+">";
            for(var i in parseInterfaces){
                if(i==parseInterfaces.length-1){
                    html += "<span class='spanStyle' style='"+MenuItemsStyle+"' url='"+parseInterfaces[i]+"'>线路接口"+(parseInt(i)+1)+"</span>";
                }else{
                    html += "<span class='spanStyle' style='"+MenuItemsStyle+"border-bottom-style:solid;' url='"+parseInterfaces[i]+"'>线路接口"+(parseInt(i)+1)+"</span>";
                }
            }
            html += "</div></div>";
            div.innerHTML = html;
            document.body.insertBefore(div,document.body.firstChild);
            div.onclick = function() {
                var dropDownBox = document.getElementById("dropDownBox").style.height;
                var mainButton = document.getElementById("mainButton");
                var triangle = document.getElementById("triangle");
                if(dropDownBox == "0px"){
                    mainButton.style.borderRadius = (iconFilletPercent*iconWidth)+"px "+(iconFilletPercent*iconWidth)+"px 0 0";
                    triangle.removeAttribute("style");
                    triangle.setAttribute("style",squareStyle);
                    document.getElementById("dropDownBox").style.height = developMenuHeight+"px";
                }else{
                    document.getElementById("dropDownBox").style.height = "0px";
                    triangle.removeAttribute("style");
                    triangle.setAttribute("style",triangleStyle);
                    mainButton.style.borderRadius = (iconFilletPercent*iconWidth)+"px";
                }
            }
            var elements = document.getElementsByClassName("spanStyle");
            for(var j in elements){
                elements[j].onmouseover = function(){
                    this.style.background = secondColor;
                    this.style.color = mianColor;
                }
                elements[j].onmouseout = function(){
                    this.style.background = mianColor;
                    this.style.color = secondColor;
                }
                elements[j].onclick=function(){
                    var parseInterface = this.getAttribute("url");
                    for(let key in classAndIDMap[uaLogo]){
                        if (document.location.href.match(key)) {
                            var values = classAndIDMap[uaLogo][key].split("|");
                            var labelType = "";
                            var class_id = "";
                            for(let value in values){
                                if(document.getElementById(values[value])){
                                    class_id = values[value];
                                    labelType = "id";
                                    break;
                                }
                                if(document.getElementsByClassName(values[value]).length>0){
                                    class_id = values[value];
                                    labelType = "class";
                                    break;
                                }
                            }
                            if(labelType!=""&&class_id!=""){
                                var iframe = "<iframe id='iframePlayBox' src='"+parseInterface+document.location.href+"' "+IframeStyle+" ></iframe>";
                                if(labelType=="id"){
                                    document.getElementById(class_id).innerHTML="";
                                    document.getElementById(class_id).innerHTML=iframe;
                                }else{
                                    document.getElementsByClassName(class_id)[0].innerHTML="";
                                    if(uaLogo=="mobile"){
                                        document.getElementsByClassName(class_id)[0].style.height="225px";
                                    }
                                    document.getElementsByClassName(class_id)[0].innerHTML=iframe;
                                }
                                return;
                            }
                        }
                    }
                    document.getElementById("dropDownBox").style.display = "none";
                }
            }
        }catch(error){
            // exception handling
        }
    }
})();
