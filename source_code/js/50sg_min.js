var debug=true;var mod=[];var I_P="http://static.sg.9wee.com/";var active=true;var G=new Cache("global");var recource=new Cache("recource");var buildAttribute={};var businessmen_num=0;var free_businessmen_num=0;var union_name=null;var general_name=null;var transaction_proportion={min:1,max:1};var general_append=0;var res_name={1:"木材",2:"泥土",3:"铁矿",4:"粮食"};var tip_msg={army_cz:0,army_zy:0,army_bjg:0,army_bzy:0,army_hc:0,army_zb:0,army_ky:0,army_msg:0,user_msg:0,sys_msg:0};var client_version=1.03;var server_time_base=new Date();function clsCounter(A){this.clsName=A;this.expireTime=0;this.interval=null;this.callback=null;this.delay=1000;this.finishText=null;this.textDay="%02s ";this.textHour="%02s:";this.textMinute="%02s:";this.textSecond="%02s";this.textNoDetail={1:" 1 分钟内 ",2:" 1 小时内 ",3:" 1 天内 "};this.showDetailDays=0;this.showLevel=0;this.init=function(C,D,E){if(D<=0){if($(C)){$(C).innerHTML='<font  title="？: 后台程序未开启，或者正在忙" onclick="alert(\'后台程序未开启，或者正在忙\')" >00:00:0<a href="javascript:;" ><b><span style="color:#FFFF00;text-decoration: underline;padding-left:1px;">?</span></b></a></font>'}return }this.callback=E;if(this.interval==null){D=Math.round(D);var B=new Date();this.expireTime=B.getTime()+D*1000;this.update(C)}};this.update=function(E){if(obj=$(E)){var D=new Date();var H=Math.round((this.expireTime-D.getTime())/1000);if(H<0){this.clear();if(this.callback){this.callback()}if(this.finishText){obj.innerHTML=this.finishText}return }H=Math.max(1,H);hours=Math.floor(H/3600);H-=hours*3600;minutes=Math.floor(H/60);H-=minutes*60;seconds=H;if(hours<100){this.textHour="%02s:"}else{if(hours<1000){this.textHour="%03s:"}else{this.textHour="%04s:"}}var I=this.showLevel>2?"":this.sprintf(this.textHour,hours);var F=this.showLevel>1?"":this.sprintf(this.textMinute,minutes);var C=this.showLevel>0?"":this.sprintf(this.textSecond,seconds);var B=I+F+C;if(B==""&&this.showLevel>0){B=this.textNoDetail[this.showLevel]}if($(E)){obj.innerHTML=B}else{alert("sadf");return false}}this.interval=setTimeout(this.clsName+".update('"+E+"')",this.delay)};this.sprintf=function(H,E){var C=/%([0-9]{1,2})s/g;var D=H.match(C);E=parseInt(E);if(isNaN(E)){E=0}if(D!=null){var B=" ";D=D.toString().replace(C,"$1");if(D.length>1){B=D.substr(0,1);D=D.substr(1,1)}var F=E.toString().length;for(i=F;i<parseInt(D);i++){E=B+E}E=H.replace(C,E);return E}else{if(E>0){E=E.toString()+H;return E}else{return""}}};this.clear=function(){if(this.interval!=null){clearTimeout(this.interval);this.interval=null}}};var Resource=Class.create();Resource.prototype={link:[],cities:[],currentCity:null,initialize:function(A,B){this.porperty="6_3_5_4";this.currentCity=A;this.cityresourceBase=[];this.cityProductivity=[];this.baseTime=[];this.setResourceBase(B)},setBaseTime:function(A){this.baseTime=A;this.baseTime.push(this.baseTime[1]-this.baseTime[0])},setResourceBase:function(A){this.baseTime=A.pop();this.baseTime.push(this.baseTime[1]-this.baseTime[0]);for(var B=0;B<A.length;B++){this.cityresourceBase[B]=A[B][0];this.cityProductivity[B]=A[B][1]}},calculateHasResource:function(){this.baseTime[1]++;this.baseTime[2]++;var D=this.baseTime[2];var C=this.cityresourceBase;var A=0;var E=new Array();for(var B=0;B<C.length;B++){A=intVal(intVal(C[B])+this.cityProductivity[B]/3600*D);if(A>intVal(depot_row[B])){A=intVal(depot_row[B])}A=A>=0?A:0;$("r"+B).update(A);if (0 == A){$('r'+B).addClassName('TS');$('r'+B).addClassName('red');$('r'+B).writeAttribute("msg", "当您的粮食城池生产力<0且粮食囤积量为0时，城池中驻扎的军队开始饿死！");if (!('_prototypeEventID' in $('r' + B))){mask.tagTS($('r' + B))};}else{$('r'+B).removeClassName('TS');$('r'+B).removeClassName('red');$('r'+B).writeAttribute("msg", "");mask.deEvent($('r' + B));}E[B]=A}G.updateCache("has_resource_row",E);D=C=A=E=B=null}};var map_id=readCookie("current_map_id");var belong_country=readCookie("belong_country");var CityRes="";function init(){}document.observe("dom:loaded",contentLoad);function contentLoad(){try{if(isie&&(request("tmp_c") || readCookie("tmp_c"))){var d_height=document.viewport.getHeight();var d_width=document.viewport.getWidth();$("body_c").setStyle({height:d_height+"px",width:"100%",overflowY:"scroll",overflowX:"hidden"});var bod=document.getElementsByTagName("body")[0];bod.style.overflow="hidden";var htm=document.getElementsByTagName("html")[0];htm.style.overflow="hidden";document.oncontextmenu=function(){return false};checkClientUpdate()}}catch(e){}$("city").addClassName("panel");["top","city","city_resource_building","city_internal_affairs","city_manage","paiming","rank_npc","city_trade","military","military_war", "military_general_general", "military_army","military_soldiers", "military_science","team","map","union","union_lianmeng","union_judianall","rank","rank_top","msg","msg_user","msg_military","user_relation","shop","shop_top","shop_daoju"].each(function(i){eval("window."+i+'_navi = new  Tabs("'+i+'_navi");')});CityRes=new Resource(map_id,user_base);updateResource();updateBuilding();city_resource_building_navi.jump("city|city_resource_building|city_build_resource");queueInit();queueRefresh();resource_add.sendRequest();city_relationship.sendRequest();get_money.sendRequest();check_task.sendRequest();new PeriodicalExecuter(queueInit,45);new PeriodicalExecuter(queueRefresh,580);new PeriodicalExecuter(setSysTime,1);Event.observe("city_select","click",function(){Effect.toggle("city_relationship","Slide",{duration:0.2})});try{if(window.location.host.include("50sg.com")){Event.observe($("game_exit"),"click",gameExit,false);$("game_exit").onclick=function(){return false}}}catch(e){console.info("game_exit异常")}}var updateResourceH=false;function updateResource(){if(!updateResourceH){updateResourceH=new PeriodicalExecuter(CityRes.calculateHasResource.bind(CityRes),1)}}function correctPNG(D){D=D?$(D):document;var B=D.getElementsByTagName("IMG").length;for(var E=0;E<B;E++){try{var F=D.getElementsByTagName("IMG")[E];var K=F.src.toUpperCase();if(K.substring(K.length-3,K.length)=="PNG"){var H=(F.id)?"id='"+F.id+"' ":"";var L=(F.className)?"class='"+F.className+"' ":"";var C=(F.title)?"title='"+F.title+"' ":"title='"+F.alt+"' ";var J="display:inline-block;"+F.style.cssText;if(F.align=="left"){J="float:left;"+J}if(F.align=="right"){J="float:right;"+J}if(F.parentElement.href){J="cursor:hand;"+J}var A="<span "+H+L+C+' style="width:'+F.width+"px; height:"+F.height+"px;"+J+";filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+F.src+"', sizingMethod='scale');\"></span>";F.outerHTML=A;E=E-1}}catch(I){}}return false}var logic={ajaxId:"sj",act:"upgrade_building",type:"o"};var ctl=[];var sj=new DAjax("/modules/gateway.php",{option:{formName:"sj_building_form",method:"get"},logic:logic});sj.onComplete=function(){mask.remove();get_city_building.sendRequest();set_city_resource.sendRequest();if("city_build_resource"==currentTabId||"city_build_building"==currentTabId||"city_out"==currentTabId||"city_in"==currentTabId){eval(currentTabId+".sendRequest();")}if("undefined"!=typeof (this.responseData.func)){eval(this.responseData.func+"();")}else{var i=mask.showMsgBox(this.rMsg,true);setTimeout("mask.removeById("+i+")",1000)}if("undefined"!=typeof (this.responseData.build_id)){if(this.responseData.level>=16){get_money.sendRequest()}}window.scrollTo(0,0)};sj.onNoneGet=function(){mask.showMsgBox(this.errorMessage,true)};function errMessage(A){mask.processInfo('<div class="kj_c_a"><ul><li class="kj_c_b"><font color=#FF0000>'+A+'</font></li><li class="kj_c_c"><img src="'+I_P+'/newsg/n_gb.gif" onclick="mask.remove(); return false;"/></li></ul></div>')}function trueMessage(A){mask.processInfo('<div class="kj_c_a"><ul><li class="kj_c_b">'+A+'</li><li class="kj_c_c"><img src="'+I_P+'/main/jz_b_6.gif" onclick="mask.remove(); return false;"/></li></ul></div>')}function upgradeStart(A,B){B.remove();sj.queryData.pid=A;sj.sendRequest()}var logic={ajaxId:"jz",act:"build_building",type:"e"};var ctl=[];var jz=new DAjax("/modules/build/build_building.php",{option:{method:"get"},logic:logic});jz.onComplete=function(){get_city_building.sendRequest();set_city_resource.sendRequest();if("city_build_resource"==currentTabId||"city_build_building"==currentTabId||"city_out"==currentTabId||"city_in"==currentTabId){eval(currentTabId+".sendRequest();")}if("undefined"!=typeof (this.responseData.func)){eval(this.responseData.func+"();")}else{var i=mask.processInfo(this.responseData,"o");setTimeout("mask.removeById("+i+")",1000)}window.scrollTo(0,0)};jz.onNoneGet=function(){mask.showMsgBox(this.errorMessage,true)};function buildStart(B,A,C){C.remove();jz.queryData.bid=B;jz.queryData.pid=A;jz.sendRequest()}var qxjz=new DAjax("/modules/gateway.php",{option:{method:"get"},logic:{ajaxId:"qxjz",act:"stop_build",type:"o"}});qxjz.onComplete=function(){mask.showMsgBox(this.rMsg,true);get_city_building.sendRequest();set_city_resource.sendRequest()};qxjz.onNoneGet=function(){mask.showMsgBox(this.errorMessage,true)};function stopBuild(A){if(confirm("只会返还建造花费的一部分资源, 确认取消任务?")){qxjz.queryData.task_content=A;qxjz.sendRequest()}return false}var logic={ajaxId:"cc",act:"demolish_building",type:"o"};var cc=new DAjax("/modules/gateway.php",{option:{method:"get"},logic:logic});cc.onComplete=function(){mask.remove();var A=mask.showMsgBox(this.rMsg,true);setTimeout("mask.removeById("+A+")",1000);get_city_building.sendRequest();set_city_resource.sendRequest()};cc.onNoneGet=function(){mask.showMsgBox(this.errorMessage, true)};function demolishStart(A){cc.queryData.pid=A;cc.sendRequest()}var zy=new DAjax("/modules/build/build.php?id=32",{logic:{ajaxId:"out_source",type:"e"}});var set_city_resource=new DAjax("/modules/gateway.php",{option:{method:"get",messageState:false,method:"get"},logic:{act:"set_city_resource"}});set_city_resource.onComplete=function(){depot_row=this.responseData.depot_row;general_append=this.responseData.general_append;for(var A=0;A<depot_row.length;A++){$("d"+A).update(intVal(depot_row[A]))}consumption_row=this.responseData.consumption_row;$("cl0").update(intVal(consumption_row[0]));$("cl1").update(intVal(consumption_row[1]));$("cl2").update(intVal(consumption_row[0])-intVal(consumption_row[2]));CityRes.setResourceBase(this.responseData.user_base);for(A=0;A<4;A++){$("productivity"+A).innerHTML=CityRes.cityProductivity[A];if (3 == A){if (CityRes.cityProductivity[A] < 0){$('productivity' + A).addClassName('TS');$('productivity' + A).addClassName('red');$('productivity' + A).writeAttribute("msg", "当您的粮食城池生产力<0且粮食囤积量为0时，城池中驻扎的军队开始饿死！");if (!('_prototypeEventID' in $('productivity' + A))){mask.tagTS($('productivity' + A));}}else{$('productivity' + A).removeClassName('TS');$('productivity' + A).removeClassName('red');$('productivity' + A).writeAttribute("msg", "");mask.deEvent($('productivity' + A));}}if(general_append>0){$("general_append"+A).src=I_P+"/newsg/g_cf_2_2.gif";$("general_append"+A).writeAttribute("msg","将领生产力加成:<span style='font-weight:bold;color:#00ff00;'>"+general_append+"%</span>")}else{$("general_append"+A).src=I_P+"/general/g_cf_1_1.gif";$("general_append"+A).writeAttribute("msg","将领阵亡, 无生产力加成")}}Element.show("productivity_c")};set_city_resource.onNoneGet=function(){};var city_profile=new DAjax("/modules/gateway.php",{option:{method:"get"},logic:{ajaxId:"city_profile",act:"city_profile",type:"e"}});city_profile.onComplete=function(){};var city_out=new DAjax("/modules/gateway.php",{option:{method:"get"},logic:{ajaxId:"city_out",act:"city_out",type:"e"}});city_out.onComplete=function(){if(Prototype.Browser.IE&&!Prototype.Browser.IE7){try{correctPNG($("out_index"))}catch(A){}}};city_out.onNoneGet=function(){alert(this.errorMessage)};var city_in=new DAjax("/modules/gateway.php",{option:{method:"get"},logic:{ajaxId:"city_in",act:"city_in",type:"e"}});city_in.onComplete=function(){if(Prototype.Browser.IE&&!Prototype.Browser.IE7){try{correctPNG($("in_index"))}catch(A){}}};city_in.onNoneGet=function(){alert(this.errorMessage)};var city_trade_state=new DAjax("/modules/gateway.php?module=trade",{option:{method:"get"},logic:{ajaxId:"city_trade_state",act:"city_trade_state",type:"e"}});city_trade_state.onComplete=function(){};var city_trade_reassign=new DAjax("/modules/gateway.php?module=trade",{option:{method:"get"},logic:{ajaxId:"city_trade_reassign",act:"city_trade_reassign",type:"e"}});city_trade_reassign.onComplete=function(){};var city_trade_transit=new DAjax("/modules/gateway.php?module=trade",{option:{method:"get"},logic:{ajaxId:"city_trade_transit",act:"city_trade_transit",type:"e"}});city_trade_transit.onComplete=function(){};var city_trade_buy=new DAjax("/modules/gateway.php?module=trade",{option:{method:"get"},logic:{ajaxId:"city_trade_buy",act:"city_trade_buy",type:"e"}});city_trade_buy.onComplete=function(){if(Prototype.Browser.IE){if(1<=mask.box.id){var A=null;A=$("city_trade_buy").getElementsByTagName("select");for(i=0;i<A.length;i++){A[i].style.visibility="hidden"}A=null}}};var city_trade_sell=new DAjax("/modules/gateway.php?module=trade",{option:{method:"get"},logic:{ajaxId:"city_trade_sell",act:"city_trade_sell",type:"e"}});city_trade_reassign.onComplete=function(){};var city_relationship=new DAjax("/modules/gateway.php",{option:{method:"get"},logic:{ajaxId:"city_relationship",act:"city_relationship",type:"e"}});var city_build_building=new DAjax("/modules/gateway.php",{option:{method:"get"},logic:{ajaxId:"city_build_building",act:"city_build_building",type:"e"}});var city_build_resource=new DAjax("/modules/gateway.php",{logic:{ajaxId:"city_build_resource",act:"city_build_resource",type:"e"}});city_build_resource.onComplete=function(){};city_build_resource.onAfterGet=function(){};var military_war_move_army=new DAjax("/modules/military/military_war_move_army.php",{logic:{ajaxId:"military_war_move_army",act:"military_war_move_army",type:"e"}});military_war_move_army.onComplete=function(){};var military_war_action=new DAjax("/modules/military/military_war_action.php",{logic:{ajaxId:"military_war_action",act:"military_war_action",type:"e"}});military_war_action.onComplete=function(){};var military_war_news=new DAjax("/modules/military/military_war_news.php",{logic:{ajaxId:"military_war_news",act:"military_war_news",type:"e"}});military_war_news.onComplete=function(){get_military_train.sendRequest()};var military_war_insurance=new DAjax("/modules/military/military_war_insurance.php",{logic:{ajaxId:"military_war_insurance",act:"military_war_insurance",type:"e"}});military_war_insurance.onComplete=function(){};var military_war_new_build=new DAjax("/modules/military/military_war_new_build.php",{logic:{ajaxId:"military_war_new_build",act:"military_war_new_build",type:"e"}});var military_general=new DAjax("/modules/military/military_general.php",{logic:{ajaxId:"military_general",act:"military_general",type:"e"}});military_general.onComplete=function(){};var military_city_army=new DAjax("/modules/military/military_city_army.php",{logic:{ajaxId:"military_city_army",act:"military_city_army",type:"e"}});var military_add_army=new DAjax("/modules/military/military_add_army.php",{logic:{ajaxId:"military_add_army",act:"military_add_army",type:"e"}});var military_captive_army=new DAjax("/modules/military/military_captive_army.php",{logic:{ajaxId:"military_captive_army",act:"military_captive_army",type:"e"}});var shop_res=new DAjax("/modules/military/shop_res.php",{logic:{ajaxId:"shop_res",act:"shop_res",type:"e"}});var shop_suit=new DAjax("/modules/military/shop_suit.php",{logic:{ajaxId:"shop_suit",act:"shop_suit",type:"e"}});var shop_time=new DAjax("/modules/military/shop_time.php",{logic:{ajaxId:"shop_time",act:"shop_time",type:"e"}});var shop_box=new DAjax("/modules/military/shop_box.php",{logic:{ajaxId:"shop_box",act:"shop_box",type:"e"}});var shop_general=new DAjax("/modules/military/shop_general.php",{logic:{ajaxId:"shop_general",act:"shop_general",type:"e"}});function moe(B){var D=readCookie("belong_country");var C="";switch(D){case"1":C="in_w_";break;case"2":C="in_s_";break;case"3":C="in_wu_";break;default:}var A=B.getAttribute("bid");if($(C+A).hasClassName("alp0")){$(C+A).addClassName("alp6")}else{$(C+A).addClassName("no_alp")}A=D=C=null}function mot(B){var D=readCookie("belong_country");var C="";switch(D){case"1":C="in_w_";break;case"2":C="in_s_";break;case"3":C="in_wu_";break;default:}var A=B.getAttribute("bid");if($(C+A).hasClassName("alp6")){$(C+A).removeClassName("alp6")}else{$(C+A).removeClassName("no_alp")}A=D=C=null}function areaFocus(){var C=document.getElementsByTagName("area");var B;for(var A=0;B=C[A];A++){B.onfocus=function(){this.blur()}}C=B=null}function switchCity(C,A){if($("lightbox_help")){$("lightbox_help").remove()}var B=mask.showMsgBox("<br />巡视城池 "+C+" ...");return true}function showHelp(A){if($("lightbox_help")){}else{mask.addHelpWindow();showHelpWindow()}$("lightbox_help").style.display="block";$("help_url").src=A;return false}function showHelpWindow(){var B=707;var D=525;var E=$("lightbox_help");var A=$("lbContainer_help");var C=$("contents_help");F();E.removeClassName("loading");E.addClassName("done");function F(){var H=getPageSize();var J=((arrayPageSize[3]-35-D)/2);var I=((arrayPageSize[0]-20-B)/2);if(Prototype.Browser.IE&&!Prototype.Browser.IE7){Position.prepare();J+=Position.deltaY}A.style.width=B+"px";A.style.height=D+"px";E.style.width=B+"px";E.style.height=D+"px";E.style.top=(J<0)?"0px":J+"px";E.style.left=(I<0)?"0px":I+"px";E.style.margin="0px"}}var resource_add=new DAjax("/modules/gateway.php",{option:{messageState:false,method:"get"},logic:{act:"resource_add"}});
//保险卡
var warInsuranceClass = {
	relive:function()
	{
		warInsuranceAction.queryData['request'] = 'relive';
		warInsuranceAction.sendRequest();
	}
}
warInsuranceAction = new DAjax("/modules/military/military_war_insurance.php",{option:{method:"post"},logic:{action:"d",type:"e"}});
warInsuranceAction.onComplete = function()
{
	if(this.responseData)
	{
		//mask.processInfo(this.responseData)
		mask.showMsgBox(this.responseData, true);
		set_city_resource.sendRequest();
		military_war_navi.jump('military|military_war|military_war_insurance');
	}
	else
	{
		mask.remove();//alert(this.responseData);
		military_war_navi.jump('military|military_war|military_war_insurance');
	}
}
//VIP兑换
var vipClass = {
	exchange:function()
	{
		var vip_type = 0;
		if($('vip_type_1').checked)
		{
			vip_type = $('vip_type_1').value;
		}
		else if($('vip_type_2').checked)
		{
			vip_type = $('vip_type_2').value;
		}
		if(vip_type == 0)
		{
			alert('请选择vip类型！');
		}
		else
		{
			vipAction.queryData['request'] = 'exchange';
			vipAction.queryData['vip_type'] = vip_type;
			vipAction.sendRequest();
		}
	}
}
vipAction = new DAjax("/modules/vip.php",{option:{method:"post"},logic:{action:"d",type:"e"}});
vipAction.onComplete = function()
{
	if(this.responseData)
	{
		mask.remove();
		mask.showMsgBox(this.responseData, true);
		resource_add.sendRequest();
		set_city_resource.sendRequest();
		eval(currentTabId + '.sendRequest();');
	}
	else
	{
		mask.remove();//alert(this.responseData);
		//military_war_navi.jump('military|military_war|military_war_insurance');
	}
}
resource_add.onComplete=function()
{
	var A=$H(this.responseData);
	A.each(function(C){
		mask.deEvent($("res_add_"+C.key));
		var D="";
		var B=null;
		if(41==C.key)
		{
			if(C.value.has)
			{
				D=" <span class='green' >激活等待建筑队列, 截止时间:"+C.value.time;
				B="add_1.gif"
			}
			else
			{
				D="还未激活等待建筑队列, 点击激活";
				B="add_0.gif"
			}
			$("res_add_"+C.key).update('&nbsp;<a href="#" title="' + D + '" class="TS" onclick="item_res_action('+C.key+",'"+C.value.key+"');return false;\">增加队列</a>");
		}
		else
		{
			if(C.value.has)
			    {D=res_name[C.key]+" <span class='green' >40%</span> 金币加成中, 拥有到达时间："+C.value.time;B="add_1.gif"}
			else
			{
				D="还未激活 "+res_name[C.key]+" <span class='green' >40%</span> 金币加成, 点击激活";
				B="add_0.gif"
			}
			if (C.value.green_server)
			{
				res_fun = '';
			}
			else
			{
				res_fun = 'onclick="item_res_action('+C.key+',\''+C.value.key+'\');return false;"';
			}
			$("res_add_"+C.key).update('&nbsp;<img src="'+I_P+"/newsg/"+B+'"  align="absmiddle" border="0"  title="'+D+'" class="TS" ' + res_fun + '>');
		}
		
		mask.actions($("res_add_"+C.key))
	});
	A=null
};


resource_add.onNoneGet=function(){};var logic={ajaxId:"updateUserLoginTime",act:"updateUserLoginTime",type:"o",cla:"Build_City",operateType:"class",cache:0};var update_user_login_time=new DAjax("/modules/gateway.php",{option:{messageState:false},logic:logic});update_user_login_time.onComplete=function(){};var activity_logic={ajaxId:"activity_c",act:"activity",type:"e",cache:0};var activity_load=new DAjax("/modules/gateway.php",{option:{messageState:false},logic:activity_logic});activity_load.onComplete=function(){};function loadActivity(){activity_load.sendRequest()}function setMsg(B){try{if(isie&&(request("tmp_c") || readCookie("tmp_c"))){oPopup.document.getElementById("pop_msg_c").innerHTML=B;showPop()}}catch(A){}}function gameExit(){try{if(isie&&(request("tmp_c") || readCookie("tmp_c"))){if(confirm("确认退出游戏?")){document.getElementById("ButtonCancel").click()}}else{window.location.href="login.php?logout"}}catch(A){}}function showCard(){list_cards.sendRequest()}var list_cards=new DAjax("/modules/gateway.php?module=card",{option:{method:"get"},logic:{ajaxId:"list_cards",act:"list_cards",type:"e"}});list_cards.onComplete=function(){};list_cards.onNoneGet=function(){mask.showMsgBox(this.errorMessage,true)};var bind_cards=new DAjax("/modules/gateway.php?module=card",{option:{method:"post"},logic:{ajaxId:"bind_cards",act:"bind_cards",type:"o"}});bind_cards.onComplete=function(){mask.showMsgBox("绑定成功",true);showCard()};bind_cards.onNoneGet=function(){mask.showMsgBox(this.errorMessage,true)};function bindCard(){bind_cards.queryData.card_no=$F("card_no");bind_cards.sendRequest()}var use_cards=new DAjax("/modules/gateway.php?module=card",{option:{method:"get"},logic:{ajaxId:"use_cards",act:"use_cards",type:"e"}});use_cards.onComplete=function(){mask.processInfo(this.responseData);showCard()};use_cards.onNoneGet=function(){mask.showMsgBox(this.responseData,true)};function useCard(A){use_cards.queryData.card_no=A;use_cards.sendRequest()}function killspace(A){while(A.charAt(0)==" "){A=A.substr(1,A.length)}while(A.charAt(A.length-1)==" "){A=A.substr(0,A.length-1)}return A}var military_action_check_action=new DAjax("/modules/military/military_war_action_event.php",{logic:{act:"military_action_check_action",type:"e"}});military_action_check_action.onComplete=function(){mask.processInfo(this.responseData)};function military_action_show(A,B){if(A==1||A==2||A==3||A==4){military_action_check_action.queryData.action_type=A;military_action_check_action.queryData.action_content=B;military_action_check_action.queryData.action="show_action";military_action_check_action.sendRequest()}if(A==6){military_action_check_action.queryData.action_type=A;military_action_check_action.queryData.action_content=B;military_action_check_action.queryData.action="new_build_show";military_action_check_action.sendRequest()}if(A==10){military_action_check_action.queryData.action_type=A;military_action_check_action.queryData.action_content='';military_action_check_action.queryData.action="fortress_action";military_action_check_action.sendRequest()}if(A==11){military_action_check_action.queryData.action_type=A;military_action_check_action.queryData.action_content='';military_action_check_action.queryData.action="team_action";military_action_check_action.sendRequest()}}var start_soldiers_check=new DAjax("/modules/military/military_war_action_event.php",{option:{formName:"nameFrom",messageState:false,message:""},logic:{act:"start_soldiers_check",type:"e"}});start_soldiers_check.onComplete=function(){mask.processInfo(this.responseData)};function check_soldier(B){var A=document.getElementById("general_show");if((B=="attack"||B=="rob"||B=="all")&&A){A.style.display="inline"}else{if(A){A.style.display="none"}}var E=killspace(document.getElementById("s_h_army_id").value);ia=E.split(".");for(i=0;i<ia.length;i++){sn=ia[i].split(":");var D=document.getElementById("s"+sn[0]);if(B=="attack"){if(104!=sn[0]&&115!=sn[0]&&125!=sn[0]){var C=document.getElementById("a"+sn[0]);C.style.display="inline";D.disabled=false}else{D.value="";var C=document.getElementById("a"+sn[0]);C.style.display="none";D.disabled=true}}if(B=="rob"){if(104!=sn[0]&&115!=sn[0]&&125!=sn[0]){var C=document.getElementById("a"+sn[0]);C.style.display="inline";D.disabled=false}else{D.value="";var C=document.getElementById("a"+sn[0]);C.style.display="none";D.disabled=true}}if(B=="all"){var C=document.getElementById("a"+sn[0]);C.style.display="inline";D.disabled=false}if(B=="spy"){if(104==sn[0]||115==sn[0]||125==sn[0]){var C=document.getElementById("a"+sn[0]);C.style.display="inline";D.disabled=false}else{D.value="";var C=document.getElementById("a"+sn[0]);C.style.display="none";D.disabled=true}}}}function check_form(){var A=killspace(document.nameFrom.aim_value.value.replace(/(^s*)|(s*$)/g,""));var L=killspace(document.nameFrom.x_value.value.replace(/(^s*)|(s*$)/g,""));var F=killspace(document.nameFrom.y_value.value.replace(/(^s*)|(s*$)/g,""));var K=document.getElementById("army_type1");var H=document.getElementById("army_type2");var D=document.getElementById("army_type3");var C=document.getElementById("army_type4");if(!K.checked&&!H.checked&&!D.checked&&!C.checked){errMessage("请选择你要出征的类型");return false}if(A==""){if(L==""||F==""){errMessage("请输入坐标或者城池目的地名称");return false}}else{if((L!=""&&F=="")||(L==""&&F!="")){errMessage("请输入坐标或者城池目的地名称");return false}}var B=killspace(document.getElementById("s_h_army_id").value);ia=B.split(".");var E=/^[0-9]{0,}$/;var N=1;for(i=0;i<ia.length;i++){sn=ia[i].split(":");var J=document.getElementById("s"+sn[0]).value;if(J!=""&&J!=0){N=0;if(!E.test(J)){errMessage("每种兵的出征数必须为非负整数");document.getElementById("s"+sn[0]).value=sn[1];return false}if(Number(J)<0||Number(J)>Number(sn[1])){errMessage("出征数必须小于当前城池拥有的数");document.getElementById("s"+sn[0]).value=sn[1];return false}}}if(!C.checked){var I=document.getElementById("general_1");if(I){if(I.checked){N=0}}}if(N==1){errMessage("请输入您要出征的军队");return false}start_soldiers_check.queryData.action="check_action";start_soldiers_check.sendRequest()}var start_army=new DAjax("/modules/military/military_war_action_event.php",{option:{formName:"nameFrom",messageState:false,message:""},logic:{act:"start_army",type:"e"}});start_army.onComplete=function(){if(this.responseData==1||!this.responseData){mask.remove();military_war_navi.jump("military|military_war|military_war_news");get_military_train.sendRequest();get_city_army.sendRequest();set_city_resource.sendRequest();get_money.sendRequest()}else{mask.processInfo(this.responseData)}};function sendFormStartArmyDataSpeed(){var A=document.getElementById("pay_style_1");if(A.checked){var B=A.value}else{var B=document.getElementById("pay_style_2").value}start_army.queryData.ptyle=B;start_army.queryData.addspeed="1";start_army.queryData.action="insert";start_army.sendRequest();mask.remove()}function sendFormStartArmyData(){start_army.queryData.addspeed="0";start_army.queryData.action="insert";start_army.sendRequest();mask.remove()}function sendFormStartArmyData1(){start_army.queryData.addspeed="2";start_army.queryData.action="insert";start_army.sendRequest();mask.remove()}var start_army_cancel=new DAjax("/modules/military/military_war_news.php",{logic:{act:"start_army_cancel",type:"e"}});start_army_cancel.onComplete=function(){if(this.responseData==1){military_war_news.sendRequest();set_city_resource.sendRequest();get_military_train.sendRequest();get_city_army.sendRequest()}else{errMessage("出发时间已过90秒")}};function confirmArmyCancel(A){start_army_cancel.queryData.pid=A;start_army_cancel.queryData.action="cancel";start_army_cancel.sendRequest()}var army_disband_soldiers=new DAjax("/modules/military/military_war_action.php",{logic:{act:"army_disband_soldiers",type:"e"}});army_disband_soldiers.onComplete=function(){military_war_action.sendRequest()};function disbandSoldiersSure(A,B){army_disband_soldiers.queryData.ut=B;army_disband_soldiers.queryData.mi=A;army_disband_soldiers.queryData.action="disband";army_disband_soldiers.sendRequest();mask.remove()}function disbandSoldiers(A,B){mask.processInfo('<div class="sg_jz_ac_box"><div class="sg_jz_ac_bg"><ul><li>确定要解散吗？</li><li><img src="http://static.sg.9wee.com/military/zz_qd.gif" onclick="disbandSoldiersSure('+A+","+B+')"/> <img src="http://static.sg.9wee.com/main/jz_b_6.gif"  onclick="mask.remove(); return false;"/></li></ul></div></div>')}var army_release_soldiers=new DAjax("/modules/military/military_war_action.php",{logic:{act:"army_release_soldiers",type:"e"}});army_release_soldiers.onComplete=function(){military_war_action.sendRequest()};function releaseSoldiersSure(A,B){army_release_soldiers.queryData.ut=B;army_release_soldiers.queryData.mi=A;army_release_soldiers.queryData.action="release";army_release_soldiers.sendRequest();mask.remove()}function releaseSoldiers(A,B){mask.processInfo('<div class="sg_jz_ac_box"><div class="sg_jz_ac_bg"><ul><li>确定要释放吗？</li><li><img src="http://static.sg.9wee.com/military/zz_qd.gif" onclick="releaseSoldiersSure('+A+","+B+')"/> <img src="http://static.sg.9wee.com/main/jz_b_6.gif"  onclick="mask.remove(); return false;"/></li></ul></div></div>')}var army_by_back_city=new DAjax("/modules/military/military_war_action.php",{logic:{act:"military_war_action",type:"e"}});army_by_back_city.onComplete=function(){mask.processInfo(this.responseData)};function confirmArmyBybackCity(A){army_by_back_city.queryData.mid=A;army_by_back_city.queryData.action="byback";army_by_back_city.sendRequest()}var army_bybackexe_city=new DAjax("/modules/military/military_war_action.php",{option:{formName:"nameByBackFrom",messageState:false,message:""},logic:{act:"army_bybackexe_city",type:"e"}});army_bybackexe_city.onComplete=function(){if(this.responseData==1||!this.responseData){mask.remove();military_war_navi.jump("military|military_war|military_war_news");get_city_army.sendRequest();set_city_resource.sendRequest()}else{mask.processInfo(this.responseData)}};var army_bybackexe_check=new DAjax("/modules/military/military_war_action.php",{option:{formName:"nameByBackFrom",messageState:false,message:""},logic:{act:"army_bybackexe_city",type:"e"}});army_bybackexe_check.onComplete=function(){mask.processInfo(this.responseData)};function bybackArmyData(){var E=killspace(document.getElementById("s_bb_army_id").value);var B=/^[0-9]{0,}$/;ia=E.split(".");var D=1;for(i=0;i<ia.length;i++){sn=ia[i].split(":");var C=document.getElementById("b"+sn[0]).value;if(C!=""&&C!=0){D=0;if(!B.test(C)){errMessage("每种兵的召回数必须为非负整数");return false}if(Number(C)<0||Number(C)>Number(sn[1])){errMessage("召回数必须小于当前拥有的数");return false}}}if(D==1){var A=document.getElementById("general_s1");if(A){if(A.checked){D=0}}}if(D==1){errMessage("请输入召回军队数");return false}army_bybackexe_check.queryData.action="bybacksure";army_bybackexe_check.sendRequest()}function bybackArmyDataNoSpeed(){army_bybackexe_city.queryData.addspeed="0";army_bybackexe_city.queryData.action="bybackexe";army_bybackexe_city.sendRequest();mask.remove()}function bybackArmyDataSpeed(){var A=document.getElementById("pay_style_1");if(A.checked){var B=A.value}else{var B=document.getElementById("pay_style_2").value}army_bybackexe_city.queryData.ptyle=B;army_bybackexe_city.queryData.addspeed="1";army_bybackexe_city.queryData.action="bybackexe";army_bybackexe_city.sendRequest();mask.remove()}var army_back_city=new DAjax("/modules/military/military_war_action.php",{logic:{act:"army_back_city",type:"e"}});army_back_city.onComplete=function(){mask.processInfo(this.responseData)};var army_backexe_city=new DAjax("/modules/military/military_war_action.php",{option:{formName:"nameBackFrom",messageState:false,message:""},logic:{act:"army_backexe_city",type:"e"}});army_backexe_city.onComplete=function(){military_war_action.sendRequest();get_city_army.sendRequest();set_city_resource.sendRequest()};function confirmArmybackCity(A){army_back_city.queryData.mid=A;army_back_city.queryData.action="back";army_back_city.sendRequest()}function backArmyData(){var E=killspace(document.getElementById("s_b_army_id").value);var B=/^[0-9]{0,}$/;ia=E.split(".");var D=1;for(i=0;i<ia.length;i++){sn=ia[i].split(":");var C=document.getElementById("b"+sn[0]).value;if(C!=""&&C!=0){D=0;if(!B.test(C)){errMessage("每种兵的回派数必须为非负整数");return false}if(Number(C)<0||Number(C)>Number(sn[1])){errMessage("回派数必须小于当前拥有的数");return false}}}if(D==1){var A=document.getElementById("general_s1");if(A){if(A.checked){D=0}}}if(D==1){errMessage("请输入回派军队数");return false}army_backexe_city.queryData.action="backexe";army_backexe_city.sendRequest();mask.remove()}var general_point_update=new DAjax("/modules/military/military_general.php",{logic:{act:"military_general",type:"e"}});general_point_update.onComplete=function(){military_general.sendRequest();get_city_building.sendRequest();set_city_resource.sendRequest();if("havetask"==this.responseData){showTask()}};var general_relive_update=new DAjax("/modules/military/military_general.php",{logic:{act:"military_general",type:"e"}});general_relive_update.onComplete=function(){mask.processInfo(this.responseData)};function gReliveUpdate(){general_relive_update.queryData.action="relive";general_relive_update.sendRequest()}var general_relive_exe_update=new DAjax("/modules/military/military_general.php",{logic:{act:"military_general",type:"e"}});general_relive_exe_update.onComplete=function(){military_general.sendRequest();set_city_resource.sendRequest()};function generalReliveExe(){general_relive_exe_update.queryData.action="reliveexe";general_relive_exe_update.sendRequest();mask.remove()}var general_official_promote1=new DAjax("/modules/military/military_general.php",{logic:{act:"military_general",type:"e"}});general_official_promote1.onComplete=function(){military_general.sendRequest();set_city_resource.sendRequest();if("havetask"==this.responseData){showTask()}};var general_official_promote2=new DAjax("/modules/military/military_general.php",{logic:{act:"military_general",type:"e"}});general_official_promote2.onComplete=function(){military_general.sendRequest();get_city_army.sendRequest();set_city_resource.sendRequest();if("havetask"==this.responseData){showTask()}};var general_official_rank=new DAjax("/modules/military/military_general.php",{logic:{act:"military_general",type:"e"}});general_official_rank.onComplete=function(){military_general.sendRequest();set_city_resource.sendRequest();if("havetask"==this.responseData){showTask()}};var general_official_add_value=new DAjax("/modules/military/military_general.php",{logic:{act:"military_general",type:"e"}});general_official_add_value.onComplete=function(){mask.processInfo(this.responseData)};function generalSurePromote(A){mask.remove();if(A==1){general_official_promote1.queryData.t=A;general_official_promote1.queryData.action="promote1";general_official_promote1.sendRequest()}if(A==2){general_official_promote2.queryData.t=A;general_official_promote2.queryData.action="promote2";general_official_promote2.sendRequest()}if(A==3){general_official_rank.queryData.t=A;general_official_rank.queryData.action="rank";general_official_rank.sendRequest()}}function generalOfficialPromote(A){general_official_add_value.queryData.t=A;general_official_add_value.queryData.action="add_value";general_official_add_value.sendRequest()}function generalPointImgWidth(B){var C;var A=B/100;if(A>=1){A=319}else{C=A*319;A=parseInt(C)}if(A==0){A=2}return A}function generalPointUpdate(A,B){general_point_update.queryData.action="update";general_point_update.queryData.k=A;general_point_update.queryData.p=B;general_point_update.sendRequest()}var msg_military_all=new DAjax("/modules/military/msg_military_all.php",{logic:{ajaxId:"msg_military_all",act:"msg_military_all",type:"e"}});msg_military_all.onComplete=function(){$("military_img").src="http://static.sg.9wee.com/newsg/url_jq1.gif"};var msg_military_attack=new DAjax("/modules/military/msg_military_attack.php",{logic:{ajaxId:"msg_military_attack",act:"msg_military_attack",type:"e"}});msg_military_attack.onComplete=function(){};var msg_military_help=new DAjax("/modules/military/msg_military_help.php",{logic:{ajaxId:"msg_military_help",act:"msg_military_help",type:"e"}});msg_military_help.onComplete=function(){};var msg_military_trade=new DAjax("/modules/military/msg_military_trade.php",{logic:{ajaxId:"msg_military_trade",act:"msg_military_trade",type:"e"}});msg_military_trade.onComplete=function(){};function military_msg_view(A,C,B){if(A=="msg_military_attack"){msg_military_attack.queryData.deldata=2;msg_military_attack.queryData.firstRow=C;msg_military_attack.queryData.totalRows=B;msg_military_attack.sendRequest()} if(A=="msg_military_die_sol1"){msg_military_die_sol1.queryData.deldata=2;msg_military_die_sol1.queryData.firstRow=C;msg_military_die_sol1.queryData.totalRows=B;msg_military_die_sol1.sendRequest()} if(A=="msg_military_all"){msg_military_all.queryData.deldata=2;msg_military_all.queryData.firstRow=C;msg_military_all.queryData.totalRows=B;msg_military_all.sendRequest()}if(A=="msg_military_help"){msg_military_help.queryData.deldata=2;msg_military_help.queryData.firstRow=C;msg_military_help.queryData.totalRows=B;msg_military_help.sendRequest()}if(A=="msg_military_trade"){msg_military_trade.queryData.deldata=2;msg_military_trade.queryData.firstRow=C;msg_military_trade.queryData.totalRows=B;msg_military_trade.sendRequest()}}var msg_military_all_attack=new DAjax("/modules/military/msg_military_all.php",{logic:{ajaxId:"msg_military_all",act:"msg_military_all",type:"e"}});msg_military_all_attack.onComplete=function(){};var msg_military_attack_view=new DAjax("/modules/military/msg_military_all.php",{logic:{ajaxId:"msg_military_attack",act:"msg_military_all",type:"e"}});msg_military_attack_view.onComplete=function(){};var msg_military_all_help=new DAjax("/modules/military/msg_military_all.php",{logic:{ajaxId:"msg_military_all",act:"msg_military_all",type:"e"}});msg_military_all_help.onComplete=function(){};var msg_military_help_view=new DAjax("/modules/military/msg_military_all.php",{logic:{ajaxId:"msg_military_help",act:"msg_military_all",type:"e"}});msg_military_help_view.onComplete=function(){};var msg_military_all_trade=new DAjax("/modules/military/msg_military_all.php",{logic:{ajaxId:"msg_military_all",act:"msg_military_all",type:"e"}});msg_military_all_trade.onComplete=function(){};var msg_military_trade_view=new DAjax("/modules/military/msg_military_all.php",{logic:{ajaxId:"msg_military_trade",act:"msg_military_all",type:"e"}});msg_military_trade_view.onComplete=function(){};function checkAllReport(){var A=document.getElementsByName("report_arr[]");for(var B=0;B<A.length;B++){if(!A[B].checked){A[B].checked=true}}}var del_report=new DAjax("/modules/military/msg_military_all.php",{logic:{ajaxId:"msg_military_all",act:"msg_military_all",type:"e"}});del_report.onComplete=function(){var A=this.responseData;if(A==1){msg_military_all.queryData.deldata=1;msg_military_all.sendRequest()}if(A==2){msg_military_attack.queryData.deldata=1;msg_military_attack.sendRequest()}if(A==4){msg_military_trade.queryData.deldata=1;msg_military_trade.sendRequest()}if(A==5){msg_military_help.queryData.deldata=1;msg_military_help.sendRequest()}};function checkDelReport(D){var A=document.getElementsByName("report_arr[]");var B=1;var E="";for(var C=0;C<A.length;C++){if(A[C].checked){if(E){E+=":"+A[C].value}else{E=A[C].value}B=2}}if(B==1&&!E){errMessage("请选择要删除的记录");return false}del_report.queryData.poststr=E;del_report.queryData.action_type=D;del_report.queryData.action="delete";del_report.sendRequest()}var map_military_move=new DAjax("/modules/military/military_war_map_army.php",{logic:{act:"military_war_map_army",type:"e"}});map_military_move.onComplete=function(){mask.processInfo(this.responseData)};function map_military_action(A,C){if(A==1||A==2||A==3||A==4){military_action_check_action.queryData.action_type=A;military_action_check_action.queryData.action_content=C;military_action_check_action.queryData.action="show_action";military_action_check_action.sendRequest()}if(A==6){var B=C.split("{;|;}");if(B[3]==1&&B[4]==0&&B[5]&&B[6]){start_new_build_show.queryData.action_type=A;start_new_build_show.queryData.action_content=C;start_new_build_show.queryData.action="new_build_show";start_new_build_show.sendRequest()}else{errMessage("本地点已有人占领，无法拓建新城");return false}}}var start_new_build_show=new DAjax("/modules/military/military_war_action_event.php",{logic:{act:"start_new_build_show",type:"e"}});start_new_build_show.onComplete=function(){mask.processInfo(this.responseData)};var start_new_build=new DAjax("/modules/military/military_war_action_event.php",{logic:{act:"start_new_build",type:"e"}});start_new_build.onComplete=function(){if(this.responseData=="3"){errMessage("本地点已有人占领，无法拓建新城")}if(this.responseData=="4"){errMessage("你暂时未达到拓建新城的条件，继续加油")}if(this.responseData=="5"){errMessage("各项资源达到3000以上才能拓建新场面，继续加油")}if(this.responseData=="1"){get_military_train.sendRequest();get_city_army.sendRequest();set_city_resource.sendRequest();military_war_navi.jump("military|military_war|military_war_news")}if(this.responseData!="3"&&this.responseData!="1"&&this.responseData!="4"&&this.responseData!="5"){mask.remove();mask.processInfo(this.responseData)}};function new_build_inset(A,B){start_new_build.queryData.x_value=A;start_new_build.queryData.y_value=B;start_new_build.queryData.action="new_build";start_new_build.sendRequest();get_city_army.sendRequest()}function new_build(){var A=document.getElementById("x_id").value;var B=document.getElementById("y_id").value;if(Number(A)<-400||Number(A)>400){errMessage("参数不对！");return false}mask.remove();start_new_build.queryData.x_value=A;start_new_build.queryData.y_value=B;start_new_build.queryData.action="new_build_check";start_new_build.sendRequest()}var item_res_act=new DAjax("/modules/military/shop_res.php",{logic:{act:"shop_res",type:"e"}});item_res_act.onComplete=function(){mask.remove();mask.processInfo(this.responseData)};var item_suit_act=new DAjax("/modules/military/shop_suit.php",{logic:{act:"shop_suit",type:"e"}});item_suit_act.onComplete=function(){mask.remove();mask.processInfo(this.responseData)};var item_time_act=new DAjax("/modules/military/shop_time.php",{logic:{act:"shop_time",type:"e"}});item_time_act.onComplete=function(){mask.processInfo(this.responseData)};var item_general_act=new DAjax("/modules/military/shop_general.php",{logic:{act:"shop_general",type:"e"}});item_general_act.onComplete=function(){mask.processInfo(this.responseData)};var item_box_act=new DAjax("/modules/military/shop_box.php",{logic:{act:"shop_box",type:"e"}});item_box_act.onComplete=function(){mask.processInfo(this.responseData)};var item_shop_act=new DAjax("/modules/military/shop.php",{logic:{act:"shopcom",type:"e"}});item_shop_act.onComplete=function(){mask.processInfo(this.responseData)};function general_name_action(B,A){item_general_act.queryData.action="name_update";item_general_act.sendRequest()}function item_select_action(queue_id){var B=document.getElementsByName("item_value");for(i=0;i<B.length;i++){if(B[i].checked){var A=B[i].value}}var C=document.getElementsByName("pay_style");for(i=0;i<C.length;i++){if(C[i].checked){var D=C[i].value}}if(A&&D){mask.remove();item_time_act.queryData.ptyle=D;item_time_act.queryData.sid=A;item_time_act.queryData.queue_id=queue_id;item_time_act.queryData.pid="";item_time_act.queryData.pkey="";item_time_act.queryData.action="insert";item_time_act.sendRequest()}}

var change_general_do=new DAjax("/modules/military/military_general.php",{logic:{act:"change_general",type:"e"}});change_general_do.onComplete=function(){mask.remove();mask.processInfo(this.responseData)};

function item_action(H,B)
{
    var choice;
    var inputnum=0;
    if(H==56 || H==58 || H==60)
    {
        inputnum=$('inputnum').value;
    }
    if(H>=52 && H<=55)
    {
        if($("choice_1").checked) 
	    choice=1;
	 else if($("choice_2").checked) 
	     choice=2;
	  else if($("choice_3").checked)
	      choice=3;
    }
    var E=document.getElementById("pay_style_1");
	var OP=document.getElementById("pay_style_5");
    if(E.checked)
	{
		var F=E.value;
	}
	else if ( OP && OP.checked )
	{
		var F=OP.value;
	}
    else
    {
	    var F=document.getElementById("pay_style_2").value
    }
	if (H==1 || H==2 || H==3 || H==4 || H==5 || H==6 || H==7 || H==8 || H==21 || H==22 || H==23 || H==41)
	{
		try
		{
			var I=document.getElementById("pay_style_4");
			if(I.checked){var F=I.value}			
		}
		catch (e)
		{
		}

	}
    if(H==40 || H==27)
    { 
		try
		{
			var FERR=document.getElementById("pay_style_3");
			var D=document.getElementById("general_name").value;
			if(FERR.checked)
			{
				var F=FERR.value
			}			
		}
		catch (e)
		{
		}

		
    }
    mask.remove();
    if((H>0&&H<11)||H==41||H==90||H==91||H==42||H==111 || H==56 || H==58 || H==60 || H==92)
    {
        item_res_act.queryData.inputnum=inputnum;
		item_res_act.queryData.ptyle=F;
		item_res_act.queryData.pkey=B;
		item_res_act.queryData.pid=H;
		item_res_act.queryData.action="insert";
		item_res_act.sendRequest()
    }
    if(H>13&&H<21)
    {
        item_time_act.queryData.ptyle=F;
		item_time_act.queryData.sid="";
		item_time_act.queryData.pkey=B;
		item_time_act.queryData.pid=H;
		item_time_act.queryData.action="insert";
		item_time_act.sendRequest()
    }
    if((H>20&&H<28)||H==34||H==35)
    {
        if(H==27)
	    {
			D=killspace(D);
			if(!D)
			{
				errMessage("请填写将领名称");
				return false
			}
			var C=D.match(/[^\x00-\xff]/ig);
			var A=D.length+(C==null?0:C.length);
			if(A>8||A<2)
			{
				errMessage("将领的姓名不能超过4个汉字或者8个字母");
			return false
			}
			item_general_act.queryData.gn=D
	    }
		item_general_act.queryData.ptyle=F;
		item_general_act.queryData.pkey=B;
		item_general_act.queryData.pid=H;
		item_general_act.queryData.action="insert";
		item_general_act.sendRequest()
    }
    if(H>49&&H<56 || H==57 || H==59 || (H>=61 && H<=70))
    {     
        item_box_act.queryData.choice=choice;
        item_box_act.queryData.ptyle=F;
		item_box_act.queryData.pkey=B;
		item_box_act.queryData.pid=H;
		item_box_act.queryData.action="insert";
		item_box_act.sendRequest()
    }
    if(H==40)
    {
        item_res_act.queryData.ptyle=F;
		item_res_act.queryData.pkey=B;
		item_res_act.queryData.pid=H;
		item_res_act.queryData.action="stop_war_insert";
		item_res_act.sendRequest()
    }
	if(H>=119 && H<=130)
    {
        item_suit_act.queryData.ptyle=F;
		item_suit_act.queryData.pkey=B;
		item_suit_act.queryData.pid=H;
		item_suit_act.queryData.action="insert";
		item_suit_act.sendRequest()
    }
	if(H==135)
    {
		try
		{
			var FERR = document.getElementById("pay_style_5");
			if(FERR.checked)
			{
				var F = FERR.value;
			}			
		}
		catch (e)
		{
		}
        item_res_act.queryData.ptyle=F;
		item_res_act.queryData.pkey=B;
		item_res_act.queryData.pid=H;
		item_res_act.queryData.action="war_insurance_insert";
		item_res_act.sendRequest()
    }
 }


function item_action1(H,B){var choice;if(H>=52 && H<=55) {if($("choice_1").checked) choice=1; else if($("choice_2").checked) choice=2; else if($("choice_3").checked) choice=3;} var E=document.getElementById("pay_style_1");if(E.checked){var F=E.value}else{var F=document.getElementById("pay_style_2").value}mask.remove();if((H>0&&H<11)||H==41||H==90||H==91||H==42||H==111){item_res_act.queryData.ptyle=F;item_res_act.queryData.pkey=B;item_res_act.queryData.pid=H;item_res_act.queryData.action="insert";item_res_act.sendRequest()}if(H>13&&H<21){item_time_act.queryData.ptyle=F;item_time_act.queryData.sid="";item_time_act.queryData.pkey=B;item_time_act.queryData.pid=H;item_time_act.queryData.action="insert";item_time_act.sendRequest()}if((H>20&&H<28)||H==34||H==35){if(H==27){var D=document.getElementById("general_name").value;D=killspace(D);if(!D){errMessage("请填写将领名称");return false}var C=D.match(/[^\x00-\xff]/ig);var A=D.length+(C==null?0:C.length);if(A>8||A<2){errMessage("将领的姓名不能超过4个汉字或者8个字母");return false}item_general_act.queryData.gn=D}item_general_act.queryData.ptyle=F;item_general_act.queryData.pkey=B;item_general_act.queryData.pid=H;item_general_act.queryData.action="insert";item_general_act.sendRequest()}if(H>49&&H<=56 || H==58 || H==60){ item_box_act.queryData.choice=choice;item_box_act.queryData.ptyle=F;item_box_act.queryData.pkey=B;item_box_act.queryData.pid=H;item_box_act.queryData.action="insert";item_box_act.sendRequest()}if(H==40){item_res_act.queryData.ptyle=F;item_res_act.queryData.pkey=B;item_res_act.queryData.pid=H;item_res_act.queryData.action="stop_war_insert";item_res_act.sendRequest()}}function item_res_action(B,A){item_shop_act.queryData.pkey=A;item_shop_act.queryData.pid=B;item_shop_act.queryData.action="confirm";item_shop_act.sendRequest()}function item_box_action(B,A){item_shop_act.queryData.pkey=A;item_shop_act.queryData.pid=B;item_shop_act.queryData.action="box";item_shop_act.sendRequest()}function item_build_time_action(queue_id){item_shop_act.queryData.action="build_time_add";item_shop_act.queryData.queue_id=queue_id;item_shop_act.sendRequest();return false}function item_buy_res_action(){item_shop_act.queryData.action="buy_res_add";item_shop_act.sendRequest();return false}function gold_build_add(B){var C=document.getElementsByName("pay_style");for(i=0;i<C.length;i++){if(C[i].checked){C[i].checked=false}}var A=document.getElementsByName("item_value");for(i=0;i<A.length;i++){if(A[i].checked){A[i].checked=false}}if(B==1){document.getElementById("res_build").style.display="block";document.getElementById("military_build").style.display="none";A[0].checked=true;C[0].checked=true}if(B==2){document.getElementById("res_build").style.display="none";document.getElementById("military_build").style.display="block";A[4].checked=true;C[2].checked=true}}var update_map_res=new DAjax("/modules/military/interface.php",{logic:{act:"update_res",type:"e"}});update_map_res.onComplete=function(){set_city_resource.sendRequest()};function get_buy_res_num(A,H,B,E,D){var F=/^[0-9_]+$/;A=parseInt(A);if(F.test(A)){var C=A*E;if(C>D){document.getElementById(H).value=D/E;document.getElementById(B).innerHTML=D}else{document.getElementById(B).innerHTML=C;document.getElementById(H).value=A}}else{document.getElementById(H).value=0;document.getElementById(B).innerHTML=0}}var item_buy_res_act=new DAjax("/modules/military/shop_res.php",{logic:{act:"shop_res",type:"e"}});item_buy_res_act.onComplete=function(){mask.processInfo(this.responseData)};function buy_res_action(A,B){var F=document.getElementById("pay_style_1");if(F.checked){var J=F.value}else{var J=document.getElementById("pay_style_2").value}var C=document.getElementById("m_gold").value;var H=document.getElementById("n_gold").value;var D=document.getElementById("t_gold").value;var I=document.getElementById("k_gold").value;if(!C){C=0}if(!H){H=0}if(!D){D=0}if(!I){I=0}var E=parseInt(C)+parseInt(H)+parseInt(D)+parseInt(I);if(E<=0){errMessage("购买资源的金币数必须大于0");return false}item_buy_res_act.queryData.ptyle=J;item_buy_res_act.queryData.pkey=B;item_buy_res_act.queryData.pid=A;item_buy_res_act.queryData.pbuy="1";item_buy_res_act.queryData.m_gold=C;item_buy_res_act.queryData.n_gold=H;item_buy_res_act.queryData.t_gold=D;item_buy_res_act.queryData.k_gold=I;item_buy_res_act.queryData.action="buy_res_insert";item_buy_res_act.sendRequest()}function two_buy_res_action(F,C,H,B,A,E,D){mask.remove();item_buy_res_act.queryData.ptyle=F;item_buy_res_act.queryData.pkey=C;item_buy_res_act.queryData.pid=H;item_buy_res_act.queryData.pbuy="2";item_buy_res_act.queryData.m_gold=B;item_buy_res_act.queryData.n_gold=A;item_buy_res_act.queryData.t_gold=E;item_buy_res_act.queryData.k_gold=D;item_buy_res_act.queryData.action="buy_res_insert";item_buy_res_act.sendRequest()}function general_reset_point_action(A){item_shop_act.queryData.pid=A;item_shop_act.queryData.action="gpreset";item_shop_act.sendRequest()}function item_general_reset_point_action(F,A){var C=document.getElementById("pay_style_1");if(C.checked){var D=C.value}else{var D=document.getElementById("pay_style_2").value}var E=document.getElementById("g_point").value;var B=document.getElementById("general_point_type").value;mask.remove();item_general_act.queryData.ptyle=D;item_general_act.queryData.pkey=A;item_general_act.queryData.pid=F;item_general_act.queryData.g_point=E;item_general_act.queryData.g_point_type=B;item_general_act.queryData.action="point_insert";item_general_act.sendRequest()}function get_general_point(B,A,C,E,F,P){var D=/^[0-9_]+$/;var B=parseInt(B);if(D.test(B)){if(B>A||B<=0){B=A}ap=C-B;document.getElementById("after_point").innerHTML=ap;document.getElementById("g_point").value=B;if(F==1){B=Math.ceil(B/2)}else if(F==2){B=Math.ceil(B/P);}document.getElementById("gold_point").innerHTML=B}else{document.getElementById("g_point").value=1;document.getElementById("gold_point").innerHTML=1;get_general_point(1,A,C,E)}}var logic={ajaxId:"reassignResource",act:"reassignResource",type:"o",cla:"Trade",operateType:"class"};var reassign=new DAjax("/modules/gateway.php",{option:{formName:"trade_reassign",method:"get",messageState:"mask",message:"资源转化中..."},logic:logic});reassign.onComplete=function(){set_city_resource.sendRequest();get_money.sendRequest();var i=mask.showMsgBox("资源转化完成!<br />如果你界面显示的资源和金币数目没有改变,<br />请按刷新F5刷新本页面.",true);eval(currentTabId+".sendRequest();")};reassign.onNoneGet=function(){mask.showMsgBox(this.errorMessage,true)};function reassignStart(free){if(intVal($F("c_a"))!=0){var i=mask.showMsgBox("转化资源总数目不对, 请重新调整.",true)}else{var msg = "本次资源转化需要 2 金币，确定要转化吗？";if(free && free > 0){var msg = "本次资源转化免费，确定要转化吗？";}if(confirm(msg)){reassign.sendRequest();Element.hide("reassing_button");eval(currentTabId+".sendRequest();")}}return false}function upd_res(A){return false}var logic={ajaxId:"sell",act:"addTrade",type:"o",cla:"Trade",operateType:"class"};var sell=new DAjax("/modules/gateway.php",{option:{formName:"trade_sell",method:"get",messageState:"mask",message:"卖出资源..."},logic:logic});sell.onBeforeSend=function(){if($F("trade_demand_id")==$F("trade_offer_id")){mask.showMsgBox("提 供/需 求 不能为同一种资源",true);this.sendRequestMark=false;return false}else{this.sendRequestMark=true}var C=$("trade_offer_num").value;var B=$("trade_demand_num").value;C=intVal(C);B=intVal(B);var A=C/B;A=A.toPrecision(2);if(C||B){if(C/B>2||C/B<0.5){mask.showMsgBox("当前城池的市场交易利率最低为 "+transaction_proportion.min+"，最高为 "+transaction_proportion.max+" ，但是您的货物交易利率为 "+A+"，不符合要求，因此武林三国总商行退回了你提交的贸易单!",true);this.sendRequestMark=false}else{this.sendRequestMark=true}}C=null;A=null;B=null};sell.onComplete=function(){var A=mask.showMsgBox("卖出资源成功!",true);setTimeout("mask.removeById("+A+")",1000);city_trade_buy.sendRequest();set_city_resource.sendRequest()};sell.onNoneGet=function(){mask.showMsgBox(this.errorMessage,true)};function sellStart(){sell.sendRequest();return false}var logic={ajaxId:"cancelSell",act:"cancelTrade",type:"o",cla:"Trade",operateType:"class"};var cancelSell=new DAjax("/modules/gateway.php",{option:{method:"get",message:"取消卖出资源..."},logic:logic});cancelSell.onComplete=function(){var i=mask.showMsgBox("取消卖出资源成功!",true);setTimeout("mask.removeById("+i+")",1000);set_city_resource.sendRequest();eval(currentTabId+".sendRequest();")};cancelSell.onNoneGet=function(){mask.showMsgBox(this.errorMessage,true)};function cancelSellStart(A){if(confirm("确认取消此笔交易?")){cancelSell.sendRequest([],{trade_id:A})}return false}var logic={ajaxId:"user_data",act:"findTrade",type:"o",cla:"Trade",operateType:"class",cache:0};var ctl=[];var trade_list=new DAjax("/modules/gateway.php",{option:{message:"读取市场信息...",page:{func:"trade_list",handle:"getTrade"}},logic:logic,queryKey:{},setResponseKey:ctl});trade_list.onComplete=function(){try{var B=new Tpl();var C=' <table width="727" border="0" cellspacing="0" cellpadding="0" class="new_table"><tr class="b"><td width="200">提 供</td><td width="200">需 求</td><td width="109">玩 家</td><td width="109">需 时</td><td width="109">操 作</td></tr>  		{for p in data}	 		<tr><td><span style="float:left;">&nbsp;{if p.trade_alliance != 0}{/if}</span>&nbsp;${p.trade_offer_name}:${p.trade_offer_num}</td><td>${p.trade_demand_name}:${p.trade_demand_num}</td><td><a href="" onclick="return panel_user(\'${p.trade_provider}\')">${p.trade_provider}</a></td><td>${p.t}&nbsp;</td><td>{if p.op ==1}			{if (p.trade_offer_num/p.trade_demand_num>=transaction_proportion.min && p.trade_offer_num/p.trade_demand_num<=transaction_proportion.max)}				{if free_businessmen_num<p.bm}					商人数量不足				{else}					<a href="javascript:;" onclick="return buyStart(\'${p.trade_id}\');"><img src="${I_P}/trade/jy_mj.gif" /></a>				{/if}			{else}				交易比率限制			{/if}		{else}${p.msg}{/if}</td>		</tr>		{forelse}<div class="sg_jd_box_nox">无交易信息!</div>{/for}</table>';$("trade_list").update(B.process(C,{data:this.responseData}));var A=this.responseRows;if(A){Element.show("trade_list_nav");$("trade_list_nav").update(this.page.prompt(A))}else{Element.hide("trade_list_nav")}}catch(D){}set_city_resource.sendRequest()};trade_list.onNoneGet=function(){};function getTrade(B,A){B=parseInt(B);A=parseInt(A);if(isNaN(B)){B=0}if(isNaN(A)){A=0}trade_list.page.line=20;trade_list.page.pageNo=B;trade_list.page.start=A;var C=parseInt(B*trade_list.page.line+A);if(isNaN(C)){C=0}trade_list.queryData.offset=C;trade_list.queryData.line=parseInt(trade_list.page.line);if(trade_list.responseRows){}trade_list.queryData.search_res_id=intVal($F("search_res_id"));trade_list.queryData.trade_offer_num_min=intVal($F("trade_offer_num_min"));trade_list.queryData.trade_offer_num_max=intVal($F("trade_offer_num_max"));trade_list.sendRequest();return false}var logic={ajaxId:"buy",act:"startTrade",type:"o",cla:"Trade",operateType:"class"};var city_trade_buy_exec=new DAjax("/modules/gateway.php",{option:{method:"get",messageState:"mask",message:"读取市场信息..."},logic:logic});city_trade_buy_exec.onComplete=function(){set_city_resource.sendRequest();eval(currentTabId+".sendRequest();");var i=mask.showMsgBox(this.rMsg,true);setTimeout("mask.removeById("+i+")",1000)};city_trade_buy_exec.onNoneGet=function(){mask.showMsgBox(this.errorMessage,true);eval(currentTabId+".sendRequest();")};function buyStart(A){if(confirm("确认进行此笔交易?")){city_trade_buy_exec.queryData.trade_id=A;city_trade_buy_exec.sendRequest()}return false}var logic={ajaxId:"transitResources",act:"transitResources",type:"o",cla:"Trade",operateType:"class"};var transit=new DAjax("/modules/gateway.php",{option:{formName:"trade_transit",method:"get",messageState:"mask",message:"运送资源..."},logic:logic});transit.onComplete=function(){set_city_resource.sendRequest();var A=mask.showMsgBox("运送资源成功",true);setTimeout("mask.removeById("+A+")",1000);city_trade_navi.jump("city|city_trade|city_trade_transit")};transit.onNoneGet=function(){mask.showMsgBox(this.errorMessage,true)};function transitStart(){if($$("#trade_transit #transit_x")[0].value==""||$$("#trade_transit #transit_y")[0].value==""){mask.showMsgBox("请填写正确的坐标地址",true);Field.focus($$("#trade_transit #transit_x")[0]);return false}transit.sendRequest();return false}function upd_res(A){return false}var logic={ajaxId:"getCityNameByMapId",act:"getCityNameByMapId",type:"o",cla:"City",operateType:"class"};var getUserCityName=new DAjax("/modules/gateway.php",{option:{method:"get",message:"预览处理中..."},logic:logic,setResponseKey:{transit_city_name:"city_name"}});getUserCityName.onBeforeSend=function(){var A=intVal($F("transit_x"));var B=intVal($F("transit_y"));if($F("transit_x")&&$F("transit_y")){this.queryData.x=A;this.queryData.y=B;this.sendRequestMark=true}else{this.sendRequestMark=false}};getUserCityName.onComplete=function(){};getUserCityName.onNoneGet=function(){mask.showMsgBox(this.errorMessage,true)};function getUserCityNameStart(){getUserCityName.sendRequest();return false}var logic={ajaxId:"getMapIdByCityName",act:"getMapIdByCityName",type:"o",cla:"City",operateType:"class"};var getMapIdByCityName=new DAjax("/modules/gateway.php",{option:{method:"get",message:"预览处理中..."},logic:logic,setResponseKey:{transit_x:"x",transit_y:"y"}});getMapIdByCityName.onComplete=function(){};getMapIdByCityName.onNoneGet=function(){mask.showMsgBox(this.errorMessage,true)};function getMapIdByCityNameStart(){if($F("transit_city_name")){getMapIdByCityName.queryData.city_name=$F("transit_city_name");getMapIdByCityName.sendRequest()}return false}

function averageReassign()
{
	var sum = intVal($F('o_a')); 
	var left = sum % 4;
	var aver = (sum - left) / 4;

	var assign_left = 0;
	var temp_v = 0;

	for	(var i=1; i<5; i++)
	{
		if (depot_row[i-1] >= aver + left)
		{
			$('n_res' + i).value = aver + left;
			left = 0;
		}
		else
		{
			if (depot_row[i-1] >= aver)
			{
				$('n_res' + i).value = aver;
			}
			else
			{
				$('n_res' + i).value = depot_row[i-1];
				assign_left += aver - depot_row[i-1];
			}
		}
	}

	var count = 20;
	while (true)
	{
		count --;
		if (!count)
		{
			break;
		}

		if (0 == assign_left)
		{
			break;
		}
		else
		{
			if (assign_left < 0)
			{
				return ;
			}

			sum = assign_left; 
			left = sum % 4;
			aver = (sum - left) / 4;

			assign_left = left;
			temp_v = 0;

			for	(var i=1; i<5; i++)
			{
				temp_v = depot_row[i-1] - intVal($('n_res' + i).value);

				if (aver >= temp_v)
				{
					$('n_res' + i).value = intVal($('n_res' + i).value) + temp_v;
					assign_left += (aver - temp_v);
				}
				else
				{
					if (aver+left <= temp_v)
					{
						$('n_res' + i).value = intVal($('n_res' + i).value) + aver + left;
						assign_left -= left;
						left = 0;
					}
					else
					{
						$('n_res' + i).value = intVal($('n_res' + i).value) + aver;
					}
					
				}
			}
		}
	}


//	for	(var i=1; i<5; i++)
//	{
//		temp_v = depot_row[i-1] - intVal($('n' + i).value);
//
//		if (assign_left > temp_v)
//		{
//			$('n' + i).value = depot_row[i-1];
//			assign_left -= temp_v;
//		}
//		else
//		{
//			$('n' + i).value = intVal($('n' + i).value) + assign_left;
//			assign_left -= assign_left;
//		}
//	}
}



function reload_city_trade_transit(){city_trade_transit.sendRequest()}var trainClass={obj:"",get_obj:function(){if($("train_soldier_num_1")){this.obj=$("train_soldier_num_1")}else{this.obj=$("train_soldier_num")}},check_num:function(A,B){this.get_obj();if(A==0){errMessage("您不能再征募了");return false}num=this.obj.value+"";if(num==""||num==0){errMessage("请输入数值");return false}num=parseInt(num,10);if(isNaN(num)){errMessage("必须为数字");return false}if(num>A){errMessage("超过最大值,资源不足");return false}if(num<0){errMessage("请输入数值");return false}if(B>0){if($("RadioGroup1_0").checked){var C="金币"}else{var C="礼金券"}if(!confirm("本次征募需要 "+$("train_soldier_num_1").value*B+" "+C+"，确定要征募吗？")){return false}}this.obj.value=parseInt(this.obj.value,10);return true},addMax:function(A){this.get_obj();this.obj.value=A;this.cache_num=this.obj.value},add1:function(A){this.get_obj();if(this.obj.value<A){var B=parseInt(this.obj.value,10);this.obj.value=B+1;this.cache_num=this.obj.value}else{this.obj.value=A}},add0:function(A){this.get_obj();if(this.obj.value>0){var B=parseInt(this.obj.value,10);this.obj.value=B-1;this.cache_num=this.obj.value}else{this.obj.value=0}},cache_num:"",checkIn:function(A){this.get_obj();if(this.obj.value==""){this.cache_num="";return }if(parseInt(this.obj.value,10)!=this.obj.value){this.obj.value=this.cache_num}if(this.obj.value>A){this.obj.value=A}this.cache_num=this.obj.value;this.obj.value=parseInt(this.obj.value,10)},union_admin_check:function(A){return true},check_pic:function(B){B=""+B;if(B==""){return true}var A=B.substr(1,2);if(A==":/"||A==":\\"){return true}else{return false}},union_upload:function(){if($("admin6_pic").value==""){alert("请输入图片路径");return false}if(!this.check_pic($("admin6_pic").value)){alert("请输入合法的图片路径");return false}}};var myMap={x:0,y:0,startX:0,startY:0,picW:74,picH:42,px:"null",py:"null",posX:0,posY:0,stat_posX:"null",stat_posY:"null",stat_px:"null",stat_py:"null",DivPosX:0,DivPosY:0,isIE:true,user_account:"",user_px:0,user_py:0,map_id:0,div:0,mapData:new Array(),dir:0,map_tpl:new Array(),map_tree:new Array(),IMG_URL:"http://static.sg.9wee.com/",cache_flag:true,'selected_map_id':0,checkIsIE:function(){var A=navigator.userAgent.toLowerCase();this.isIE=((A.indexOf("msie")!=-1)&&(A.indexOf("opera")==-1)&&(A.indexOf("omniweb")==-1))},getMousePos:function(B,F){var E,D;var C=F;var E=F.offsetTop;var D=F.offsetLeft;var A=(B.clientX-D+ieTrueBody().scrollLeft);var H=(B.clientY-E+ieTrueBody().scrollTop);if(this.isIE){A=A-2;H=H-2}this.x=A;this.y=H},getPxy:function(){var H=Math.ceil(this.x/(this.picW/2));var E=Math.ceil(this.y/(this.picH/2));var D=this.x-((H-1)*(this.picW/2));var A=this.y-((E-1)*(this.picH/2));this.posX=(H+E-2)/2;this.posY=(H-E)/2;var F=Math.abs(this.startX-this.startY);if(F/2==Math.ceil(F/2)){this.posX+=0.5}else{this.posY+=0.5}this.px=H;this.py=E;var C=0;var B=false;if(Math.ceil(this.posX)!=this.posX){D=(this.picW/2)-D;if((D/A)<=(this.picW/this.picH)){B=true}if(B){this.posX+=0.5;this.px+=1;this.py+=1;C=1}else{this.posX-=0.5;C=2}}else{if((D/A)>=(this.picW/this.picH)){B=true}if(B){this.posY+=0.5;this.px+=1;C=3}else{this.posY-=0.5;this.py+=1;C=4}}},resetDivPos:function(){this.DivPosX=getLeft($("map_center"));this.DivPosY=getTop($("map_center"));$("apDivOver").style.left=this.DivPosX+"px";$("apDivOver").style.top=this.DivPosY+"px"},setRowPos:function(B){if(this.px=="null"){this.setRowPosCenter();return }var A=(this.px-2)*(this.picW/2);var D=(this.py-2)*(this.picH/2);A-=1;D-=1;try{$("apDivRow").style.left=A+"px";$("apDivRow").style.top=D+"px";if(typeof (B)!="undefined"&&B=="show_stat"){$("statApDivRow").style.left=A+"px";$("statApDivRow").style.top=D+"px"}}catch(C){}},setRowPosCenter:function(){var A=(3)*this.picW;var D=(4)*this.picH;var B=Math.abs(this.startX-this.startY);if(Math.ceil(B/2)!=B/2){D+=0.5*this.picH}this.px="null";A-=1;D-=1;try{$("apDivRow").style.left=A+"px";$("apDivRow").style.top=D+"px";$("statApDivRow").style.left=A+"px";$("statApDivRow").style.top=D+"px"}catch(C){}},getPos:function(B,A){this.getMousePos(A,B);this.getPxy();this.resetDivPos();this.setRowPos();setTimeout("myMap.setRightInfo()",0)},createMap:function(){var V="";var K=this.startX;var J=this.startY;var I=p_xy(K,J);var A=I.p;if(typeof (this.map_tpl[A])!="undefined"){V=this.map_tpl[A]}else{var H=0;var F=0;var P=0;var E="",C="",B="";for(var S=1;S<=20;S++){var U=Math.abs(K-J);if(U/2!=Math.ceil(U/2)){V+='<div class="map'+S+' second">';if(S==1){P=1}for(var R=0;R<=6;R++){H=K+R;F=J+R+P;var O=p_xy(H,F);var D=O.p;var N="";if(typeof (this.mapData[D])!="undefined"){if(this.mapData[D]["user_account"]!=""){if(this.mapData[D]["belong_country"]==1){E="wei"}if(this.mapData[D]["belong_country"]==2){E="shu"}if(this.mapData[D]["belong_country"]==3){E="wu"}var L=this.mapData[D]["denizen_number"];if(L<=100){C="1"}if(L>100&&L<=400){C="2"}if(L>400&&L<=800){C="3"}if(L>800&&L<=1500){C="4"}if(L>1500){C="5"}B="0";if(this.mapData[D]["relation"]==1){B="2"}if(this.mapData[D]["relation"]==7){B="3"}if(this.mapData[D]["relation"]==2){B="4"}if(this.mapData[D]["user_account"]==myMap.user_account){B="1"}N=B+"/"+E+"_"+C}if(this.mapData[D]["map_type"]==2){N="sys_map"}if(this.mapData[D]["map_type"]==3){N="sys_map"}if(this.mapData[D]["map_type"]==4){N="sys_map"}if(this.mapData[D]["map_type"]==5){N="npc"}}if(N==""){if(typeof (this.map_tree[D])=="undefined"){var Q=Math.random();if(Q<=0.8){N="bg"+1}else{Q=Math.random();Q=Math.floor(Q*9)+1;N="bgA"+Q}this.map_tree[D]=N}else{N=this.map_tree[D]}}V+='<img src="'+this.IMG_URL+"map/newmap/"+N+'.gif" />'}V+="</div>";J-=1}else{V+='<div class="map'+S+' first">';for(var R=0;R<=7;R++){H=K+R;F=J+R+P;var O=p_xy(H,F);var D=O.p;var N="";if(typeof (this.mapData[D])!="undefined"){if(this.mapData[D]["user_account"]!=""){if(this.mapData[D]["belong_country"]==1){E="wei"}if(this.mapData[D]["belong_country"]==2){E="shu"}if(this.mapData[D]["belong_country"]==3){E="wu"}var L=this.mapData[D]["denizen_number"];if(L<=100){C="1"}if(L>100&&L<=400){C="2"}if(L>400&&L<=800){C="3"}if(L>800&&L<=1500){C="4"}if(L>1500){C="5"}B="0";if(this.mapData[D]["relation"]==1){B="2"}if(this.mapData[D]["relation"]==7){B="3"}if(this.mapData[D]["relation"]==2){B="4"}if(this.mapData[D]["user_account"]==myMap.user_account){B="1"}N=B+"/"+E+"_"+C}if(this.mapData[D]["map_type"]==2){N="sys_map"}if(this.mapData[D]["map_type"]==3){N="sys_map"}if(this.mapData[D]["map_type"]==4){N="sys_map"}if(this.mapData[D]["map_type"]==5){N="npc"}}if(N==""){if(typeof (this.map_tree[D])=="undefined"){var Q=Math.random();if(Q<=0.91){N="bg"+1}else{Q=Math.random();Q=Math.floor(Q*9)+1;N="bgA"+Q}this.map_tree[D]=N}else{N=this.map_tree[D]}}V+='<img src="'+this.IMG_URL+"map/newmap/"+N+'.gif" />'}V+="</div>";K+=1}}V+='<div id="statApDivRow" style="cursor:pointer;" ><img src="'+this.IMG_URL+'map/focus.gif" width="76" height="43" /></div>';V+='<div id="apDivRow" style="cursor:pointer;" ><img src="'+this.IMG_URL+'map/row.gif" width="76" height="43" /></div>';this.map_tpl[A]=V}try{$("map_center").innerHTML=V}catch(T){return }if(this.dir=="center"||this.dir=="go"){this.setRowPosCenter();this.posX=8;this.posY=-1;this.statPosX=this.posX;this.statPosY=this.posY;this.statPx=this.px;this.statPy=this.py}else{this.setRowPos("show_stat")}this.setRightInfo();this.setBiaoChi();this.selected_map_id = this.map_id;},setRightInfo:function(){var E=this.posX+this.startX;var D=this.posY+this.startY;var C=p_xy(E,D);E=C.x;D=C.y;this.map_id=C.p;var A=this.map_id;try{$("map_id_ZuoBiao").innerHTML=E+" | "+D}catch(B){}if(typeof (this.mapData[A])!="undefined"){if(this.mapData[A]["user_account"]!=""){$("map_id_MingCheng").innerHTML=this.mapData[A]["city_name"];$("map_id_WanJia").innerHTML='<a href="javascript:;" title="'+this.mapData[A]["user_nickname"]+'" onclick="panel_user(\''+this.mapData[A]["user_nickname"]+"')\">"+sub_str(this.mapData[A]["user_nickname"],12,"..","left")+"</a>";$("map_id_ShuLiang").innerHTML=this.mapData[A]["denizen_number"];if(this.mapData[A]["union_name"]!=""&&this.mapData[A]["union_name"]!="0"){$("map_id_LianMeng").innerHTML='<a href="javascript:;" onclick="panel_union(\''+this.mapData[A]["union_name"]+"')\">"+this.mapData[A]["union_name"]+"</a>"}else{$("map_id_LianMeng").innerHTML="-"}}else{$("map_id_MingCheng").innerHTML="空地";if(this.mapData[A]["map_type"]==2){$("map_id_MingCheng").innerHTML="世界的中心"}if(this.mapData[A]["map_type"]==3){$("map_id_MingCheng").innerHTML="奇迹村"}$("map_id_WanJia").innerHTML="-";$("map_id_ShuLiang").innerHTML="-";$("map_id_LianMeng").innerHTML="-"}}else{$("map_id_MingCheng").innerHTML="空地";$("map_id_WanJia").innerHTML="-";$("map_id_ShuLiang").innerHTML="-";$("map_id_LianMeng").innerHTML="-"}},setBiaoChi:function(){return ;var D=Math.abs(this.startX-this.startY);if((D/2)!=Math.floor(D/2)){D=1}else{D=0}var E=this.startY-9;var C="";for(var B=0;B<7;B++){var A=E;if(A>400){A=A-801}if(A<-400){A=A+801}if(D==1){if(B==0){C+='<li style="padding-left:20px;width:36px;">'+A+"</li>"}else{C+="<li >"+A+"</li>"}}else{if(B==0){C+='<li style="padding-left:20px;width:71px;">'+A+"</li>"}else{C+="<li >"+A+"</li>"}}E++}$("map_BiaoChi_0").innerHTML=C;C="";for(var B=0;B<10;B++){var A=E;if(A>400){A=A-801}if(A<-400){A=A+801}if(D==1){if(B==9){C='<li class="db" style="padding-top:20px;">'+A+"</li>"+C}else{if(B==0){C='<li class="db" style="padding-top:10px;">'+A+"</li>"+C}else{C='<li class="dy">'+A+"</li>"+C}}}else{if(B==9){C='<li class="db">'+A+"</li>"+C}else{if(B==0){C='<li class="db">'+A+"</li>"+C}else{C='<li class="dy">'+A+"</li>"+C}}}E++}$("map_BiaoChi_1").innerHTML=C},setStartXY:function(A){this.dir=A;switch(A){case"up":div=this.div/2;if(div==Math.floor(div)){this.startX-=div;this.startY+=div}else{tmp=Math.abs(this.startX-this.startY)/2;if(tmp==Math.floor(tmp)){this.startX-=Math.floor(div);this.startY+=(Math.floor(div)+1)}else{this.startX-=(Math.floor(div)+1);this.startY+=Math.floor(div)}}break;case"down":div=this.div/2;if(div==Math.floor(div)){this.startX+=div;this.startY-=div}else{tmp=Math.abs(this.startX-this.startY)/2;if(tmp==Math.floor(tmp)){this.startX+=(Math.floor(div)+1);this.startY-=Math.floor(div)}else{this.startX+=Math.floor(div);this.startY-=(Math.floor(div)+1)}}break;case"right":div=this.div/2;if(div==Math.floor(div)){this.startX+=div;this.startY+=div}else{tmp=Math.abs(this.startX-this.startY)/2;if(tmp==Math.floor(tmp)){this.startX+=(Math.floor(div)+1);this.startY+=Math.floor(div)}else{this.startX+=Math.floor(div);this.startY+=(Math.floor(div)+1)}}break;case"left":div=this.div/2;if(div==Math.floor(div)){this.startX-=div;this.startY-=div}else{tmp=Math.abs(this.startX-this.startY)/2;if(tmp==Math.floor(tmp)){this.startX-=Math.floor(div);this.startY-=(Math.floor(div)+1)}else{this.startX-=(Math.floor(div)+1);this.startY-=Math.floor(div)}}break;case"up_left":this.startX-=this.div;break;case"up_right":this.startY+=this.div;break;case"down_left":this.startY-=this.div;break;case"down_right":this.startX+=this.div;break;case"center":this.startX=this.user_px-8;this.startY=this.user_py+1;break}var B=p_xy(this.startX,this.startY);if(this.cache_flag&&typeof (this.map_tpl[B.p])!="undefined"){this.createMap()}else{map_show.queryData.startX=myMap.startX;map_show.queryData.startY=myMap.startY;map_show.sendRequest()}},insertData:function(C){if(C!="null"){for(var B=0;B<C.length;B++){var A=C[B]["0"];this.mapData[A]=new Array();this.mapData[A]["map_id"]=C[B][0];this.mapData[A]["user_id"]=C[B][1];this.mapData[A]["user_account"]=C[B][2];this.mapData[A]["user_nickname"]=C[B][3];this.mapData[A]["belong_country"]=C[B][4];this.mapData[A]["map_type"]=C[B][5];this.mapData[A]["use_flag"]=C[B][6];this.mapData[A]["denizen_number"]=C[B][7];this.mapData[A]["city_name"]=C[B][8];this.mapData[A]["union_name"]=C[B][9];this.mapData[A]["union_id"]=C[B][10];this.mapData[A]["register_time"]=C[B][11];this.mapData[A]["relation"]=C[B][12]}}myMap.createMap()},go_pos:function(){if($("map_x_value").value==""||$("map_y_value").value==""){errMessage("请输入完整的坐标点");return }var A=parseInt($("map_x_value").value,10);var C=parseInt($("map_y_value").value,10);if(A>400){A=400}if(C<-400){C=-400}var B=p_xy(A,C);A=B.x;C=B.y;$("map_x_value").value=A;$("map_y_value").value=C;this.startX=A-8;this.startY=C+1;this.dir="go";B=p_xy(this.startX,this.startY);if(typeof (this.map_tpl[B.p])!="undefined"){this.createMap()}else{map_show.queryData.startX=myMap.startX;map_show.queryData.startY=myMap.startY;map_show.sendRequest()}this.setRowPosCenter()},cache_num:new Array("",""),checkIn_go_pos:function(B,A){if(B.value=="-"){return }if(B.value==""){this.cache_num[A]="";return }if(parseInt(B.value,10)!=B.value){B.value=this.cache_num[A]}this.cache_num[A]=B.value;B.value=parseInt(B.value,10);if(this.cache_num[A]==""){B.value=""}if(B.value>400){B.value=400}if(B.value<-400){B.value=-400}},set_statRow:function(D,B){this.getMousePos(B,D);this.getPxy();this.resetDivPos();this.statPosX=this.posX;this.statPosY=this.posY;this.statPx=this.px;this.statPy=this.py;var A=(this.px-2)*(this.picW/2);var E=(this.py-2)*(this.picH/2);A-=1;E-=1;try{$("statApDivRow").style.left=A+"px";$("statApDivRow").style.top=E+"px";this.selected_map_id = this.map_id;}catch(C){}},set_RowOut:function(){this.posX=this.statPosX;this.posY=this.statPosY;this.px=this.statPx;this.py=this.statPy;var A=(this.px-2)*(this.picW/2);var C=(this.py-2)*(this.picH/2);A-=1;C-=1;try{$("apDivRow").style.left=A+"px";$("apDivRow").style.top=C+"px";$("apDivRow").style.left="-1000px";$("apDivRow").style.top="-1000px"}catch(B){}},get_targetInfo:function(I){var F,C,D,B,J;F=myMap.selected_map_id;if(typeof (this.mapData[F])!="undefined"){if(typeof (this.mapData[F]["user_account"])!="undefined"){C=this.mapData[F]["city_name"];D=this.mapData[F]["user_account"];target_user_nickname=this.mapData[F]["user_nickname"]}else{C="";D="";target_user_nickname=""}B=this.mapData[F]["map_type"];J=this.mapData[F]["use_flag"]}else{C="";D="";target_user_nickname="";B=1;J=0}if(I=="sendMsg"){if(D==myMap.user_account){errMessage("不能对自己发送消息");return }if(D==""){errMessage("不能对非用户发送消息");return }reply_nickname=target_user_nickname;writeStartPopUi(reply_nickname);return }if(I=="showInfo"){reply_nickname=target_user_nickname;panel_user(reply_nickname);return }var A=p_xy(myMap.selected_map_id);var K="{;|;}";var H=F+K+C+K+D+K+B+K+J+K+A.x+K+A.y;map_military_action(I,H)},init:function(){this.checkIsIE()},reSet:function(){this.map_tpl.length=0}};myMap.init();function panel_union(A,B){if(typeof (A)=="undefined"||A=="-"||A==""){return false}A=encodeURIComponent(""+A);if(typeof (B)=="undefined"){mask.loadInfo("/modules/user_info.php?action=show&type=panel_union&union_name="+A+"&p=1",{})}else{mask.loadInfo("/modules/user_info.php?action=show&type=panel_union&union_name="+A+"&p="+B,{option:{lbType:"o"}})}return false}function panel_user(B,A){if(typeof (B)=="undefined"||B=="-"||B==""){return false}B=encodeURIComponent(""+B);if(typeof (A)=="undefined"){mask.loadInfo("/modules/user_info.php?action=show&type=panel_user&user_nickname="+B+"&p=1",{})}else{mask.loadInfo("/modules/user_info.php?action=show&type=panel_user&user_nickname="+B+"&p="+A,{option:{lbType:"o"}})}return false}function getTop(A){var B=A.offsetTop;if(A.offsetParent!=null){B+=getTop(A.offsetParent)}return B}function getLeft(A){var B=A.offsetLeft;if(A.offsetParent!=null){B+=getLeft(A.offsetParent)}return B}function ieTrueBody(){return(document.compatMode&&document.compatMode!="BackCompat")?document.documentElement:document.body}function p_xy(A,D){res=new Array;if(typeof (A)=="undefined"){alert("错误: p_xy函数必须要有一个参数");return res}A=parseInt(A,10);if(typeof (D)=="undefined"){if(A<0||A>800800){res.x=0;res.y=0;res.p=0;alert("错误: p -> xy 函数,参数超出范围 p="+A)}else{A=""+A;tmp_x=parseInt(A/1000,10);tmp_y=A%1000;res.x=tmp_x-400;res.y=tmp_y-400;res.p=A}}else{D=parseInt(D,10);if(A>400){A=A-801}if(D>400){D=D-801}if(A<-400){A=A+801}if(D<-400){D=D+801}res.x=A;res.y=D;var B=D+400;var C="";if(B<10){C="00"}if(B<100&&B>=10){C="0"}B=C+B;if(A>-400){A+=400;res.p=""+A+B}else{res.p=D+400}}return res}function sql_filter(A){A=A.replace(/(\r\n|\r|\n)/g,"<br>");A=A.replace(/<script /ig,"&lt;script ");A=A.replace(/<a /ig,"<a target=_blank ");A=A.replace(/<\?xml .*?\?>/i,"");A=A.replace(/&/g,"&amp;");A=A.replace(/</g,"&lt;");A=A.replace(/>/g,"&gt;");return A}function sub_str(F,A,E,B){F=F.toString();if(E==null){E=""}if(B==null){B="left"}if(F.replace(/[^\x00-\xff]/gi,"xx").length<=A){return F}if(B=="left"){var D=A;F=F.substr(0,A);while(F.replace(/[^\x00-\xff]/gi,"xx").length>A){F=F.substr(0,--D)}}if(B=="right"){var C=0;F=F.substr(F.length-A,A);while(F.replace(/[^\x00-\xff]/gi,"xx").length>A){F=F.substr(1,A)}}return F+E}var train_div_num=1;var union_div_num=1;var city_build_polity=new DAjax("/modules/train.php?action=show&type=polity_TuoHuangXinCheng",{logic:{ajaxId:"city_build_polity",type:"e"}});var city_build_QianDu=new DAjax("/modules/train.php?action=show&type=polity_QainDu",{logic:{ajaxId:"city_build_QianDu",type:"e"}});var polity_JuBanQingDian_do=new DAjax("/modules/train.php?action=do&type=polity_JuBanQingDian",{logic:{ajaxId:"",type:"e"}});polity_JuBanQingDian_do.onComplete=function(){var A=polity_JuBanQingDian_do.responseData;if(A!=""){errMessage(A)}else{city_build_polity.sendRequest();set_city_resource.sendRequest()}};var polity_QainDu_do=new DAjax("/modules/train.php?action=do&type=polity_QainDu",{logic:{ajaxId:"",type:"e"}});polity_QainDu_do.onComplete=function(){var A=polity_QainDu_do.responseData;if(A!=""){errMessage(A);city_build_QianDu.sendRequest()}else{mask.showMsgBox("<br />迁都进行中 ...");mask.loadInfo("/modules/train.php?action=show&type=polity_QainDu&check",{option:{lbType:"o"}})}};var military_soldiers=new DAjax("/modules/train.php?action=show&type=train_BuBing",{logic:{ajaxId:"military_soldiers",type:"e"}});var soldier_train_1=new DAjax("/modules/train.php?action=show&type=train_BuBing",{logic:{ajaxId:"soldier_train_1",type:"e"}});var train_JunDui_do=new DAjax("/modules/train.php?action=do&type=train_JunDui",{logic:{ajaxId:"",type:"e"}});train_JunDui_do.onComplete=function(){var A=train_JunDui_do.responseData;if(A!=""&&A!="task"){errMessage(A)}else{if(A=="task"){showTask()}if(train_div_num==1){soldier_train_1.sendRequest()}if(train_div_num==2){soldier_train_2.sendRequest()}if(train_div_num==3){soldier_train_3.sendRequest();get_money.sendRequest()}if(train_div_num==4){soldier_train_4.sendRequest()}if(train_div_num==5){soldier_train_5.sendRequest()}set_city_resource.sendRequest();get_money.sendRequest()}};var soldier_train_2=new DAjax("/modules/train.php?action=show&type=train_QiBing",{logic:{ajaxId:"soldier_train_2",type:"e"}});var soldier_train_3=new DAjax("/modules/train.php?action=show&type=train_GongCheng",{logic:{ajaxId:"soldier_train_3",type:"e"}});var soldier_train_4=new DAjax("/modules/train.php?action=show&type=train_TeShu",{logic:{ajaxId:"soldier_train_4",type:"e"}});var soldier_train_5=new DAjax("/modules/train.php?action=show&type=train_XianJing",{logic:{ajaxId:"soldier_train_5",type:"e"}});var military_science=new DAjax("/modules/train.php?action=show&type=research_BingZhong",{logic:{ajaxId:"military_war",type:"e"}});var soldier_research_1=new DAjax("/modules/train.php?action=show&type=research_BingZhong",{logic:{ajaxId:"soldier_research_1",type:"e"}});var research_BingZhong_do=new DAjax("/modules/train.php?action=do&type=research_BingZhong",{logic:{ajaxId:"",type:"e"}});research_BingZhong_do.onComplete=function(){var A=research_BingZhong_do.responseData;if(A!=""){errMessage(A)}else{if(train_div_num==1){soldier_train_1.sendRequest()}if(train_div_num==2){soldier_train_2.sendRequest()}if(train_div_num==3){soldier_train_3.sendRequest();get_money.sendRequest()}if(train_div_num==4){soldier_train_4.sendRequest()}if(train_div_num==5){soldier_train_5.sendRequest()}set_city_resource.sendRequest();get_soldier_train.sendRequest();get_money.sendRequest()}};var soldier_research_2=new DAjax("/modules/train.php?action=show&type=research_WuQi",{logic:{ajaxId:"soldier_research_2",type:"e"}});var research_WuQi_do=new DAjax("/modules/train.php?action=do&type=research_WuQi",{logic:{ajaxId:"",type:"e"}});research_WuQi_do.onComplete=function(){var A=research_WuQi_do.responseData;if(A!=""){errMessage(A)}else{soldier_research_2.sendRequest();set_city_resource.sendRequest();get_soldier_train.sendRequest();get_money.sendRequest()}};var soldier_research_3=new DAjax("/modules/train.php?action=show&type=research_FangJu",{logic:{ajaxId:"soldier_research_3",type:"e"}});var research_FangJu_do=new DAjax("/modules/train.php?action=do&type=research_FangJu",{logic:{ajaxId:"",type:"e"}});research_FangJu_do.onComplete=function(){var A=research_FangJu_do.responseData;if(A!=""){errMessage(A)}else{soldier_research_3.sendRequest();set_city_resource.sendRequest();get_soldier_train.sendRequest();get_money.sendRequest()}};var map_top=new DAjax("/modules/map.php",{logic:{ajaxId:"map_top",type:"e"}});var map_show=new DAjax("/modules/map.php?show",{logic:{ajaxId:"",type:"e"}});map_show.onComplete=function(){var re=map_show.responseData;if(re!=""){if(re=="null"){myMap.insertData("null")}else{eval("var arr="+re);myMap.insertData(arr)}}};var union_yiguan=new DAjax("/modules/union.php?action=show&type=union_lianmeng_yiguan",{logic:{ajaxId:"union_yiguan",type:"e"}});var union_judian = new DAjax('/modules/union.php?action=show&type=union_lianmeng_judian', {logic:{ajaxId:'union_judian',type:'e'}});var union_lianmeng_gaikuang=new DAjax("/modules/union.php?action=show&type=union_lianmeng_gaikuang",{logic:{ajaxId:"union_lianmeng_gaikuang",type:"e"}});var union_lianmeng_chengyuan=new DAjax("/modules/union.php?action=show&type=union_lianmeng_chengyuan",{logic:{ajaxId:"union_lianmeng_chengyuan",type:"e"}});var union_lianmeng_shijian=new DAjax("/modules/union.php?action=show&type=union_lianmeng_shijian",{logic:{ajaxId:"union_lianmeng_shijian",type:"e"}});var union_baoku = new DAjax('/modules/union.php?action=show&type=union_lianmeng_baoku', {logic:{ajaxId:'union_baoku',type:'e'}});var union_zhanbao = new DAjax('/modules/union.php?action=show&type=union_lianmeng_zhanbao', {logic:{ajaxId:'union_zhanbao',type:'e'}});var union_junqing=new DAjax("/modules/union.php?action=show&type=union_junqing",{logic:{ajaxId:"union_junqing",type:"e"}});var union_quanxian=new DAjax("/modules/union.php?action=show&type=union_quanxian",{logic:{ajaxId:"union_quanxian",type:"e"}});var union_do=new DAjax("/modules/union.php?action=do",{logic:{ajaxId:"",type:"e"}});union_do.onComplete=function(){union_do.queryData['do_type']=null;var re=""+union_do.responseData;if(re!=""&&re!="succ"&&re.substr(0,7)!="script:"){errMessage(re)}else{if(re=="succ"){errMessage("操作成功!")}else{re=""+re;if(re.substr(0,7)=="script:"){var tmp=""+re.substr(7);eval(tmp)}}if(typeof (union_div_id)!="undefined"&&union_div_id!=""){eval(union_div_id+".sendRequest()")}}};var user_info=new DAjax("/modules/user_info.php",{logic:{ajaxId:"user_info",type:"e"}});var user_info_do=new DAjax("/modules/user_info.php?action=do",{logic:{ajaxId:"",type:"e"}});user_info_do.onComplete=function(){var C=user_info_do.responseData;if(C!=""&&C!="succ"){errMessage(C)}else{mask.remove();user_info.sendRequest();try{myMap.mapData[user_info_do.queryData.map_id]["city_name"]=sql_filter(user_info_do.queryData.new_city_name);var B=user_info_do.queryData.map_id;var E=p_xy(B);var A=user_info_do.queryData.old_city_name+" ("+E.x+"|"+E.y+")";if(A==$("html_id_current_city_name").outerText){$("html_id_current_city_name").innerHTML=user_info_do.queryData.new_city_name+" ("+E.x+"|"+E.y+")"}}catch(D){}city_relationship.sendRequest()}};var user_relation_0=new DAjax("/modules/user_relation.php?type=friend",{logic:{ajaxId:"user_relation_0",type:"e"}});var user_relation_1=new DAjax("/modules/user_relation.php?type=enemy",{logic:{ajaxId:"user_relation_1",type:"e"}});var user_relation_do=new DAjax("/modules/user_relation.php?action=do",{logic:{ajaxId:"",type:"e"}});user_relation_do.onComplete=function(){var re=user_relation_do.responseData;if(re!=""&&re.substr(0,7)!="script:"){errMessage(re)}else{re=""+re;if(re.substr(0,7)=="script:"){var tmp=""+re.substr(7);eval(tmp)}}};function set_enemy(A){mask.loadInfo("/modules/user_relation.php?action=show&flag=add_enemy&add_enemy_name="+encodeURIComponent(A),{})}function set_friend(A){mask.loadInfo("/modules/user_relation.php?action=show&flag=add_friend&add_friend_name="+encodeURIComponent(A),{})}var user_add2=new DAjax("/modules/user_info.php?user_add2",{logic:{ajaxId:"",type:"e"}});user_add2.queryData.x=window.screen.width;user_add2.queryData.y=window.screen.height;user_add2.sendRequest();function queueInit(){get_queue.sendRequest()}function queueRefresh(){set_city_resource.sendRequest();update_user_login_time.sendRequest()}var get_queue=new DAjax("/modules/gateway.php",{option:{messageState:false,method:"get"},logic:{act:"get_queue"}});get_queue.onComplete=function(){is_building={IB:this.responseData.is_building};updateBuilding();is_soldier_training={IB:this.responseData.is_soldier[0]};is_soldier_recruitment={IB:this.responseData.is_soldier[1]};updateSoldierTraining();is_military_training={IB:this.responseData.is_military};updateMilitaryTraining();city_army={IB:this.responseData.city_army[0]};reinforcement={IB:this.responseData.city_army[1]};updateCityArmy();updateReinforcementNum();var m_n=intVal(this.responseData.new_msg[0].msg_num);var u_n=intVal(this.responseData.new_msg[0].union_msg_num);if(m_n||u_n){if(m_n+u_n>tip_msg.user_msg){tip_msg.user_msg=m_n+u_n;setMsg("您有新消息, 请查收!")}else{tip_msg.user_msg=m_n+u_n}$("msg_img").src=I_P+"/newsg/url_xh2.gif"}var mi_num=intVal(this.responseData.new_msg[0].military_num);if(mi_num){if(mi_num>tip_msg.army_msg){tip_msg.army_msg=mi_num;setMsg("您有军事消息, 请查收!")}else{tip_msg.army_msg=mi_num}$("military_img").src=I_P+"/newsg/url_jq2.gif"}var sys_num=intVal(this.responseData.new_msg[0].sys_num);if(sys_num){if(sys_num>tip_msg.sys_msg){setMsg("您有系统消息, 请查收!")}tip_msg.sys_msg=sys_num;}var other_login = this.responseData.other_login;if (other_login){mask.showMsgBox('您的账号已在别处登陆，已经自动退出游戏！<br />您的密码可能已经泄露，请登陆用户中心及时修改密码或设定密保服务！', true);setTimeout('window.location.href="/login.php?logout"', 4000);}console.info(this.responseData.time);server_time_base=eval(this.responseData.time);set_city_resource.sendRequest();};function setSysTime(){server_time_base.setSeconds(server_time_base.getSeconds()+1);if(!$("server_time")){new Insertion.Before("main_money_c_o",'<div id="server_time" >'+server_time_base.toStr()+"</div>")}else{$("server_time").update(""+server_time_base.toStr())}}get_queue.onNoneGet=function(){};var get_city_building=new DAjax("/modules/gateway.php",{option:{messageState:false,method:"get"},logic:{act:"get_city_building"}});get_city_building.onComplete=function(){is_building={IB:this.responseData};updateBuilding()};get_city_building.onNoneGet=function(){};var get_soldier_train=new DAjax("/modules/gateway.php",{option:{messageState:false,method:"get"},logic:{act:"get_soldier_training"}});var is_soldier_training=null;var is_soldier_recruitment=null;get_soldier_train.onComplete=function(){is_soldier_training={IB:this.responseData[0]};is_soldier_recruitment={IB:this.responseData[1]};updateSoldierTraining()};get_soldier_train.onNoneGet=function(){};var get_military_train=new DAjax("/modules/gateway.php",{option:{messageState:false,method:"get"},logic:{act:"get_military_training"}});var is_military_training=null;get_military_train.onComplete=function(){is_military_training={IB:this.responseData};updateMilitaryTraining()};get_military_train.onNoneGet=function(){};var get_city_army=new DAjax("/modules/gateway.php?module=soldier",{option:{messageState:false,method:"get"},logic:{act:"get_city_army"}});var city_army=null;var reinforcement=null;get_city_army.onComplete=function(){city_army={IB:this.responseData[0]};reinforcement={IB:this.responseData[1]};
if (current_task_id==17)
{
	if (this.responseData[0][1].army_content==101 || this.responseData[0][1].army_content==112 || this.responseData[0][1].army_content==123)
	{
		if (this.responseData[0][1].army_num>=10)
		{
			//showTask();
		}
	}
}
updateCityArmy();updateReinforcementNum()};get_city_army.onNoneGet=function(){};function updateBuilding(){if(true){t=new Tpl();var A='{for b in IB}<li style="line-height:16px; height:18px; padding-top:6px; padding-bottom:2px;" id="b_${b.queue_id}"><div style="float:left">{if b.action_dictate ==3}<span style="color:#02c42b">↓</span>{else}<span style="color:#02c42b">↑</span>{/if}${b.build_name}(${b.now_rank}) <span id="need_time_${b.queue_id}">等待中</span>&nbsp;{if b.action_dictate ==3}{else}<span  id="timeout_stop_build_${b.queue_id}"><a href="" title="取消任务, 只会返还建造花费的一部分资源。" onclick="return stopBuild(\'${b.task_content}\');">×</a></div>{if b.start_time>0 && b.need_time>0}<div style="float:right"><a href="javascript:void(0);" onclick="return item_build_time_action(\'${b.queue_id}\');"><img src="${I_P}chengchi/speed_up.gif" width="16" height="16" /></a></div>{/if}</span>{/if}{if window.location.host.include("xiaoi.com")}&nbsp;{if intVal(readCookie("union_id"))}<img onclick="return union_lianmeng_navi.jump(\'union|union_lianmeng|union_lianmeng_gaikuang\');"  src="${I_P}/main/bell.gif"   class="cp"  border="0"     title="使用小i传令兵，建筑完成后会提醒您" />{else}<a  href="http://wan.xiaoi.com/gucenter/addxiaobing.jsp?username=${readCookie(\'user_account\')}" target="_blank"><img src="${I_P}/main/bell.gif"  border="0" title="使用小i传令兵，建筑完成后会提醒您" /></a>{/if}{else}{/if}</li><script>if(${b.start}){if("undefined"!=typeof(countdown_${b.queue_id})){countdown_${b.queue_id}.clear();};if(${b.need_time}<=0){$("need_time_${b.queue_id}").update(timeoutMsg)}else{countdown_${b.queue_id} = new clsCounter ( "countdown_${b.queue_id}" );countdown_${b.queue_id}.init("need_time_${b.queue_id}", ${b.need_time}, buildComplete);};}else{} Element.show(\'is_building_c\');<\/script>{forelse}<li>&nbsp;&nbsp;无建造信息</li><script>Element.hide(\'is_building_c\');<\/script>{/for}';try{var B=t.process(A,is_building);while(1){if($("is_building").next()){$("is_building").next().remove()}else{break}}new Insertion.After("is_building",B)}catch(C){}A=null}}var timeoutMsg='<font  title="？: 后台程序繁忙中, 请稍候" onclick="alert(\'后台程序繁忙中, 请稍候\')" >00:00:0<a href="javascript:;" ><b><span style="color:#FFFF00;text-decoration: underline;padding-left:1px;">?</span></b></a></font>';function buildComplete(){setMsg("有建筑建造或者升级完成");var id=this.clsName.split("_");$("need_time_"+id[1]).update(timeoutMsg);get_city_building.sendRequest();set_city_resource.sendRequest();if("city_build_resource"==currentTabId||"city_build_building"==currentTabId||"city_out"==currentTabId||"city_in"==currentTabId){eval(currentTabId+".sendRequest();")}is_building.IB.each(function(s,index){	if(s.now_rank==1){
		if(s.build_id==1&&2==current_task_id){check_task.sendRequest()}
		else{
			if(s.build_id==2||s.build_id==3||s.build_id==4){
				if(3==current_task_id){check_task.sendRequest()}
			}else{
				if(s.build_id==8||s.build_id==9){
					if(5==current_task_id){check_task.sendRequest()}
				}else{
					if(s.build_id==6||s.build_id==22){
						if(7==current_task_id){check_task.sendRequest()}
						}else{
							if(s.build_id==30||s.build_id==21){
								if(12==current_task_id){check_task.sendRequest()}
							}else{
								if(s.build_id==32||s.build_id==33||s.build_id==34||s.build_id==7){
									if(13==current_task_id){check_task.sendRequest()}
								}else{
									if(s.build_id==15){
										if(14==current_task_id){check_task.sendRequest()}
									}
								}
							}
						}
					}
				}
			}
		}else{
			if(s.now_rank==2){
				if(s.build_id==1&&6==current_task_id){check_task.sendRequest()}
				else{
					if(s.build_id==2||s.build_id==3||s.build_id==4){
						if(10==current_task_id){check_task.sendRequest()}
					} else {
						if(s.build_id==5&&18==current_task_id){check_task.sendRequest()}
					}
				}
			}else{
				if(s.now_rank==3){
					if(s.build_id==1&&12==current_task_id){check_task.sendRequest()}
				}else{
					if(s.now_rank==4){
						if(s.build_id==1&&16==current_task_id){check_task.sendRequest()}
					}
				}
			}}})}function updateSoldierTraining(){if(true){t=new Tpl();var A="{for b in IB}<li id=\"b_${b.queue_id}\"><span style=\"color:#02c42b\">↑</span> <a href=\"#\" onclick=\"return   {if b.science_type==1}military_soldiers_navi.jump('military|military_soldiers|soldier_train_${b.soldiers_type}'){else}military_science_navi.jump('military|military_science|soldier_research_${b.science_type}'){/if};\">${b.soldiers_name} ${b.type_name}正在研发中</a> </span>&nbsp;</li><script>Element.show('is_s_t_c');<\/script>{forelse}<li>&nbsp;&nbsp;无研发信息<script>Element.hide('is_s_t_c');<\/script></li>{/for}";try{var B=t.process(A,is_soldier_training);while(1){if($("is_soldier_training").next()){$("is_soldier_training").next().remove()}else{break}}new Insertion.After("is_soldier_training",B)}catch(C){}A=null;var A="{for b in IB}<li id=\"b_${b.queue_id}\">&nbsp;&nbsp;${b.soldiers_name} <a href=\"#\" onclick=\"return  military_soldiers_navi.jump('military|military_soldiers|soldier_train_${b.soldiers_type}');\">正在{if (b.task_content).substr(0, 3) == 134}制造{else}征兵{/if}中</a> &nbsp;<script>Element.show('is_s_r_c');<\/script></li>{forelse}<li>&nbsp;&nbsp;无征兵信息<script>Element.hide('is_s_r_c');<\/script></li>{/for}";try{var B=t.process(A,is_soldier_recruitment);while(1){if($("is_soldier_recruitment").next()){$("is_soldier_recruitment").next().remove()}else{break}}new Insertion.After("is_soldier_recruitment",B)}catch(C){}A=null}return false}function soldierComplete(){var A=this.clsName.split("_");$("need_time_"+A[1]).update("?");A=null}function updateMilitaryTraining(){if(true){t=new Tpl();var C='{for b in IB}<li id="b_${b.queue_id}">&nbsp;&nbsp;{if b.i == 1}<span style="color:red;">${b.name}</span>{else}<span style="color:#02c42b;">${b.name}</span>{/if} ×${b.num} <span id="need_time_${b.queue_id}"> </span>&nbsp;<a href="#" onclick="return   military_war_navi.jump(\'military|military_war|military_war_news\');">查看</a></li><script>if("undefined"!=typeof(countdown_${b.queue_id})){countdown_${b.queue_id}.clear();} ;if(${b.need_time}<=0){$("need_time_${b.queue_id}").update(timeoutMsg)}else{countdown_${b.queue_id} = new clsCounter ( "countdown_${b.queue_id}" );countdown_${b.queue_id}.init("need_time_${b.queue_id}", ${b.need_time}, militaryComplete);}; Element.show(\'is_military_training_c\');<\/script>{forelse}<li>&nbsp;&nbsp;无战争动态信息</li>{/for}';for(var A in is_military_training.IB){var B=is_military_training.IB[A];switch(A){case"1":tip_msg.army_cz=B.num;break;case"2":if(B.num>tip_msg.army_bjg){setMsg("小心, 您被进攻了!<br />")}tip_msg.army_bjg=B.num;break;case"3":tip_msg.army_zy=B.num;break;case"4":if(B.num>tip_msg.army_bzy){setMsg("有军队增援你了!")}tip_msg.army_bzy=B.num;break;case"7":if(B.num>tip_msg.army_hc){setMsg("您的军队已开始回城!")}tip_msg.army_hc=B.num;break;default:break}}try{var D=t.process(C,is_military_training);$("is_military_training_c").update(D)}catch(E){}C=null}}function militaryComplete(){set_city_resource.sendRequest();get_military_train.sendRequest();get_new_msg_num.sendRequest()}function updateReinforcementNum(){if(reinforcement.IB.length){Element.show($("reinforcement_c"));$("reinforcement_num").innerHTML=reinforcement.IB.length}else{Element.hide($("reinforcement_c"))}}function updateCityArmy(){if(true){try{if(1==city_army.IB[0].general_flag){city_army_length=city_army.IB.length-1}else{city_army_length=city_army.IB.length}}catch(C){city_army_length=city_army.IB.length-1}t=new Tpl();army_index=0;var A='{for b in IB}			{if b.general_flag == 1}				<li class="new_jiang"><img src="${I_P}/military/general_tag_${belong_country}.gif" border="0"  align="absmiddle" onclick="return   military_general_general_navi.jump(\'military|military_general_general|military_general\');" class="TS" title="本城将领"> <a href="" onclick="return   military_general_general_navi.jump(\'military|military_general_general|military_general\');">${b.general_name} (等级${b.general_rank})</a></li>			{else}				{if ++army_index%2}				<li class="new_bz"><div class="new_span"><img src="${I_P}/train/icon/${b.army_content}.gif" border="0"  title="${b.army_name}" class="TS" align="absmiddle" onclick="return   military_war_navi.jump(\'military|military_war|military_war_action\');"> ${b.army_num}</div>				{else}				<div class="new_span"><img src="${I_P}/train/icon/${b.army_content}.gif" border="0"  title="${b.army_name}" class="TS"  align="absmiddle" onclick="return   military_war_navi.jump(\'military|military_war|military_war_action\');"> ${b.army_num}</div></li>				{/if}				{if city_army_length==army_index && city_army_length%2}					</li>				{/if}			{/if}			<script>Element.show(\'city_army_c\');<\/script>		{forelse}		<script>Element.hide(\'city_army_c\');<\/script>		{/for}';if("undefined"!=typeof (mask)){mask.deEvent("city_army_c")}try{var B=t.process(A,city_army);while(1){if($("city_army").next()){$("city_army").next().remove()}else{break}}new Insertion.After("city_army",B)}catch(C){}mask.actions($("city_army_c"))}}function cityArmyComplete(){var A=this.clsName.split("_");$("need_time_"+A[1]).update("?")}var get_money=new DAjax("/modules/gateway.php",{option:{messageState:false,method:"get"},logic:{act:"get_money"}});

get_money.onComplete   = function()
{
	try
	{
		var m = 0;
		var g = 0;
		var r = 0;
		if ('undefined' == typeof(this.responseData.gold))
		{
			m = 0;
		}
		else
		{
			m = intVal(this.responseData.gold);
		}

		if ('undefined' == typeof(this.responseData.gift))
		{
			g = 0;
		}
		else
		{
			g = intVal(this.responseData.gift);
		}

		if ('undefined' == typeof(this.responseData.resource))
		{
			r = 0;
		}
		else
		{
			r = intVal(this.responseData.resource);
		}
		Element.show('main_money_c');
		$('main_money').update(m);
		$('gift_money').update(g);
		$('resource_money').update(r);
	}
	catch(e)
	{}
};

var get_user_general=new DAjax("/modules/gateway.php?module=soldier",{option:{messageState:false,method:"get"},logic:{act:"get_user_general"}});get_user_general.onComplete=function(){general_name=this.responseData.general_name};get_user_general.onNoneGet=function(){};var reply_nickname="";var reply_title="";var msg_user_write=new DAjax("/modules/gateway.php?module=msg",{option:{method:"get"},logic:{ajaxId:"msg_user_write",act:"msg_user_write",type:"e",cache:10000}});msg_user_write.onComplete=function(){$("other_nickname").value=reply_nickname;if(reply_title){$("msg_title").value="回复 "+reply_title}};var msg_user_receive=new DAjax("/modules/gateway.php?module=msg",{option:{method:"get"},logic:{ajaxId:"msg_user_receive",act:"msg_user_receive",type:"e",cache:10000}});msg_user_receive.onComplete=function(){$("msg_img").src=I_P+"/newsg/url_xh1.gif"};var msg_user_send=new DAjax("/modules/gateway.php?module=msg",{option:{method:"get"},logic:{ajaxId:"msg_user_send",act:"msg_user_send",type:"e",cache:10000}});msg_user_send.onComplete=function(){};var msg_user_sys=new DAjax("/modules/gateway.php?module=msg",{option:{method:"get"},logic:{ajaxId:"msg_user_sys",act:"msg_user_sys",type:"e",cache:10000}});msg_user_sys.onComplete=function(){};var logic={ajaxId:"writeMsg",act:"writeMsg",type:"o",cla:"Msg",operateType:"class"};var write_user_msg=new DAjax("/modules/gateway.php",{option:{formName:"msg_user_form",message:"发送信函..."},logic:logic});write_user_msg.onComplete=function(){reply_title="";var A=mask.showMsgBox("信函发送成功!",true);setTimeout("mask.removeById("+A+")",1000);msg_user_navi.jump("msg|msg_user|msg_user_send");if(12==current_task_id){check_task.sendRequest()}};write_user_msg.onNoneGet=function(){mask.showMsgBox(this.errorMessage,true);Element.show(this.obj)};function writeStart(A){if($F("msg_title").trim().length>20){Field.focus("msg_title");alert("标题最长为 20 字节");return false}if($F("msg_text").trim().length>1000){Field.focus("msg_text");alert("消息内容最长为 1000 字节");return false}if(!$F("other_nickname").trim()){Field.focus("other_nickname");M.m("请填写信函接收者");return false}else{if(!$F("msg_title").trim()){Field.focus("msg_title");M.m("请填写信函标题");return false}else{if(!$F("msg_text").trim()){Field.focus("msg_text");M.m("请填写信函内容");return false}else{}}}Element.hide(A);write_user_msg.sendRequest();write_user_msg.obj=A;return true}var logic={ajaxId:"writeMsg",act:"writeMsg",type:"o",cla:"Msg",operateType:"class"};var write_user_msg_pop=new DAjax("/modules/gateway.php",{option:{formName:"msg_user_form_p",method:"get",message:"发送信函..."},logic:logic});write_user_msg_pop.onComplete=function(){mask.remove();var A=mask.showMsgBox("信函发送成功!",true);setTimeout("mask.removeById("+A+")",1000);if(12==current_task_id){check_task.sendRequest()}};write_user_msg_pop.onNoneGet=function(){mask.showMsgBox(this.errorMessage,true);Element.show(this.obj)};function writeStartPop(A){if(!$F("other_nickname_p").trim()){Field.focus("other_nickname_p");M.m("请填写信函接收者");return false}else{if(!$F("msg_title_p").trim()){Field.focus("msg_title_p");M.m("请填写信函标题");return false}else{if(!$F("msg_text_p").trim()){Field.focus("msg_text_p");M.m("请填写信函内容");return false}}}Element.hide(A);write_user_msg_pop.sendRequest();write_user_msg_pop.obj=A;return true}function writeStartPopUi(A){reply_nickname=A;mask.loadInfo("/modules/msg/msg_user_write_pop.php",{});return false}var logic={ajaxId:"getNewMsgNum",act:"getNewMsgNum",type:"o",cla:"Msg",operateType:"class",cache:0};var get_new_msg_num=new DAjax("/modules/gateway.php",{option:{messageState:false},logic:logic});get_new_msg_num.onComplete=function(){if(intVal(this.responseData.msg_num)||intVal(this.responseData.union_msg_num)){$("msg_img").src=I_P+"/newsg/url_xh2.gif"}if(intVal(this.responseData.military_num)){$("military_img").src=I_P+"/newsg/url_jq2.gif"}};var logic={ajaxId:"user_msg_data",act:"getUserMsg",type:"o",cla:"Msg",operateType:"class",cache:0};var msg_receive_list=new DAjax("/modules/gateway.php",{option:{message:"接收信函...",page:{func:"msg_receive_list",handle:"getReceiveMsg"}},logic:logic});msg_receive_list.onComplete=function(){try{var B=new Tpl();var C='			<tr class="b">				<td width="60">选 择</td>				<td width="330">主 题</td>				<td width="207">发信人</td>				<td width="130">日 期</td>			</tr>					{for p in data}	 			<tr>				<td><input name="msg_id[]" type="checkbox" value="${p.msg_id}" /></td>				<td><a href="/modules/msg/show_msg_details.php?msg_id=${p.msg_id}" class="O">{if p.msg_read!="1"}<span id="${p.msg_id}_t"  style="font-weight:bold;">${p.msg_title}</span>{else}${p.msg_title}{/if}</a>{if p.msg_read!="1"}<span id="${p.msg_id}_n"  style="font-weight:bold;"> ( 新 ) </span>{else}{/if}</td>				<td>{if p.other_user_id==\'0\'}${p.other_nickname}{else}<a href="" onclick="return panel_user(\'${p.other_nickname}\')">${p.other_nickname}</a>{/if}</td>				<td>${p.msg_time}</td>			</tr>		{forelse}			<tr><td colspan="4">无消息!</td></tr>		{/for}';$("msg_receive_list").update(B.process(C,{data:this.responseData}));var A=this.responseRows;if(A){$("msg_receive_list_nav").update(this.page.prompt(A))}mask.actions("msg_receive_list")}catch(D){}};msg_receive_list.onNoneGet=function(){};var logic={ajaxId:"user_msg_data",act:"getUserMsg",type:"o",cla:"Msg",operateType:"class",cache:0};var msg_send_list=new DAjax("/modules/gateway.php",{option:{message:"接收信函...",page:{func:"msg_send_list",handle:"getSendMsg"}},logic:logic});msg_send_list.onComplete=function(){try{var B=new Tpl();var C='			<tr class="b">				<td width="80">选 择</td>				<td width="367">主 题</td>				<td width="150">收信人</td>				<td width="130">日 期</td>			</tr>					{for p in data}	 			<tr>				<td><input name="msg_id[]" type="checkbox" value="${p.msg_id}" /></td>				<td><a href="/modules/msg/show_msg_details.php?msg_id=${p.msg_id}&msg_type=1" class="O">{if p.msg_read!="1"}<b>${p.msg_title}</b>{else}${p.msg_title}{/if}</a></td>				<td><a href="" onclick="return panel_user(\'${p.other_nickname}\')">${p.other_nickname}</a></td>				<td>${p.msg_time}</td>			</tr>		{forelse}			<tr><td colspan="4">无消息!</td></tr>		{/for}';$("msg_send_list").update(B.process(C,{data:this.responseData}));var A=this.responseRows;if(A){$("msg_send_list_nav").update(this.page.prompt(A))}mask.actions("msg_send_list")}catch(D){}};msg_send_list.onNoneGet=function(){};var logic={ajaxId:"user_msg_data",act:"getSysMsg",type:"o",cla:"Msg",operateType:"class",cache:0};var msg_sys_list=new DAjax("/modules/gateway.php",{option:{message:"接收信函...",page:{func:"msg_sys_list",handle:"getSysMsg"}},logic:logic});msg_sys_list.onComplete=function(){try{var B=new Tpl();var C='				<table id="player_rank_t" width="727" border="0" cellspacing="0" cellpadding="0" class="new_table">					<tr class="b">						<td width="390">主题</td>						<td width="207">发信人</td>						<td width="130">日 期</td>					</tr>					{for p in data}	 					<tr onmouseover="this.className=\'e\'" onmouseout="this.className=\'\'">						<td><a href="/modules/msg/show_msg_details.php?msg_id=${p.msg_id}&msg_type=1&sys_msg=1" class="O">{if readCookie("tmp_msg_time")<p.msg_time}<span id="${p.msg_id}_t"  style="font-weight:bold;">${p.msg_title}</span>{else}${p.msg_title}{/if}</a>{if readCookie("tmp_msg_time")<p.msg_time}<span id="${p.msg_id}_n"  style="font-weight:bold;"> ( 新 ) </span>{else}{/if}</a></td>						<td>${p.other_nickname}</td>						<td>${p.msg_time}</td>					</tr>					{forelse}					<tr onmouseover="this.className=\'e\'" onmouseout="this.className=\'\'">						<td colspan="3">无消息!</td>					</tr>					{/for}				</table>';$("msg_sys_list").update(B.process(C,{data:this.responseData}));var A=this.responseRows;if(A){$("msg_sys_list_nav").update(this.page.prompt(A))}mask.actions("msg_sys_list")}catch(D){}};msg_sys_list.onNoneGet=function(){};function selectMsgAll(C,B){var A=$(C).getElementsByTagName("input");A=$A(A);A.each(function(D){D.checked=B})}function getReceiveMsg(B,A){B=intVal(B);A=intVal(A);msg_receive_list.page.line=50;msg_receive_list.page.pageNo=B;msg_receive_list.page.start=A;var C=intVal(B*msg_receive_list.page.line+A);msg_receive_list.queryData.offset=C;msg_receive_list.queryData.line=intVal(msg_receive_list.page.line);msg_receive_list.sendRequest();return false}function getSendMsg(B,A){B=intVal(B);A=intVal(A);msg_send_list.page.line=50;msg_send_list.page.pageNo=B;msg_send_list.page.start=A;var C=intVal(B*msg_send_list.page.line+A);msg_send_list.queryData.offset=C;msg_send_list.queryData.line=intVal(msg_send_list.page.line);msg_send_list.queryData.msg_type=1;msg_send_list.sendRequest();return false}function getSysMsg(B,A){B=intVal(B);A=intVal(A);msg_sys_list.page.line=4;msg_sys_list.page.pageNo=B;msg_sys_list.page.start=A;var C=intVal(B*msg_sys_list.page.line+A);msg_sys_list.queryData.offset=C;msg_sys_list.queryData.line=intVal(msg_sys_list.page.line);msg_sys_list.sendRequest();return false}var logic={ajaxId:"deleteMsg",act:"deleteMsg",type:"o",cla:"Msg",operateType:"class"};var deleteMsg=new DAjax("/modules/gateway.php",{option:{message:"丢弃信函..."},logic:logic});deleteMsg.onComplete=function(){var i=mask.showMsgBox("丢弃信函成功!",true);setTimeout("mask.removeById("+i+")",1000);eval(currentTabId+".sendRequest();")};deleteMsg.onNoneGet=function(){mask.showMsgBox(this.errorMessage,true)};function deleteMsgStart(A){if(confirm("确认丢弃信函?")){deleteMsg.option.formName=A;deleteMsg.sendRequest();return false}}function show_report(A,B){msg_military_navi.jump("msg|msg_military|msg_military_attack");setTimeout("military_view('msg_military_attack', '"+A+"', '"+B+"')",100);return false}Event.observe(window,"load",initRank,false);function initRank(){["rank_top_player","rank_top_city","rank_top_alliance","rank_top_general","rank_top_attack","rank_top_defense","rank_top_oriflamme"].each(function(i){eval("window."+i+' = new  DAjax("/modules/gateway.php?module=rank", {option:{method:"get"},  logic:{ajaxId:"'+i+'", act:"'+i+'",  type:"e", cache:0}});')})}var logic={ajaxId:"player_rank",act:"player_rank",cache:0};var player_rank=new DAjax("/modules/gateway.php?module=rank",{option:{page:{func:"player_rank",handle:"getPlayerRank"}},logic:logic});player_rank.onComplete=function(){player_rank_offset=this.queryData.offset;try{var B=new Tpl();var C='<div class="new_table_bg fl" id="player_rank_t"><div class="new_table_bottom fl"><table width="727" border="0" cellspacing="0" cellpadding="0" class="new_table"><tr class="b"><td width="65">排名</td><td width="132">玩家昵称</td>	<td width="75">总居民数</td><td width="71">总城池数</td><td width="44">国度</td><td width="133">所属联盟</td><td width="147">注册时间</td></tr>{for p in data}{if  $F("u_player_rank")==p.order_id}<tr class="d">{else}<tr onmouseover="this.className=\'e\'" onmouseout="this.className=\'\'">{/if}<td>${p.order_id}</td><td><a href="" onclick="return panel_user(\'${p.nickname}\')">${p.nickname}</a></td><td>${p.population}</td><td>${p.city_num}</td><td>{if p.belong_country==1}魏{elseif p.belong_country==2}蜀{else}吴{/if}</td><td><a href=""  onclick="return panel_union(\'${p.union_name}\')">${p.union_name} &nbsp;</a></td><td>${p.reg_time}</td></tr>{forelse}<tr><td colspan="7">无玩家排行</td></tr>{/for}</table></div></div>';if($("player_rank_t")){$("player_rank_t").remove()}new Insertion.Before($("player_rank_nav"),B.process(C,{data:this.responseData}));var A=this.responseRows;if(A){$("player_rank_nav").update(this.page.prompt(A))}}catch(D){}if(!general_name){get_user_general.sendRequest()}if(readCookie("union_id")&&!union_name){get_user_union_name.sendRequest()}};player_rank.onNoneGet=function(){};function getPlayerRank(B,A){B=intVal(B);A=intVal(A);player_rank.page.line=20;player_rank.page.pageNo=B;player_rank.page.start=A;var C=intVal(B*player_rank.page.line+A);player_rank.queryData.offset=C;player_rank.queryData.line=intVal(player_rank.page.line);player_rank.queryData.msg_type=1;if(player_rank.responseRows){}player_rank.sendRequest();return false}window.uGetPlayerRank=function(){var C=0;var D=0;if($("u_player_rank")&&$("u_player_rank").value){C=intVal($("u_player_rank").value);if(C){C-=1}D=intVal(C/player_rank.page.line);var A=(D%player_rank.page.pageLine);var B=player_rank.page.pageLine*player_rank.page.line*(intVal(D/player_rank.page.pageLine));player_rank.page.execHandle(A,B,"")}else{if($("u_player_nickname").value){getURank("palyerRankByNickname","u_player_nickname")}}};var logic={ajaxId:"city_rank",act:"city_rank",cache:0};var city_rank=new DAjax("/modules/gateway.php?module=rank",{option:{page:{func:"city_rank",handle:"getCityRank"}},logic:logic});city_rank.onComplete=function(){city_rank_offset=this.queryData.offset;try{var B=new Tpl();var C='<div class="new_table_bg fl" id="city_rank_t"><div class="new_table_bottom fl"><table width="727" border="0" cellspacing="0" cellpadding="0" class="new_table">								  <tr class="b">									<td width="65">排名</td>									<td width="150">城池名称</td>									<td width="75">居民数</td>									<td width="71">所属国度</td>									<td width="145">所属玩家</td>									<td width="74">坐标</td>									<td width="147">建立时间</td>								  </tr>		{for p in data}			{if $F("u_city_rank")==p.order_id}								<tr  class="d">			{else}								<tr onmouseover="this.className=\'e\'" onmouseout="this.className=\'\'">			{/if}								<td>${p.order_id}</td>								<td><a href="" onclick="return panel_user(\'${p.nickname}\')">${p.city_name}</a></td>								<td>${p.population}</td>								<td>{if p.belong_country==1}魏{elseif p.belong_country==2}蜀{else}吴{/if}</td>								<td><a href="" onclick="return panel_user(\'${p.nickname}\')">${p.nickname}</a></td>								<td>${p.coord.x}|${p.coord.y}</td>								<td>${p.reg_time}</td>							  </tr>		{forelse}							<tr><td colspan="7">无玩家排行</td></tr>		{/for}							</table></div></div>			';if($("city_rank_t")){$("city_rank_t").remove()}new Insertion.Before($("city_rank_nav"),B.process(C,{data:this.responseData}));var A=this.responseRows;if(A){$("city_rank_nav").update(this.page.prompt(A))}}catch(D){}};city_rank.onNoneGet=function(){};function getCityRank(B,A){B=intVal(B);A=intVal(A);city_rank.page.line=20;city_rank.page.pageNo=B;city_rank.page.start=A;var C=intVal(B*city_rank.page.line+A);city_rank.queryData.offset=C;city_rank.queryData.line=intVal(city_rank.page.line);city_rank.queryData.msg_type=1;if(city_rank.responseRows){}city_rank.sendRequest();return false}window.uGetCityRank=function(){var C=0;var D=0;if($("u_city_rank")&&$("u_city_rank").value){C=intVal($("u_city_rank").value);if(C){C-=1;D=intVal(C/city_rank.page.line)}else{D=intVal(C/city_rank.page.line)}var A=(D%city_rank.page.pageLine);var B=city_rank.page.pageLine*city_rank.page.line*(intVal(D/city_rank.page.pageLine));city_rank.page.execHandle(A,B,"")}else{if($("u_city_nickname").value){getURank("cityRankByNickname","u_city_nickname")}}};var logic={ajaxId:"union_rank",act:"union_rank",cache:0};var union_rank=new DAjax("/modules/gateway.php?module=rank",{option:{page:{func:"union_rank",handle:"getUnionRank"}},logic:logic});union_rank.onComplete=function(){union_rank_offset=this.queryData.offset;try{var B=new Tpl();var C='								<div class="new_table_bg fl" id="union_rank_t"><div class="new_table_bottom fl"><table width="727" border="0" cellspacing="0" cellpadding="0" class="new_table">								  <tr class="b">										<td width="65">排名</td>										<td width="130">联盟名称</td>										<td width="65">总居民数</td>										<td width="61">总城池数</td>										<td width="65">成员数</td>										<td width="64">平均居民数</td>										<td width="130">创始人</td>										<td width="147">建立时间</td>								  </tr>		{for p in data}			{if $F("u_union_rank")==p.order_id}								<tr  class="d">			{else}								<tr onmouseover="this.className=\'e\'" onmouseout="this.className=\'\'">			{/if}								<td>${p.order_id}</td>								<td><a href=""  onclick="return panel_union(\'${p.union_name}\')">${p.union_name}</a></td>								<td>${p.population}</td>								<td>${p.city_num}</td>								<td>${p.member_num}</td>								<td>${intVal(p.ave_population)}</td>								<td><a href="" onclick="return panel_user(\'${p.nickname}\')">${p.nickname}</a></td>								<td>${p.union_time}</td>							  </tr>		{forelse}							<tr><td colspan="8">无玩家排行</td></tr>		{/for}							</table></div></div>			';if($("union_rank_t")){$("union_rank_t").remove()}new Insertion.Before($("union_rank_nav"),B.process(C,{data:this.responseData}));var A=this.responseRows;if(A){$("union_rank_nav").update(this.page.prompt(A))}}catch(D){}};union_rank.onNoneGet=function(){};function getUnionRank(B,A){B=intVal(B);A=intVal(A);union_rank.page.line=20;union_rank.page.pageNo=B;union_rank.page.start=A;var C=intVal(B*union_rank.page.line+A);union_rank.queryData.offset=C;union_rank.queryData.line=intVal(union_rank.page.line);union_rank.queryData.msg_type=1;if(union_rank.responseRows){}union_rank.sendRequest();return false}window.uGetUnionRank=function(){var C=0;var D=0;if($("u_union_rank")&&intVal($("u_union_rank").value)){C=intVal($("u_union_rank").value);if(C){C-=1}D=intVal(C/union_rank.page.line);var A=(D%union_rank.page.pageLine);var B=union_rank.page.pageLine*union_rank.page.line*(intVal(D/union_rank.page.pageLine));union_rank.page.execHandle(A,B,"")}else{if($("u_union_nickname").value){getURank("unionRankByNickname","u_union_nickname")}}};var logic={ajaxId:"general_rank",act:"general_rank",cache:0};var general_rank=new DAjax("/modules/gateway.php?module=rank",{option:{page:{func:"general_rank",handle:"getGeneralRank"}},logic:logic});general_rank.onComplete=function(){general_rank_offset=this.queryData.offset;try{var B=new Tpl();var C='<div class="new_table_bg fl" id="general_rank_t"><div class="new_table_bottom fl"><table width="727" border="0" cellspacing="0" cellpadding="0" class="new_table">								  <tr class="b">										<td width="65">排名</td>										<td width="139">将领名称</td>										<td width="115">等级</td>										<td width="101">官职</td>										<td width="115">军衔</td>										<td width="100">称号</td>										<td width="67">所属国度</td>										<td width="140">所属玩家</td>								  </tr>		{for p in data}			{if $F("u_general_rank")==p.order_id}								<tr  class="d">			{else}								<tr onmouseover="this.className=\'e\'" onmouseout="this.className=\'\'">			{/if}								<td>${p.order_id}</td>								<td><a href=\'javascript:void(0)\'  onclick=\'mask.loadInfo("/modules/item/show_general_zb.php?nickname=${encodeURIComponent(p.nickname)}")\'>${p.general_name}</a></td>								<td>${p.general_level}</td>								<td>${p.general_official}</td>								<td>${p.civilian_official}</td>								<td>${p.general_alias}</td>								<td>{if p.belong_country==1}魏{elseif p.belong_country==2}蜀{else}吴{/if}</td>								<td><a href="" onclick="return panel_user(\'${p.nickname}\')">${p.nickname}</a></td>							  </tr>		{forelse}							<tr><td colspan="8">无将领排行</td></tr>		{/for}							</table></div></div>			';if($("general_rank_t")){$("general_rank_t").remove()}new Insertion.Before($("general_rank_nav"),B.process(C,{data:this.responseData}));var A=this.responseRows;if(A){$("general_rank_nav").update(this.page.prompt(A))}}catch(D){}};general_rank.onNoneGet=function(){};function getGeneralRank(B,A){B=intVal(B);A=intVal(A);general_rank.page.line=20;general_rank.page.pageNo=B;general_rank.page.start=A;var C=intVal(B*general_rank.page.line+A);general_rank.queryData.offset=C;general_rank.queryData.line=intVal(general_rank.page.line);general_rank.queryData.msg_type=1;if(general_rank.responseRows){}general_rank.sendRequest();return false}window.uGetGeneralRank=function(){var C=0;var D=0;if($("u_general_rank")&&intVal($("u_general_rank").value)){C=intVal($("u_general_rank").value);if(C){C-=1}D=intVal(C/general_rank.page.line);var A=(D%general_rank.page.pageLine);var B=general_rank.page.pageLine*general_rank.page.line*(intVal(D/general_rank.page.pageLine));general_rank.page.execHandle(A,B,"")}else{if($("u_general_nickname").value){getURank("generalRankByNickname","u_general_nickname")}}};var logic={ajaxId:"attack_rank",act:"attack_rank",cache:0};var attack_rank=new DAjax("/modules/gateway.php?module=rank",{option:{page:{func:"attack_rank",handle:"getAttackRank"}},logic:logic});attack_rank.onComplete=function(){attack_rank_offset=this.queryData.offset;try{var B=new Tpl();var C='<div class="new_table_bg fl" id="attack_rank_t"><div class="new_table_bottom fl"><table width="727" border="0" cellspacing="0" cellpadding="0" class="new_table">								<tr class="b">									<td width="65">排名</td>									<td width="152">玩家昵称</td>									<td width="95">进攻评价</td>									<td width="91">总居民数</td>									<td width="82">总城池数</td>									<td width="95">所属国度</td>									<td width="147">注册时间</td>								</tr>		{for p in data}			{if  $F("u_attack_rank")==p.order_id}								<tr  class="d">			{else}								<tr onmouseover="this.className=\'e\'" onmouseout="this.className=\'\'">			{/if}								<td>${p.order_id}</td>								<td><a href="" onclick="return panel_user(\'${p.nickname}\')">${p.nickname}</a></td>								<td>${p.attack}</td>								<td>${p.population}</td>								<td>${p.city_num}</td>								<td>{if p.belong_country==1}魏{elseif p.belong_country==2}蜀{else}吴{/if}</td>								<td>${p.reg_time}</td>							  </tr>		{forelse}							<tr><td colspan="7">无进攻排行</td></tr>		{/for}							</table></div></div>			';if($("attack_rank_t")){$("attack_rank_t").remove()}new Insertion.Before($("attack_rank_nav"),B.process(C,{data:this.responseData}));var A=this.responseRows;if(A){$("attack_rank_nav").update(this.page.prompt(A))}}catch(D){}};attack_rank.onNoneGet=function(){};function getAttackRank(B,A){B=intVal(B);A=intVal(A);attack_rank.page.line=20;attack_rank.page.pageNo=B;attack_rank.page.start=A;var C=intVal(B*attack_rank.page.line+A);attack_rank.queryData.offset=C;attack_rank.queryData.line=intVal(attack_rank.page.line);attack_rank.queryData.msg_type=1;if(attack_rank.responseRows){}attack_rank.sendRequest();return false}window.uGetAttackRank=function(){var C=0;var D=0;if($("u_attack_rank")&&intVal($("u_attack_rank").value)){C=intVal($("u_attack_rank").value);if(C){C-=1}D=intVal(C/attack_rank.page.line);var A=(D%attack_rank.page.pageLine);var B=attack_rank.page.pageLine*attack_rank.page.line*(intVal(D/attack_rank.page.pageLine));attack_rank.page.execHandle(A,B,"")}else{if($("u_attack_nickname").value){getURank("attackRankByNickname","u_attack_nickname")}}};var logic={ajaxId:"defense_rank",act:"defense_rank",cache:0};var defense_rank=new DAjax("/modules/gateway.php?module=rank",{option:{page:{func:"defense_rank",handle:"getDefenseRank"}},logic:logic});defense_rank.onComplete=function(){defense_rank_offset=this.queryData.offset;try{var B=new Tpl();var C='							<div class="new_table_bg fl" id="defense_rank_t"><div class="new_table_bottom fl"><table width="727" border="0" cellspacing="0" cellpadding="0" class="new_table">								<tr class="b">									<td width="65">排名</td>									<td width="152">玩家昵称</td>									<td width="95">防御评价</td>									<td width="91">总居民数</td>									<td width="82">总城池数</td>									<td width="95">所属国度</td>									<td width="147">注册时间</td>								</tr>		{for p in data}			{if  $F("u_defense_rank")==p.order_id}								<tr  class="d">			{else}								<tr onmouseover="this.className=\'e\'" onmouseout="this.className=\'\'">			{/if}								<td>${p.order_id}</td>								<td><a href="" onclick="return panel_user(\'${p.nickname}\')">${p.nickname}</a></td>								<td>${p.defense}</td>								<td>${p.population}</td>								<td>${p.city_num}</td>								<td>{if p.belong_country==1}魏{elseif p.belong_country==2}蜀{else}吴{/if}</td>								<td>${p.reg_time}</td>							  </tr>		{forelse}							<tr><td colspan="7">无防御排行</td></tr>		{/for}							</table></div></div>			';if($("defense_rank_t")){$("defense_rank_t").remove()}new Insertion.Before($("defense_rank_nav"),B.process(C,{data:this.responseData}));var A=this.responseRows;if(A){$("defense_rank_nav").update(this.page.prompt(A))}}catch(D){}};defense_rank.onNoneGet=function(){};function getDefenseRank(B,A){B=intVal(B);A=intVal(A);defense_rank.page.line=20;defense_rank.page.pageNo=B;defense_rank.page.start=A;var C=intVal(B*defense_rank.page.line+A);defense_rank.queryData.offset=C;defense_rank.queryData.line=intVal(defense_rank.page.line);defense_rank.queryData.msg_type=1;if(defense_rank.responseRows){}defense_rank.sendRequest();return false}window.uGetDefenseRank=function(){var C=0;var D=0;if($("u_defense_rank")&&intVal($("u_defense_rank").value)){C=intVal($("u_defense_rank").value);if(C){C-=1}D=intVal(C/defense_rank.page.line);var A=(D%defense_rank.page.pageLine);var B=defense_rank.page.pageLine*defense_rank.page.line*(intVal(D/defense_rank.page.pageLine));defense_rank.page.execHandle(A,B,"")}else{if($("u_defense_nickname").value){getURank("defenseRankByNickname","u_defense_nickname")}}};var logic={ajaxId:"oriflamme_rank",act:"oriflamme_rank",cache:0};var oriflamme_rank=new DAjax("/modules/gateway.php?module=rank",{option:{page:{func:"oriflamme_rank",handle:"getOriflammeRank"}},logic:logic});oriflamme_rank.onComplete=function(){oriflamme_rank_offset=this.queryData.offset;try{var B=new Tpl();var C='<div class="new_table_bg fl" id="oriflamme_rank_t"><div class="new_table_bottom fl"><table width="727" border="0" cellspacing="0" cellpadding="0" class="new_table">								  <tr class="b">									<td width="65">排名</td>									<td width="150">城池名称</td>									<td width="75">居民数</td>									<td width="71">所属国度</td>									<td width="145">所属玩家</td>									<td width="74">坐标</td>									<td width="147">军旗数</td>								  </tr>		{for p in data}			{if $F("u_oriflamme_rank")==p.order_id}								<tr  class="d">			{else}								<tr onmouseover="this.className=\'e\'" onmouseout="this.className=\'\'">			{/if}								<td>${p.order_id}</td>								<td><a href="" onclick="return panel_user(\'${p.nickname}\')">${p.city_name}</a></td>								<td>${p.population}</td>								<td>{if p.belong_country==1}魏{elseif p.belong_country==2}蜀{else}吴{/if}</td>								<td><a href="" onclick="return panel_user(\'${p.nickname}\')">${p.nickname}</a></td>								<td>${p.coord.x}|${p.coord.y}</td>								<td>${p.oriflamme}</td>							  </tr>		{forelse}							<tr><td colspan="7">无军旗排行</td></tr>		{/for}							</table></div></div>			';if($("oriflamme_rank_t")){$("oriflamme_rank_t").remove()}new Insertion.Before($("oriflamme_rank_nav"),B.process(C,{data:this.responseData}));var A=this.responseRows;if(A){$("oriflamme_rank_nav").update(this.page.prompt(A))}}catch(D){}};oriflamme_rank.onNoneGet=function(){};function getOriflammeRank(B,A){B=intVal(B);A=intVal(A);oriflamme_rank.page.line=20;oriflamme_rank.page.pageNo=B;oriflamme_rank.page.start=A;var C=intVal(B*oriflamme_rank.page.line+A);oriflamme_rank.queryData.offset=C;oriflamme_rank.queryData.line=intVal(oriflamme_rank.page.line);oriflamme_rank.queryData.msg_type=1;if(oriflamme_rank.responseRows){}oriflamme_rank.sendRequest();return false}window.uGetOriflammeRank=function(){var C=0;var D=0;if($("u_oriflamme_rank")&&intVal($("u_oriflamme_rank").value)){C=intVal($("u_oriflamme_rank").value);if(C){C-=1}D=intVal(C/oriflamme_rank.page.line);var A=(D%oriflamme_rank.page.pageLine);var B=oriflamme_rank.page.pageLine*oriflamme_rank.page.line*(intVal(D/oriflamme_rank.page.pageLine));oriflamme_rank.page.execHandle(A,B,"")}else{if($("u_oriflamme_nickname").value){getURank("oriflamme_rank_by_nickname","u_oriflamme_nickname")}}};var logic={act:"u_rank",cache:1};var u_rank=new DAjax("/modules/gateway.php?module=rank",{logic:logic});var u_index={palyerRankByNickname:"u_player_rank|uGetPlayerRank",cityRankByNickname:"u_city_rank|uGetCityRank",unionRankByNickname:"u_union_rank|uGetUnionRank",attackRankByNickname:"u_attack_rank|uGetAttackRank",defenseRankByNickname:"u_defense_rank|uGetDefenseRank",generalRankByNickname:"u_general_rank|uGetGeneralRank",oriflamme_rank_by_nickname:"u_oriflamme_rank|uGetOriflammeRank"};u_rank.onComplete=function(){var num=this.responseData.num;var f=u_index[u_rank.queryData.u_type].split("|");if(num){try{$(f[0]).value=num;eval(f[1]+"();")}catch(e){}}};u_rank.onNoneGet=function(){var f=u_index[u_rank.queryData.u_type].split("|");try{$(f[0]).value=1;$(u_rank.queryData.search_name).value="";eval(f[1]+"();")}catch(e){}};function getURank(B,A){u_rank.queryData.u_type=B;u_rank.queryData.search_name=A;u_rank.queryData.nickname=$(A).value;u_rank.sendRequest();return false}var get_user_union_name=new DAjax("/modules/gateway.php?module=rank",{option:{messageState:false,method:"get"},logic:{act:"get_user_union_name"}});get_user_union_name.onComplete=function(){union_name=this.responseData.union_name};var current_task_id=1;function showTask(){mask.loadInfo("/modules/gateway.php?module=task",{option:{method:"get",lbType:"o"},logic:{act:"get_task_container",type:"e",cache:0}})}var get_task=new DAjax("/modules/gateway.php?module=task",{option:{method:"get"},logic:{act:"get_task",type:"e"}});get_task.onComplete=function(){};get_task.onNoneGet=function(){alert(this.errorMessage)};function getTask(A,B){get_task.eTarget="task_level_"+B;get_task.queryData.task_id=A;get_task.queryData.task_level=B;get_task.sendRequest()}var check_task=new DAjax("/modules/gateway.php?module=task",{option:{method:"get"},logic:{act:"check_task"}});check_task.onComplete=function(){if("undefined"!=typeof (this.responseData.task_id)){current_task_id=this.responseData.task_id;if(this.responseData.task_id<21){showTask()}}};check_task.onNoneGet=function(){};function setChoice(B){if(B){var F=$$(".task_c_id");var C="";var A="";var E="";var D=[];for(i=0;i<F.length;i++){D[i]=[]}F.each(function(J,H){E=document.getElementsByName("choice_"+J.value+"[]");var I=1;for(i=0;i<E.length;i++){if(E[i].checked){if(!intVal(E[i].value)){I=0;break}}else{if(intVal(E[i].value)){I=0;break}}}D[H]=I});set_choice.queryData.t_id=$("t_id").value;set_choice.queryData.choice=Object.toJSON(D)}else{var F=$$(".task_c_id");var C="";var A="";var E="";var D=[];for(i=0;i<F.length;i++){D[i]=0}F.each(function(I,H){E=document.getElementsByName("choice_"+I.value);for(i=0;i<E.length;i++){if(E[i].checked){D[H]=E[i].value}}});set_choice.queryData.t_id=$("t_id").value;set_choice.queryData.choice=Object.toJSON(D)}set_choice.sendRequest()}var set_choice=new DAjax("/modules/gateway.php?module=task",{option:{method:"get"},logic:{act:"set_choice",type:"e"}});set_choice.onComplete=function(){showTask()};set_choice.onNoneGet=function(){};var imagepath="http://www.50sg.com/favicon.ico";var imagewidth=201;var imageheight=116;var speed=0;var imageclick="close";var isie=0;var startani=null;if(window.navigator.appName=="Microsoft Internet Explorer"&&window.navigator.appVersion.substring(window.navigator.appVersion.indexOf("MSIE")+5,window.navigator.appVersion.indexOf("MSIE")+8)>=5.5){isie=1}else{isie=0}if(isie){var preloadit=new Image();preloadit.src=imagepath}function pop(){if(isie){x=x-dx;y=y-dy;oPopup.show(x,y,imagewidth,imageheight);startani=setTimeout("pop();",50)}}function dismisspopup(){clearTimeout(startani);oPopup.hide()}function minsize(){imageheight=20;var A=oPopup.document.getElementById("scroll_box");A.innerHTML='<marquee id="scroll_box" style="width:140px" scrollamount="3">6级农田升级完成 粮食产量为100 耗时 1:09:00</marquee>'}function maxsize(){imageheight=116;var A=oPopup.document.getElementById("scroll_box");A.innerHTML="武林三国小闹钟"}if(isie&&(request("tmp_c") || readCookie("tmp_c"))){var x=screen.width,y=screen.height,dx=speed,dy=speed;var oPopup=window.createPopup();var oPopupBody=oPopup.document.body;oPopupBody.innerHTML='<div style="width:199px; border:#737173 1px solid; font-size: 12px;"><div style="width:199px; height:23px; background:url('+I_P+'msg/bg1.jpg) no-repeat;"><span id="scroll_box" style="float:left; padding-left:5px; line-height:23px; color:#434343;"></span><span id="f_div" style="float:right; padding-right:5px;"><!--a href="javascript:;" id="minsize"><img src="'+I_P+'msg/min.gif" border=0 /></a><a href="javascript:;" id="maxsize"><img src="'+I_P+'msg/max.gif" border=0 /></a--><a href="javascript:;" id="close"><img src="'+I_P+'msg/close.gif" border=0 /></a></span></div><div  onclick="parent.document.getElementById(\'ButtonOK\').click();parent.dismisspopup();" style="width:199px; height:91px; background:url('+I_P+'msg/bg2.jpg) no-repeat;"><div style="padding-left:70px; line-height:16px; padding-top:10px;" id="pop_msg_c">关闭为最小化到托盘!<br /> 会提示军事信息<br /> 会提示信函信息<br /></div><div style=" padding-left:140px; padding-top:17px; color:#008ae7;">晨路互动</div></div></div><!--embed  src="'+I_P+'msg/pop.wma" autostart="true" loop="false" width="0" height="0" -->';var o=oPopup.document.getElementById("f_div");for(i=0;i<o.childNodes.length;i++){if(o.childNodes[i].id=="minsize"){}if(o.childNodes[i].id=="maxsize"){}if(o.childNodes[i].id=="close"){o.childNodes[i].style.cursor="hand";o.childNodes[i].onclick=dismisspopup}}var scrollbox=oPopup.document.getElementById("scroll_box");scrollbox.innerHTML="武林三国";showPop()}function showPop(){if(isie){if((request("tmp_c") || readCookie("tmp_c"))){oPopup.show(x,y,imagewidth,imageheight)}else{}}}function checkClientUpdate(){if(isie&&(request("tmp_c") || readCookie("tmp_c"))&&(request("tmp_v") || readCookie("tmp_v"))){if(client_version>(request("tmp_v") || readCookie("tmp_v"))){try{document.getElementById("ButtonUpdate").click()}catch(A){}}}};





//出兵据点
var start_soldiers_fortress = new DAjax("/modules/military/military_war_action_event.php", {option:{formName:"nameFortressArmyFrom",  messageState:false, message:""},logic:{act:"start_soldiers_check",  type:"e"}});
start_soldiers_fortress.onComplete   = function()
{
	mask.processInfo(this.responseData);
}


function send_fortress_army_form()
{
	start_soldiers_fortress.queryData['action'] = 'send_fortress_army_action';
	start_soldiers_fortress.sendRequest();
}

//本城军队
var armyCityAction = new DAjax("/modules/military/military_war_action.php", {logic:{act:"military_war_action",  type:"e"}});
armyCityAction.onComplete   = function()
{
	mask.processInfo(this.responseData);
}
function ArmyCityAction(pid,action,armytype)
{
	armyCityAction.queryData['mid'] = pid;
	armyCityAction.queryData['action'] = action;
	armyCityAction.queryData['armytype'] = armytype;
	armyCityAction.sendRequest();
}
var army_back_fortress = new DAjax("/modules/military/military_war_action.php", {option:{formName:"nameFortressByBackFrom",  messageState:false, message:""},logic:{act:"army_back_fortress",  type:"e"}});
army_back_fortress.onComplete   = function()
{
	set_city_resource.sendRequest();
	mask.processInfo(this.responseData);
}
function army_back_fortress_action(armytype)
{
	army_back_fortress.queryData['action'] = 'fortress_back_insert';
	army_back_fortress.queryData['armytype'] = armytype;
	army_back_fortress.sendRequest();
}

function army_back_team_action(armytype)
{
	army_back_fortress.queryData['action'] = 'team_back_insert';
	army_back_fortress.queryData['armytype'] = armytype;
	army_back_fortress.sendRequest();
}

function confirmArmybackCityByUser(nickname)
{
	if (confirm("你确定要回派 "+nickname+" 的所有军队么？")) {
		all_army_backexe_city.queryData['nickname'] = nickname;
		all_army_backexe_city.queryData['action'] = 'army_back_by_user';
		all_army_backexe_city.sendRequest();
	}

}

var cityHelpAction = new DAjax("/modules/military/city_help.php",{logic:{action:"setting",type:"e"}});
cityHelpAction.onComplete   = function()
{
	mask.remove();
	mask.processInfo(this.responseData);
}
function cityHelpSetting()
{
	var objCityHelpStatus = document.getElementsByName("city_help_status");
	for(i=0;i<objCityHelpStatus.length;i++)
	{
		if(objCityHelpStatus[i].checked == true)
		{
			city_help_status_value = objCityHelpStatus[i].value;
		}
	}
	cityHelpAction.queryData['city_help_status'] = city_help_status_value;
	cityHelpAction.sendRequest();
}
//兵种转换
changeAction = new DAjax("/modules/military/soldier_change.php",{logic:{action:"change",type:"e"}});
changeAction.onComplete = function()
{
	mask.remove();
	mask.processInfo(this.responseData);
	military_war_navi.jump('military|military_war|military_war_action');
	queueInit();
	set_city_resource.sendRequest();
	get_money.sendRequest();
}
var SoldiersChange = {
	perNum:100,//点击一次增加数目
	getChangeTypeId:function()
	{
	    var change_type_id;
		var objChangeTypeId = document.getElementsByName("change_type_id");
		for(i=0;i<objChangeTypeId.length;i++)
		{
			if(objChangeTypeId[i].checked==true)
			{
				change_type_id = objChangeTypeId[i].value;
				break;
			}
		}
		return change_type_id;
	},
	changeSoldiersId:function(sid)
	{
		var objSoldiersNum = document.getElementById("s"+sid);
		var objShowSoldiersNum = document.getElementById("show_soldiers_num");
		if(objSoldiersNum)
		{
			objShowSoldiersNum.innerHTML = objSoldiersNum.value;
		}
		$('can_get_soldiers_num').innerHTML = 0;
        $('soldiers_num').value = 0;
		$('gameb').innerHTML = 0;
	},
	addSoldiersNum:function()
	{
		var soldiers_num = Math.abs(intVal($('soldiers_num').value));
		var total_soldiers_num = intVal($('show_soldiers_num').innerHTML);
		$('soldiers_num').value = soldiers_num + this.perNum;
		if(intVal($F('soldiers_num'))>total_soldiers_num)$('soldiers_num').value = $F('soldiers_num') - this.perNum;
		$('gameb').innerHTML = this.getNeedGameb();
		$('can_get_soldiers_num').innerHTML = this.getCanChangeSoldiersNum(this.getChangeTypeId(),$F("soldiers_id"),$F('soldiers_num'));
	},
	changeSoldiersNum:function()
	{
        if(Math.abs(intVal($F('soldiers_num'))) < Math.abs(intVal($('show_soldiers_num').innerHTML)))//小于总数
		{
            $('soldiers_num').value = Math.abs(intVal($F('soldiers_num')/this.perNum)*this.perNum);
		}
		else
		{
            $('soldiers_num').value = Math.abs(intVal(intVal($('show_soldiers_num').innerHTML)/this.perNum)*this.perNum);
		}
		$('gameb').innerHTML = SoldiersChange.getNeedGameb();
		$('can_get_soldiers_num').innerHTML = this.getCanChangeSoldiersNum(this.getChangeTypeId(),$F("soldiers_id"),$F('soldiers_num'));
	},
	changeChangeTypeId:function(v)
	{
        $('can_get_soldiers_num').innerHTML = this.getCanChangeSoldiersNum(this.getChangeTypeId(),$F("soldiers_id"),$F('soldiers_num'));
        $('gameb').innerHTML = this.getNeedGameb();
	},
	getCanChangeSoldiersNum:function(change_type_id,soldiers_id,soldiers_num)
	{
		var can_change_soldiers_num;
		if(change_type_id==1)//付费
		{
            can_change_soldiers_num = soldiers_num*1;
		}
		else if(change_type_id==2)//免费
		{
            can_change_soldiers_num = soldiers_num*0.5;
		}
		return intVal(can_change_soldiers_num);
	},
	getNeedGameb:function()
	{
		var change_type_id = this.getChangeTypeId();
		var gameb;
		if(change_type_id==1)//付费
		{
			gameb = Math.abs(intVal($('soldiers_num').value/this.perNum));
		}
		else if(change_type_id==2)//免费
		{
			gameb = 0;
		}
		return gameb;
	},
	changeDo:function()
	{
		var change_type_id = this.getChangeTypeId();
		var gameb = intVal($('gameb').innerHTML);
		var soldiers_num = intVal($('soldiers_num').value);
		if(soldiers_num > 0)
		{
			changeAction.queryData['change_type_id'] = change_type_id;
			changeAction.queryData['soldiers_id'] = $F('soldiers_id');
			changeAction.queryData['soldiers_num'] = $F('soldiers_num');
			changeAction.sendRequest();
		}
		else
		{
			alert('请输入转换的数量');
			$("soldiers_num").focus();
		}
	}
}


//本城军队全部召回
var all_army_by_back_city = new DAjax("/modules/military/military_war_action.php", {logic:{act:"military_war_action",  type:"e"}});
all_army_by_back_city.onComplete   = function()
{
	mask.processInfo(this.responseData);
}
function confirmAllArmyBybackCity(pid)
{
	all_army_by_back_city.queryData['mid'] = pid;
	all_army_by_back_city.queryData['action'] = 'bybackallsure';
	all_army_by_back_city.sendRequest();
}

var all_army_bybackexe_city = new DAjax("/modules/military/military_war_action.php", {logic:{act:"all_army_bybackexe_city",  type:"e"}});
all_army_bybackexe_city.onComplete   = function()
{
	if(this.responseData==1 || !this.responseData)
	{
		mask.remove();
		military_war_navi.jump('military|military_war|military_war_news');
		get_city_army.sendRequest();
		set_city_resource.sendRequest();
	}
	else
		mask.processInfo(this.responseData);

}
function bybackAllArmyDataNoSpeed(mid)
{
	all_army_bybackexe_city.queryData['mid'] = mid;
	all_army_bybackexe_city.queryData['addspeed'] = '0';
	all_army_bybackexe_city.queryData['action'] = 'bybackallexe';
	all_army_bybackexe_city.sendRequest();
	mask.remove();
}
function bybackAllArmyDataSpeed(mid)
{

	var pay_select = document.getElementById('pay_style_1');
	if(pay_select.checked)
		var pt = pay_select.value;
	else
		var pt = document.getElementById('pay_style_2').value;

	all_army_bybackexe_city.queryData['mid'] = mid;
	all_army_bybackexe_city.queryData['ptyle'] = pt;
	all_army_bybackexe_city.queryData['addspeed'] = '1';
	all_army_bybackexe_city.queryData['action'] = 'bybackallexe';
	all_army_bybackexe_city.sendRequest();
	mask.remove();
}
//执行全部回派
var all_army_backexe_city = new DAjax("/modules/military/military_war_action.php", {logic:{act:"all_army_backexe_city",  type:"e"}});
all_army_backexe_city.onComplete   = function()
{
	military_war_action.sendRequest();
	get_city_army.sendRequest();
	set_city_resource.sendRequest();
}
function confirmAllArmybackCity(pid)
{
	all_army_backexe_city.queryData['mid'] = pid;
	all_army_backexe_city.queryData['action'] = 'allbackexe';
	all_army_backexe_city.sendRequest();
}

union_zhanbao.onComplete   = function()
{
	union_zhanbao.queryData['fortress_id']=null;
	union_zhanbao.queryData['c']=null;
}
var union_jdzhanbao = new DAjax('/modules/union.php?action=show&type=union_lianmeng_jdzhanbao', {logic:{ajaxId:'union_jdzhanbao',type:'e'}});
union_jdzhanbao.onComplete   = function()
{
	union_jdzhanbao.queryData['fid']=null;
}


//装备
var military_general_zb = new DAjax("/modules/item/use_item.php", {option:{method:"get"}, logic:{ajaxId:"military_general_zb", act:"embed_item",  type:"e"}});
military_general_zb.onComplete   = function()
{

}

military_general_zb.onBeforeSend = function()
{
	$(this.eTarget).innerHTML = '<iframe style=" width:100%;height:620px;"  allowTransparency="true"  frameborder="0" scrolling="no" src="' + this.url +'?' + this.rand() + '"></iframe>';
	this.sendRequestMark = false	;
}


var military_general_xq = new DAjax("/modules/item/embed_item.php", {option:{method:"get"}, logic:{ajaxId:"military_general_xq", act:"embed_item",  type:"e"}});
military_general_xq.onComplete   = function()
{

}

military_general_xq.onBeforeSend = function()
{
	$(this.eTarget).innerHTML = '<iframe style=" width:100%;height:510px;background:transparent; "  allowTransparency="true"  frameborder="0" scrolling="no" src="' + this.url +'?' + this.rand() + '"></iframe>';
	this.sendRequestMark = false	;
}

var military_general_qh = new DAjax("/modules/item/strengthen_item.php", {option:{method:"get"}, logic:{ajaxId:"military_general_qh", act:"embed_item",  type:"e"}});
military_general_qh.onComplete   = function()
{

}

military_general_qh.onBeforeSend = function()
{
	$(this.eTarget).innerHTML = '<iframe style=" width:100%;height:620px;background:transparent; "  allowTransparency="true"  frameborder="0" scrolling="no" src="' + this.url +'?' + this.rand() + '"></iframe>';
	this.sendRequestMark = false	;
}

//降级
var military_general_jj = new DAjax("/modules/item/lower_item.php", {option:{method:"get"}, logic:{ajaxId:"military_general_jj", act:"lower_item",  type:"e"}});
military_general_jj.onComplete   = function()
{

}

military_general_jj.onBeforeSend = function()
{
	$(this.eTarget).innerHTML = '<iframe style=" width:100%;height:510px;background:transparent; "  allowTransparency="true"  frameborder="0" scrolling="no" src="' + this.url +'?' + this.rand() + '"></iframe>';
	this.sendRequestMark = false	;
}

var military_general_xf = new DAjax("/modules/item/repair_item.php", {option:{method:"get"}, logic:{ajaxId:"military_general_xf", act:"embed_item",  type:"e"}});
military_general_xf.onComplete   = function()
{

}

military_general_xf.onBeforeSend = function()
{
	$(this.eTarget).innerHTML = '<iframe style=" width:100%;height:510px;background:transparent; "  allowTransparency="true"  frameborder="0" scrolling="no" src="' + this.url +'?' + this.rand() + '"></iframe>';
	this.sendRequestMark = false	;
}

var military_general_zq = new DAjax("/modules/horse/horse.php", {option:{method:"get"}, logic:{ajaxId:"military_general_zq", request:"horse_info",  type:"e"}});
military_general_zq.onComplete   = function()
{

}

var shop_update = new DAjax('/modules/shop.php?action=show&type=shop_update', {logic:{ajaxId:'shop_update',type:'e'}});
var shop_add = new DAjax('/modules/shop.php?action=show&type=shop_add', {logic:{ajaxId:'shop_add',type:'e'}});
var shop_repair = new DAjax('/modules/shop.php?action=show&type=shop_repair', {logic:{ajaxId:'shop_repair',type:'e'}});
var shop_other = new DAjax('/modules/shop.php?action=show&type=shop_other', {logic:{ajaxId:'shop_other',type:'e'}});
var shop_arm = new DAjax('/modules/shop.php?action=show&type=shop_arm', {logic:{ajaxId:'shop_arm',type:'e'}});
var shop_coat = new DAjax('/modules/shop.php?action=show&type=shop_coat', {logic:{ajaxId:'shop_coat',type:'e'}});
var shop_prevent = new DAjax('/modules/shop.php?action=show&type=shop_prevent', {logic:{ajaxId:'shop_prevent',type:'e'}});
var shop_huodong = new DAjax('/modules/military/huodong.php', {logic:{ajaxId:'shop_huodong',type:'e'}});
var shop_do = new DAjax('/modules/shop.php?action=do', {logic:{ajaxId:'',type:'e'}});
shop_do.onComplete = function() {
	var re=shop_do.responseData;
	re=''+re; //转换为string类型
	if(re!='' && re.substr(0,7) != 'script:') {
		errMessage(re);
	}else {
			var tmp=''+re.substr(7);
			eval(tmp);
	}
}

var map_collect = new DAjax('/modules/map_collect.php?action=insert', {option:{formName:"form1", messageState:false, message:"", lbType:"n"},logic:{ajaxId:'',type:'e'}});
map_collect.onComplete = function() {
	var re=map_collect.responseData;
	errMessage(re);
}
var map_change = new DAjax('/modules/map_change.php', {logic:{ajaxId:'',type:'e'}});
map_change.onComplete = function() {
	$('map_change_area').innerHTML=map_change.responseData;

}
var map_del = new DAjax('/modules/map_change.php', {logic:{ajaxId:'',type:'e'}});
map_del.onComplete = function() {
	$('map_list_area').innerHTML=map_del.responseData;

}

horseAction = new DAjax("/modules/horse/horse.php",{option:{method:"post"},logic:{action:"d",type:"e"}});
horseAction.onComplete = function()
{
	if(this.responseData)
		mask.showMsgBox(this.responseData,true);
	else
	{
		mask.remove();//alert(this.responseData);
		military_general_general_navi.jump('military|military_general_general|military_general_zq');
		get_money.sendRequest();
		set_city_resource.sendRequest();
	}
}

horseOperationAction = new DAjax("/modules/horse/horse.php",{option:{method:"post"},logic:{action:"d",type:"e"}});
horseOperationAction.onComplete = function()
{
	if(this.responseData)
		mask.processInfo(this.responseData);
	else
	{
		mask.remove();//alert(this.responseData);
		military_general_general_navi.jump('military|military_general_general|military_general_zq');
		get_money.sendRequest();
		set_city_resource.sendRequest();
	}
}
var horseClass = {//坐骑系统
	getHorseDo:function()
	{
		var horse_name = $F("horse_name");
		var horse_attribute = $F("horse_attribute");
		var pay_type = $("pay_type_1").checked?1:0;
		if(horse_name.length <=0)
		{
			alert('请输入坐骑名称');
			return false;
		}
		if(!horse_attribute)
		{
			alert('请选择坐骑属性');
			return false;
		}
		horseAction.queryData['request'] = 'get_horse_do';
		horseAction.queryData['horse_name'] = horse_name;
		horseAction.queryData['horse_attribute'] = horse_attribute;
		horseAction.queryData['pay_type'] = pay_type;
		horseAction.sendRequest();
	},
	feedHorseDo:function()//喂养坐骑
	{
        if($("power").value > 0 && $("power").value <=100)
		{
			horseAction.queryData['request'] = 'feed_horse_do';
			horseAction.queryData['power'] = $F("power");
			horseAction.sendRequest();
		}
		else
		{
			alert('体力点数不正确');
		}
	},
	changePower:function()//喂养坐骑时触发改变点数事件
	{
		var turn_life_times = intVal($F("turn_life_times"));
		var power = Math.abs(intVal($F("power")))>100?100:Math.abs(intVal($F("power")));
		var need_food = 100*turn_life_times*power;//alert('a'+need_food+'b='+power);
		$("power").value = power;
		$("show_power").innerHTML = need_food;
	},
	horsePrometo:function()//显示坐骑升级
	{
		horseOperationAction.queryData['request'] = 'horse_prometo';
		horseOperationAction.sendRequest();
	},
	horsePrometoDo:function()//升级
	{
		horseOperationAction.queryData['request'] = 'horse_prometo_do';
		horseOperationAction.sendRequest();
	},
	giveUpHorse:function()//丢弃坐骑
	{
		if(confirm('确定要丢弃现在的坐骑吗？'))
		{
			horseAction.queryData['request'] = 'give_up_horse_do';
			horseAction.sendRequest();
		}
	},
	addAttributeDo:function()//金币购买添加属性
	{
		horseAction.queryData['request'] = 'add_attribute_do';
		horseAction.queryData['attribute_id'] = $F("attribute_id");
		horseAction.sendRequest();
	},
	turnLifeAddAttributeDo:function()//转生的时候添加属性
	{
		horseAction.queryData['request'] = 'horse_prometo_do';
		horseAction.queryData['attribute_id'] = $F("attribute_id");
		horseAction.sendRequest();
	},
	reliveHorseByResourceDo:function()//资源复活将领
	{
		horseAction.queryData['request'] = 'relive_horse_by_resource_do';
		horseAction.sendRequest();	
	},
	reliveHorseByMoneyDo:function()//金币复活将领
	{
		var pay_type;
		if($("pay_style_1").checked)
			pay_type = 1;
		else if($("pay_style_2").checked)
			pay_type = 2;
		horseAction.queryData['request'] = 'relive_horse_by_money_do';
		horseAction.queryData['pay_type'] = pay_type;
		horseAction.sendRequest();		
	},
	reliveHorseAddSpeedDo:function()//加速复活将领
	{
		var pay_type;
		if($("pay_style_1").checked)
			pay_type = 1;
		else if($("pay_style_2").checked)
			pay_type = 2;
		horseAction.queryData['request'] = 'relive_horse_add_speed_do';
		horseAction.queryData['pay_type'] = pay_type;
		horseAction.sendRequest();	
	},
	setHorseStatusDo:function()//设置坐骑状态
	{
		var horse_status;
		if($("status_1").checked)
			horse_status = 1;
		else 
			horse_status = 0;
		horseAction.queryData['request'] = 'horse_status_do';
		horseAction.queryData['horse_status'] = horse_status;
		horseAction.sendRequest();	
	},
	addPayPointDo:function(item)//分配充值点数
	{
		horseAction.queryData['request'] = 'add_pay_point_do';
		horseAction.queryData['item'] = item;
		horseAction.sendRequest();
	},
	revertPayPointDo:function(item, point)//洗点(充值点数)
	{
		if(item >= 1 && item <= 6 && point > 0)
		{
			if($('pay_style_1').checked)
			{
				horseAction.queryData['pay_type'] = 1;
			}
			else
			{
				horseAction.queryData['pay_type'] = 2;
			}
			horseAction.queryData['request'] = 'revert_pay_point_do';
			horseAction.queryData['item'] = item;
			horseAction.queryData['point'] = point;
			horseAction.sendRequest();
		}
		else
		{
			alert('JS提交参数错误！');
			return ;
		}
	}
}

smokingAction = new DAjax("/modules/military/smoking.php",{option:{method:"post"},logic:{type:"e"}});
smokingAction.onComplete = function()
{
	if(this.responseData)
		mask.processInfo(this.responseData);
	else
	{
		mask.remove();
	}
	get_money.sendRequest();
	set_city_resource.sendRequest();
}
var SmokingClass = {//无烟日活动
    answerQuestion:function()
	{
		var answer;
		if($("answer1").checked)
			answer = 1;
		else if($("answer0").checked)
			answer = 0;
		else
		{
			alert("您还没有选择答案，请选择！");
			return;
		}
		smokingAction.queryData['action'] = 'do';
		smokingAction.queryData['answer'] = answer;
		smokingAction.sendRequest();	
        mask.remove();
	}
}
var stop_war= new DAjax('/tools/act/stop_war.php', {option:{formName:"form1", messageState:false, message:"", lbType:"n"},logic:{ajaxId:"",  type:"e"}});
stop_war.onComplete = function() {
	var re=stop_war.responseData;
	get_money.sendRequest();
	errMessage(re);
	eval(currentTabId + '.sendRequest();');
}

var logic = {type:"e"};

var getShopInfo = new DAjax("/modules/shop.php?action=show&type=shop_arm", {option:{method:"get"}, logic:logic});
//var getShopInfo = new DAjax("/modules/1.php", {option:{method:"post"}, logic:logic});

getShopInfo.onComplete   = function()
{
	var str = '<div style="height:500px; width:750px;"><div style="height:500px; width:750px; overflow-y:scroll;background-color:#4c4441; position:relative ;">' + this.responseData + '</div></div><div style="height:23px; width:750px;background-color:#4c4441;padding-top:5px;"><li style="text-align:center;"><img src="' + IMA_PATH + '/main/jz_b_6.gif" rel="remove" class="lbAction" /></li></div>';
	mask.processInfo(str, this.lbType);
}

getShopInfo.onNoneGet   = function()
{
	mask.showMsgBox(this.responseData, true);
}

var shop_exchange = new DAjax('/modules/item/show_card.php', {logic:{ajaxId:'shop_exchange',type:'e'}});

var logic = {act:"get_item_card_do",  type:"o"};
var getCards = new DAjax("/modules/gateway.php?module=item", {option:{formName: 'get_card_form', method:"get"}, logic:logic});
getCards.onComplete   = function()
{
	eval(currentTabId + '.sendRequest();');
	mask.remove();
	mask.showMsgBox(this.responseMessageData.message, true);
}

getCards.onNoneGet   = function()
{
	mask.showMsgBox(this.errorMessage, true);
}

//搬迁城池
var thisMapId=0;
var moveCityMoney=2;
var moveCityThisMapId=0;
var moveCity_do = new DAjax('/modules/move_city.php?action=do', {logic:{ajaxId:'',type:'e'}});
moveCity_do.onComplete = function() {
	var re=moveCity_do.responseData;
	re=''+re; //转换为string类型
	if(re!='' && re.substr(0,7) != 'script:') {
		mask.remove();
		errMessage(re);
	}else {
			var tmp=''+re.substr(7);
			eval(tmp);
	}
}

var city_manage_0 = new DAjax("/modules/gateway.php", {option:{method:"get"}, logic:{ajaxId:"city_manage_0",  type:"e"}});
city_manage_0.onComplete   = function()
{

}

city_manage_0.onNoneGet   = function()
{
	alert(this.errorMessage);
}

var city_manage_1 = new DAjax("/modules/gateway.php", {option:{method:"get"}, logic:{ajaxId:"city_manage_1",  type:"e"}});
city_manage_1.onComplete   = function()
{

}

city_manage_1.onNoneGet   = function()
{
	alert(this.errorMessage);
}


var city_manage_2 = new DAjax("/modules/gateway.php", {option:{method:"get"}, logic:{ajaxId:"city_manage_2",  type:"e"}});
city_manage_2.onComplete   = function()
{

}
city_manage_2.onNoneGet   = function()
{
	alert(this.errorMessage);
}

var city_manage_3 = new DAjax("/modules/gateway.php", {option:{method:"get"}, logic:{ajaxId:"city_manage_3",  type:"e"}});
city_manage_3.onComplete   = function()
{

}
city_manage_3.onNoneGet   = function()
{
	alert(this.errorMessage);
}

var city_manage_4 = new DAjax("/modules/gateway.php", {option:{method:"get"}, logic:{ajaxId:"city_manage_4",  type:"e"}});
city_manage_4.onComplete   = function()
{

}
city_manage_4.onNoneGet   = function()
{
	alert(this.errorMessage);
}

var city_manage_5 = new DAjax("/modules/gateway.php", {option:{method:"get"}, logic:{ajaxId:"city_manage_5",  type:"e"}});
city_manage_5.onComplete   = function()
{

}
city_manage_5.onNoneGet   = function()
{
	alert(this.errorMessage);
}

var city_manage_6 = new DAjax("/modules/gateway.php", {option:{method:"get"}, logic:{ajaxId:"city_manage_6",  type:"e"}});
city_manage_6.onComplete   = function()
{

}
city_manage_6.onNoneGet   = function()
{
	alert(this.errorMessage);
}

var paiming_0 = new DAjax("/modules/gateway.php", {option:{method:"get"}, logic:{ajaxId:"paiming_0", act:"paiming", type:"e"}});
paiming_0.onComplete   = function()
{

}
paiming_0.onNoneGet   = function()
{
	alert(this.errorMessage);
}

var paiming_1 = new DAjax("/modules/gateway.php", {option:{method:"get"}, logic:{ajaxId:"paiming_1", act:"paiming",  type:"e"}});
paiming_1.onComplete   = function()
{

}
paiming_1.onNoneGet   = function()
{
	alert(this.errorMessage);
}
var paiming_2 = new DAjax("/modules/gateway.php", {option:{method:"get"}, logic:{ajaxId:"paiming_2", act:"paiming", type:"e"}});
paiming_2.onComplete   = function()
{

}
paiming_2.onNoneGet   = function()
{
	alert(this.errorMessage);
}
var rank_top_ju = new DAjax("/modules/gateway.php", {option:{method:"get"}, logic:{ajaxId:"rank_top_ju", act:"rank_npc", type:"e"}});
rank_top_ju.onComplete   = function()
{

}
rank_top_ju.onNoneGet   = function()
{
	alert(this.errorMessage);
}
var rank_top_da = new DAjax("/modules/gateway.php", {option:{method:"get"}, logic:{ajaxId:"rank_top_da", act:"rank_npc", type:"e"}});
rank_top_da.onComplete   = function()
{

}
rank_top_da.onNoneGet   = function()
{
	alert(this.errorMessage);
}
var rank_top_zhong = new DAjax("/modules/gateway.php", {option:{method:"get"}, logic:{ajaxId:"rank_top_zhong", act:"rank_npc", type:"e"}});
rank_top_zhong.onComplete   = function()
{

}
rank_top_zhong.onNoneGet   = function()
{
	alert(this.errorMessage);
}
var rank_top_xiao = new DAjax("/modules/gateway.php", {option:{method:"get"}, logic:{ajaxId:"rank_top_xiao", p:2, act:"rank_npc", type:"e"}});
rank_top_xiao.onComplete   = function()
{

}
rank_top_xiao.onNoneGet   = function()
{
	alert(this.errorMessage);
}
function panel_user_npc(B,A)
{
	var rank_top_ju = new DAjax("/modules/gateway.php", {option:{method:"get"}, logic:{ajaxId:B, p:A, act:"rank_npc", type:"e"}});
	rank_top_ju.onComplete   = function()
	{

	}
	rank_top_ju.sendRequest();
	rank_top_ju.onNoneGet   = function()
	{
		alert(this.errorMessage);
	}
}
function baidu(id,num) {
	var	vv=			intVal($(id).value)+intVal(num);
	//alert($('liangshi').value);
	$(id).value=	vv;
	/*
	if(id=='mucai') {
		if(intVal($(id).value)>intVal(json.mucai)) $(id).value=	json.mucai;
	}
	if(id=='nitu') {
		if(intVal($(id).value)>intVal(json.nitu)) $(id).value=	json.nitu;
	}
	if(id=='tiekuang') {
		if(intVal($(id).value)>intVal(json.tiekuang)) $(id).value=	json.tiekuang;
	}
	if(id=='liangshi') {
		if(intVal($(id).value)>intVal(json.liangshi)) $(id).value=	json.liangshi;
	}
	*/
	//var	total=		json.free*json.carry;
	var	total=		240000;
	var mucai=		intVal($('mucai').value);
	var nitu=		intVal($('nitu').value);
	var tiekuang=	intVal($('tiekuang').value);
	var liangshi=	intVal($('liangshi').value);
	res=			total-mucai-nitu-tiekuang-liangshi;
	if(res<0) {
		$(id).value=	vv+res;
	}
	//$('muqian').innerHTML=	json.free*json.carry-$('mucai').value - $('nitu').value - $('tiekuang').value - $('liangshi').value;
}
function hour_1() {
	if(intVal($('hour1').value)<0) {
		$('hour1').value=	0;
	} else if(intVal($('hour1').value)>72) {
		$('hour1').value=	72;
	} else {
		$('hour1').value=	intVal($('hour1').value);
	}
}
function min_1() {
	if(intVal($('min1').value)<0) {
		$('min1').value=	0;
	} else if(intVal($('min1').value)>60) {
		$('min1').value=	60;
	} else {
		$('min1').value=	intVal($('min1').value);
	}
}
function res1(id) {
	var		num=$(id).value;
	num=	parseInt(num);
	num=	Math.abs(num);
	if(isNaN(num))	num=0;
	//alert(typeof(num));
	$(id).value=	num;
	//alert("Num is=" + num);
	/*
	if(id=='mucai') {
		if(intVal($(id).value)>intVal(json.mucai)) $(id).value=	json.mucai;
	}
	if(id=='nitu') {
		if(intVal($(id).value)>intVal(json.nitu)) $(id).value=	json.nitu;
	}
	if(id=='tiekuang') {
		if(intVal($(id).value)>intVal(json.tiekuang)) $(id).value=	json.tiekuang;
	}
	if(id=='liangshi') {
		if(intVal($(id).value)>intVal(json.liangshi)) $(id).value=	json.liangshi;
	}
	*/
	//var res=		json.free*json.carry-$('mucai').value - $('nitu').value - $('tiekuang').value - $('liangshi').value;
	var res=		240000-$('mucai').value - $('nitu').value - $('tiekuang').value - $('liangshi').value;
	if(res<0) {

		if(id=='mucai') {
			//res=		json.free*json.carry-$('nitu').value -	$('tiekuang').value -	$('liangshi').value;
			res=		240000-$('nitu').value -	$('tiekuang').value -	$('liangshi').value;
		} else if(id=='tiekuang') {
			//res=		json.free*json.carry-$('mucai').value - $('nitu').value  -		$('liangshi').value;
			res=		240000-$('mucai').value - $('nitu').value  -		$('liangshi').value;
		} else if(id=='nitu') {
			//res=		json.free*json.carry-$('mucai').value - $('tiekuang').value -	$('liangshi').value;
			res=		240000-$('mucai').value - $('tiekuang').value -	$('liangshi').value;
		} else if(id=='liangshi') {
			//res=		json.free*json.carry-$('mucai').value - $('nitu').value -		$('tiekuang').value;
			res=		240000-$('mucai').value - $('nitu').value -		$('tiekuang').value;
		}
		$(id).value=	res;
		res=			0;
	}

	//$('muqian').innerHTML=	res;

}
function select_city() {
	var map_id=	$('select').value;
	var url=	'/modules/gateway.php?ajaxId=ajax&act=d&type=e&cache=false&map=' + map_id + '&time=' + new Date().getTime();
	new Ajax.Request(
						url,
					{   method:'get',
						onSuccess: function(transport) {
										var response = transport.responseText || "no response text";
										//alert("Success! \n\n" + response);
										json=	response.evalJSON();
										local_time=	new Date().getTime()/1000;
										local_time=	Math.ceil(local_time);

										//alert(json.nitu);
										$('yunzai1').innerHTML=	json.free + "/" + json.shangren;
										$('zuigao').innerHTML=	json.shangren*json.carry;
										$('muqian').innerHTML=	json.free* json.carry;
										$('nitu').value=		0;
										$('mucai').value=		0;
										$('tiekuang').value=	0;
										$('liangshi').value=	0;
										//alert(json.auto_time);
										if(json.auto_time==0) {
											$('dasdf').hide();
										} else {
											$('dasdf').show();
											show_time() ;
										}
										$('trn1').innerHTML=	"<a href=\"#\" onclick=\"Javascript:baidu('mucai','"  + json.carry + "');\">" + json.mucai + "</a>";
										$('trn2').innerHTML=	"<a href=\"#\" onclick=\"Javascript:baidu('nitu','"  + json.carry + "');\">" + json.nitu + "</a>";
										$('trn3').innerHTML=	"<a href=\"#\" onclick=\"Javascript:baidu('tiekuang','"  + json.carry + "');\">" + json.tiekuang + "</a>";
										$('trn4').innerHTML=	"<a href=\"#\" onclick=\"Javascript:baidu('liangshi','"  + json.carry + "');\">" + json.liangshi + "</a>";
									},
						onFailure: function() {
										alert('刷新下')
									}
					}
				);

}

var logic = {ajaxId:"yunshu", act:"d",  type:"e"};
//var yunshu1 = new DAjax("/modules/gateway.php", {option:formName:"form_ziyuan", method:"get", messageState:'mask', message:"资源转化中..."}, logic:logic});
var yunshu1 = new DAjax("/modules/gateway.php", {option:{formName:"form_ziyuan", method:"get", messageState:'mask', message:"资源转化中..."}, logic:logic});


function yunshu() {
	//if(json.auto_time && ($('hour2').value>0 || $('min2').value>0)) {
	//	mask.showMsgBox('只能一条自动运输队列！',true);
	//	return false;
	//}
	if($('select').value == $('select2').value) {
		mask.showMsgBox('不能同城池之间运输资源！',true);
		//alert('不能自己给自己运输资源');
		return false;
	}

	var res=		json.free*json.carry-$('mucai').value - $('nitu').value - $('tiekuang').value - $('liangshi').value;

	if($('mucai').value <0 ||  $('nitu').value <0 ||  $('tiekuang').value <0 ||  $('liangshi').value<0) {
		//alert('运输的资源不能少于0!');
		mask.showMsgBox('运输的资源不能少于0!',true);
		return	false;
	}
	if(($('mucai').value +  $('nitu').value  +  $('tiekuang').value  +  $('liangshi').value)==0) {
		//alert('不能运输空资源');
		mask.showMsgBox('不能运输空资源!',true);
		return false;
	}
	/*
	if(res<0) {
		//alert('超过了运载限制');
		mask.showMsgBox('超过了运载限制!',true);
		return false;
	}
	*/
	yunshu1.sendRequest();
}
yunshu1.onComplete   = function()
{
	//mask.showMsgBox('资源运输成功！',true);
	select_city();
	mask.showMsgBox(this.responseData,true);
}

yunshu1.onNoneGet   = function()
{
	alert(this.errorMessage);
}


var logic11 = {ajaxId:"yunshu_quxiao", act:"d",  type:"e"};
var yunshu_quxiao1 = new DAjax("/modules/gateway.php", {option:{formName:"form_ziyuan", method:"get", messageState:'mask', message:"资源转化中..."}, logic:logic11});
function yunshu_quxiao() {
	 yunshu_quxiao1.sendRequest();
}
yunshu_quxiao1.onComplete   = function()
{
	mask.showMsgBox(this.responseData,true);
	$('hour2').value=	0;
	//$('min2').value=	0;
	$('dasdf').hide();
}
/*
var city_manage_7 = new DAjax("/modules/gateway.php", {option:{method:"get"}, logic:{ajaxId:"city_manage_5",  type:"e",peng:'dd'}});
city_manage_7.onComplete   = function()
{

}
city_manage_7.onNoneGet   = function()
{
	alert(this.errorMessage);
}
*/
var city_manage_7 = new DAjax("/modules/military/military_war_news1.php", {option:{method:"get"}, logic:{ajaxId:"city_manage_5",  type:"e",peng:'dd'}});
city_manage_7.onComplete   = function()
{

}
city_manage_7.onNoneGet   = function()
{
	alert(this.errorMessage);
}
/*
 * 小队的ajax请求
 *
 */
var team_info = new DAjax("/modules/gateway.php", {logic:{ajaxId:"team_info", act:"main",  type:"e", cla:"Team_Info", operateType:"class"}});
team_info.onNoneGet   = function()
{
	mask.showMsgBox(this.errorMessage, true);
}
var team_arena = new DAjax("/modules/gateway.php", {logic:{ajaxId:"team_arena", act:"main",  type:"e", cla:"Team_Arena", operateType:"class"}});
team_arena.onNoneGet   = function()
{
	mask.showMsgBox(this.errorMessage, true);
}
var team_toplist = new DAjax("/modules/gateway.php", {logic:{ajaxId:"team_toplist", act:"main",  type:"e", cla:"Team_Toplist", operateType:"class"}});
team_toplist.onNoneGet   = function()
{
	mask.showMsgBox(this.errorMessage, true);
}

var team_famehall = new DAjax("/modules/gateway.php", {logic:{ajaxId:"team_famehall", act:"main",  type:"e", cla:"Team_Famehall", operateType:"class"}});
team_famehall.onNoneGet   = function()
{
	mask.showMsgBox(this.errorMessage, true);
}

var team_member = new DAjax("/modules/gateway.php", {logic:{ajaxId:"team_member", act:"main",  type:"e", cla:"Team_ManageDlg", operateType:"class", menu:'member'}});
team_member.onNoneGet   = function()
{
	mask.showMsgBox(this.errorMessage, true);
}
team_member.onComplete   = function() {
	mask.processInfo(this.responseData, 'o');
}

var team_dispatch = new DAjax("/modules/gateway.php", {option:{formName:"team_army_form",  messageState:false, message:""},logic:{ajaxId:"team_dispatch", cla:"Team_Arena", act:"doDispatch",  type:"e", operateType:'class'}});
team_member.onNoneGet   = function()
{
	mask.showMsgBox(this.errorMessage, true);
}
team_dispatch.onComplete = function()
{
	set_city_resource.sendRequest();
	get_city_army.sendRequest();
	mask.processInfo(this.responseData);
}

/*
 * 小队的ajax显示，用来部分刷新某个ajaxID
 *
 */
function team_show(className, funcName, paramObj, ajaxId) {
	if (funcName == undefined) funcName = 'main';

	var team_show = new DAjax('/modules/gateway.php', {logic:{ajaxId:ajaxId, act:funcName, type:'e', cla:className, operateType:'class'}});
	if (typeof paramObj == 'object') {
		for (paramKey in paramObj) {
			team_show.queryData[paramKey] = paramObj[paramKey];
		}
	}
	team_show.onNoneGet = function() {
		mask.showMsgBox(this.errorMessage, true);
	};
	team_show.sendRequest();

}
/*
 * 小队的ajax请求，对应class里面的方法
 *
 */
function team_action(className, funcName, paramObj, type) {
	if (funcName == undefined) funcName = 'main';
	if (type == undefined) type = 'e';

	var team_action = new DAjax('/modules/gateway.php', {logic:{ajaxId:'team_action', act:funcName, type:type, cla:className, operateType:'class'}});
	if (typeof paramObj == 'object') {
		for (paramKey in paramObj) {
			team_action.queryData[paramKey] = paramObj[paramKey];
		}
	}

	team_action.onNoneGet = function() {
		mask.showMsgBox(this.errorMessage, true);
	};
	team_action.onComplete   = function()
	{

		if (className == 'Team_Arena') {
			if (funcName == 'showWarReport' || funcName == 'showDispatchView') {
				$(paramObj['target']).innerHTML = this.responseData;
				return;
			}
			if (funcName = 'joinGroup') {
				team_arena.sendRequest();
			}
			mask.processInfo(this.responseData, 'o');
		}
		if (className == 'Team_Info')
		{
			//更新钱币数量
			if (funcName == 'doCreate')
				get_money.sendRequest();
			mask.processInfo(this.responseData);
			team_info.sendRequest();
		}
		if (className == 'Team_ManageDlg')
		{
			if (funcName == 'main')
				mask.processInfo(this.responseData, 'o');
			else if (funcName == 'closeTeam') {
				mask.processInfo(this.responseData);
				team_info.sendRequest();
			}
			else
				mask.processInfo(this.responseData);
		}
		if (className == 'Team_Help')
		{
			mask.processInfo(this.responseData);
		}

	};
	team_action.sendRequest();
}

//更新喇叭数
var update_speaker = new DAjax("/modules/gateway.php?module=im", {option:{messageState:false, method:"get"}, logic:{act:"update_speaker", type:"e"}});

update_speaker.onComplete   = function()
{
	try
	{
		var json = eval("(" + this.responseData + ")");
		$("im_speaker_icon").setAttribute("msg", "你现在有 " + json.speaker_num + " 个喇叭");
		im_speaker_num = json.speaker_num;
	}
	catch(e)
	{}
};

var consume_speaker = new DAjax("/modules/gateway.php?module=im", {option:{messageState:false, method:"post"}, logic:{act:"consume_speaker_do", type:"e"}});

consume_speaker.onComplete   = function()
{
	var json = eval("(" + this.responseData + ")");
	if (json.ret == 0)
	{
		clsIm.send(json.data, json.key);
		$("im_post_content").focus();
	}
	else
	{
		clsIm.sending = false;
		errMessage("将领等级需大于15级才能在世界频道聊天。");
	}
	//update_speaker.sendRequest();
	//mask.remove();
};

//暂时修改下新的类型
function military_view(page,id,t)
{
	 switch (page)
	 {
			case 'msg_military_all':
			{
				if(t==1)
				{
					msg_military_all_attack.queryData['qid'] = id;
					msg_military_all_attack.queryData['action'] = 'attack';
					msg_military_all_attack.sendRequest();
				}
				if(t==2)
				{
					msg_military_all_attack.queryData['qid'] = id;
					msg_military_all_attack.queryData['action'] = 'check';
					msg_military_all_attack.sendRequest();
				}
				if(t==3)
				{
					msg_military_all_attack.queryData['qid'] = id;
					msg_military_all_attack.queryData['action'] = 'attack';
					msg_military_all_attack.sendRequest();
				}
				if(t==4)
				{
					msg_military_all_trade.queryData['qid'] = id;
					msg_military_all_trade.queryData['action'] = 'trade';
					msg_military_all_trade.sendRequest();
				}
				if(t==5)
				{
					msg_military_all_help.queryData['qid'] = id;
					msg_military_all_help.queryData['action'] = 'help';
					msg_military_all_help.sendRequest();
				}
				if(t==6)
				{
					msg_military_all_attack.queryData['qid'] = id;
					msg_military_all_attack.queryData['action'] = 'help_attack';
					msg_military_all_attack.sendRequest();
				}
				if(t==8) {
					msg_military_die_sol.queryData.qid=id;
					msg_military_die_sol.queryData.action="fortress_war";
					msg_military_die_sol.sendRequest();
				}
				if(t==7)
				{
					msg_military_all_attack.queryData['qid'] = id;
					msg_military_all_attack.queryData['action'] = 'fortress_war';
					msg_military_all_attack.sendRequest();
				}
				if(t==9)
				{
					msg_military_all_attack.queryData['qid'] = id;
					msg_military_all_attack.queryData['action'] = 'team_war';
					msg_military_all_attack.sendRequest();
				}
				break;
			}
			case 'msg_military_attack':
			{
				if(t==1)
				{
					msg_military_attack_view.queryData['qid'] = id;
					msg_military_attack_view.queryData['action'] = 'attack';
					msg_military_attack_view.sendRequest();
				}
				if(t==2)
				{
					msg_military_attack_view.queryData['qid'] = id;
					msg_military_attack_view.queryData['action'] = 'check';
					msg_military_attack_view.sendRequest();
				}
				if(t==3)
				{
					msg_military_attack_view.queryData['qid'] = id;
					msg_military_attack_view.queryData['action'] = 'attack';
					msg_military_attack_view.sendRequest();
				}
				if(t==6)
				{
					msg_military_attack_view.queryData['qid'] = id;
					msg_military_attack_view.queryData['action'] = 'help_attack';
					msg_military_attack_view.sendRequest();
				}
				if(t==7)
				{
					msg_military_attack_view.queryData['qid'] = id;
					msg_military_attack_view.queryData['action'] = 'fortress_war';
					msg_military_attack_view.sendRequest();
				}
				if(t==9)
				{
					msg_military_attack_view.queryData['qid'] = id;
					msg_military_attack_view.queryData['action'] = 'team_war';
					msg_military_attack_view.sendRequest();
				}
				break;
			}
			case 'msg_military_trade':
			{
				if(t==4)
				{
					msg_military_trade_view.queryData['qid'] = id;
					msg_military_trade_view.queryData['action'] = 'trade';
					msg_military_trade_view.sendRequest();
				}
				break;
			}
			case 'msg_military_help':
			{
				if(t==5)
				{
					msg_military_help_view.queryData['qid'] = id;
					msg_military_help_view.queryData['action'] = 'help';
					msg_military_help_view.sendRequest();
				}
				break;
			}
			case "msg_military_die_sol1":
		    {
				if(t==8) {
					msg_military_die_sol_1.queryData.qid=id;
					msg_military_die_sol_1.queryData.action="fortress_war";
					msg_military_die_sol_1.sendRequest();
				}
				break;
			}

	 }


}

flag=0;
	function show_time() {
		t=		new Date().getTime()/1000;		//电脑时间		json.server_time服务器时间	json.suto_time执行时间
		t=		Math.ceil(t);
		//t=	json.auto_time-Math.ceil(t);		//以前的标准的

		//t=		(json.auto_time-json.server_time)-(t-local_time);

		//t=		Math.ceil(t);
		//alert(local_time);
		//return false;
		//t=		json.auto_time--;
		//alert(t);
		//alert(local_time);
		//return	false;
		t=		json.auto_time-(t-local_time);
		t=		Math.ceil(t);
		if(t>0) {
			var hour=	Math.floor(t/3600);
			var min=	t%3600;
			min=		Math.floor(min/60);
			var sec=	t%60;
			if(hour.toString().length==1) {
				hour=	"0" + hour;
			}
			if(min.toString().length==1) {
				min=	"0" + min;
			}
			if(sec.toString().length==1) {
				sec=	"0" + sec;
			}
			//$('hour2').value=	hour + ":" + min;
			//$('min2').value=	sec;
			$('hour2').value=	hour + ":" + min + ":" + sec;
			setTimeout("show_time()",1000);
		} else {
			$('dasdf').hide();
		}
	}
var msg_military_die_sol=new DAjax("/modules/military/msg_military_die_sol.php",{logic:{ajaxId:"msg_military_all",act:"msg_military_all",type:"e"}});
//var msg_military_die_sol1=new DAjax("/modules/military/msg_military_die_sol1.php",{logic:{ajaxId:"msg_military_die_sol1",act:"msg_military_all",type:"e"}});
var msg_military_die_sol1=new DAjax("/modules/military/msg_military_die_sol1.php",{logic:{ajaxId:"msg_military_die_sol1",act:"msg_military_die_sol1",type:"e"}});
msg_military_die_sol.onComplete=function() {
}
msg_military_die_sol.onNoneGet   = function()
{
	alert(this.errorMessage);
}
msg_military_die_sol1.onComplete=function() {
}
msg_military_die_sol1.onNoneGet   = function()
{
	alert(this.errorMessage);
}

function send_team_army_form()
{
	start_soldiers_fortress.queryData['action'] = 'send_team_army_action';
	start_soldiers_fortress.sendRequest();
}

var msg_military_die_sol_1=new DAjax("/modules/military/msg_military_die_sol.php",{logic:{ajaxId:"msg_military_die_sol1",act:"msg_military_all",type:"e"}});
function select_city1() {							//派兵时选哪个城池的军队用的js
	var map_id=	$('select').value;
	var url=	'/modules/military/ajax.php?map=' + map_id + '&time=' + new Date().getTime();
	new Ajax.Request(
						url,
					{   method:'get',
						onSuccess: function(transport) {
										var response = transport.responseText || "no response text";
										//alert("Success! \n\n" + response);
										json1=	response.evalJSON();
										$('s_h_army_id').value=	json1[1];
										if(json1[2]==1) {							//将领存在
											$('gggg').show();
										} else {									//将领不在
											$('gggg').hide();
										}
										json=	json1[0];
										for(p in json) {
											p1=	"cc" + p;
											s1=	"s" + p;
											$(p1).innerHTML=		json[p];
											$(s1).value=	0;
										}



									},
						onFailure: function() {
										alert('刷新下')
									}
					}
				);

}


// YuHuasong
// 征兵队列单独拿出来操作 参照: item_res_action
function item_res_action_new(pid,qid,k)
{

	item_shop_act.queryData['pkey'] = k;
	item_shop_act.queryData['pid'] = pid;
	item_shop_act.queryData['qid'] = qid;
	item_shop_act.queryData['action'] = 'confirm';
	item_shop_act.sendRequest();

}



// YuHuasong
// 征兵队列单独拿出来操作  作 参照: item_action
function item_action_new(H,qid,B)
{
    var E=document.getElementById("pay_style_1");
    if(E.checked)
	{
		var F=E.value;
	}
    else
    {
	    if ( document.getElementById("pay_style_4") && document.getElementById("pay_style_4").checked )
		{
			var F=document.getElementById("pay_style_4").value;
		}
		else
		{
			var F=document.getElementById("pay_style_2").value
		}
    }
	
	mask.remove();
	item_time_act.queryData.ptyle=F;
	item_time_act.queryData.sid="";
	item_time_act.queryData.pkey=B;
	item_time_act.queryData.pid=H;
	item_time_act.queryData.qid=qid;
	item_time_act.queryData.action="insert";
	item_time_act.sendRequest();
}

var user_designation = new DAjax ( "/modules/user_designation.php", {logic:{ajaxId:"user_designation",type:"e"}} );
user_designation.onComplete = function () 
{
	msg_user_navi.jump('msg|user_info|user_info');
};

var union_science = new DAjax ( '/modules/union.php?action=show&type=union_science', {logic:{ajaxId:'union_science',type:'e'}} );
union_science.onComplete = function () 
{
	
};