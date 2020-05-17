if (!im_track_on)
	setTimeout("loadIm();",3000);

function loadIm() {
	window.clsIm = new classIm ();
	//clsIm.debug = 1;
	clsIm.block_word = im_block_word;
	clsIm.nickname = im_nickname;

	//右键菜单点击事件，参数I为点击了第几个，从0开始
	clsIm.menu_click = function (i, username) {
		if (i == 0) {
			set_friend(username);
		}
		else if (i == 1) {
			panel_user(username);
		}
		else {

		}
	};
	getKey(clsIm.nickname);
	clsIm.channels = {
		'C' : {
			name : "国家"
		},
		'U' : {
			name: "联盟",
			view_online : true
		}
	};
	clsIm.send_handle = function(data) {
		if (data.split('|')[0] == 'W') {
				consume_speaker.queryData['data'] = data;
				consume_speaker.queryData['private_key'] = clsIm.private_key;
				consume_speaker.sendRequest();
		}
		else
			clsIm.send(data, '0');
	};
	clsIm.swf_path = "/js/IM/socket.swf";
	clsIm.operation_icon = "http://static.sg.9wee.com/im/icon-operation.gif";
	clsIm.init();
	clsIm.error_msg.user_not_exist = '';
	for(var i = 0, l = im_log.length; i < l; i++) {
		clsIm.send_msg(1, im_log[i].user_nickname, '吼：', im_log[i].content, false, true, im_log[i].post_time);
	}
	/*//增加一个小喇叭按钮
	var a_speaker = document.createElement("a");
	a_speaker.id = "im_speaker_icon";
	a_speaker.className = "TS";
	//a_speaker.msg = "test";
	a_speaker.setAttribute("msg", "你现在有 " + im_speaker_num + " 个喇叭");
	a_speaker.onclick = function() {
		item_res_action(111, im_speaker_key);
	}
	mask.tagTS(a_speaker);
	$("im_inner_box").appendChild(a_speaker);*/

	//连接
	var im_center_top = $("im_center").offsetTop;
	var im_scroll_top= document.documentElement.scrollTop;

	if (im_browser.msie && im_browser.version < 7) {
		window.onscroll = function (){
			$("im_center").style.top = (document.documentElement.scrollTop + im_center_top - im_scroll_top) +"px";
		};
	}



	var posX;
	var posY;
	$("im_border").onmousedown=function(e)
	{
		mousedown(e);
	}

	$("im_inner_box_title").onmousedown=function(e)
	{
		mousedown(e);
	}
	function mousedown(e) {
		document.body.onselectstart = function () {return false;};
		//停止选择样式
		document.body.style.userSelect = "none";
		document.body.style.MozUserSelect = "none";
		if(!e) e = window.event;  //如果是IE
		posX = e.clientX - parseInt($("im_center").offsetLeft);
		posY = e.clientY - parseInt($("im_center").offsetTop);

		document.onmousemove = mousemove;
	}
	document.onmouseup = function()
	{
		document.body.onselectstart = "";
		document.body.style.userSelect = "";
		document.body.style.MozUserSelect = "";
		document.onmousemove = null;
		im_center_top = $("im_center").offsetTop;
		im_scroll_top= document.documentElement.scrollTop;
	}
	function mousemove(ev)
	{
		if(!ev) ev = window.event;//如果是IE
		//var obj = ev.srcElement||ev.target;
		//if ((ev.clientX - posX) < (document.documentElement.clientWidth - obj.offsetWidth))
			$("im_center").style.left = (ev.clientX - posX) + "px";
		//if ((ev.clientY - posY) > 0 && (ev.clientY - posY) < document.documentElement.clientHeight + document.documentElement.scrollTop)
			$("im_center").style.top = (ev.clientY - posY) + "px";
	}
	$("im_content_title").innerHTML = "";
}

//聊天的KEY
function getKey(nickname) {
	var get = new DAjax("/modules/gateway.php?module=im", {logic:{type:"e",act:'getLoginKey'}});
	get.onComplete  = function()
	{
		var json = eval("(" + this.responseData + ")");
		clsIm.host = json.host;
		clsIm.port = json.port;
		clsIm.login_key = json.key;
		clsIm.connect();
		//clsIm.set_innerbox_class("lite");
		if (im_union_id != 0)
			clsIm.join_channel('U', im_union_id);
		clsIm.join_channel('C', im_belong_country);
	}

	get.queryData['nickname'] = nickname;
	get.sendRequest();

}

function im_init_extend ()
{
	if ( document.getElementById("im_extend_button") )
	{
		document.getElementById("im_extend_button").onclick();
	}
	else 
	{
		setTimeout ( "im_init_extend();", 500 );
	}
}

//im_init_extend();