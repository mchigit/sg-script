// JavaScript Document

// function to set a cookie1111

function setCookie ( name, value )
{
	expires = new Date();
	expires.setTime(expires.getTime() + (1000 * 86400 * 365));
	document.cookie = name + "=" + escape(value) + "; expires=" + expires.toGMTString() +  "; path=/";
	//document.cookie = name + "=" + escape(value) + "; path=/";
}

// function to retrieve a cookie
function getCookie ( name )
{
	cookie_name = name + "=";
	cookie_length = document.cookie.length;
	cookie_begin = 0;
	while (cookie_begin < cookie_length)
	{
		value_begin = cookie_begin + cookie_name.length;
		if (document.cookie.substring(cookie_begin, value_begin) == cookie_name)
		{
			var value_end = document.cookie.indexOf (";", value_begin);
			if (value_end == -1)
			{
				value_end = cookie_length;
			}
			return unescape(document.cookie.substring(value_begin, value_end));
		}
		cookie_begin = document.cookie.indexOf(" ", cookie_begin) + 1;
		if (cookie_begin == 0)
		{
			break;
		}
	}
	return null;
}

// function to delete a cookie
function delCookie ( name )
{
	var expireNow = new Date();
	document.cookie = name + "=" + "; expires=Thu, 01-Jan-70 00:00:01 GMT" +  "; path=/";
}

function setWeeCookie ( name, value, noExpire )
{
	if ( noExpire != null )
	{
		document.cookie = name + "=" + escape(value) + "; path=/; domain=.9wee.com";  
	}
	else
	{
		expires = new Date();
		expires.setTime(expires.getTime() + (1000 * 86400 * 365));
		document.cookie = name + "=" + escape(value) + "; expires=" + expires.toGMTString() +  "; path=/; domain=.9wee.com";  
	}
}

function delWeeCookie ( name )
{
	var expireNow = new Date();
	document.cookie = name + "=" + "; expires=Thu, 01-Jan-70 00:00:01 GMT" +  "; path=/; domain=.9wee.com";
}



// 开设多区时使用该函数显示选服窗口并 return false
start_game = function ()
{
	return true;
};

init_login_form = function ( token )
{
	eval ( 'var ret = ' + token + ';' );
	if ( ret && ret.loginFlag )
	{
		var html = '';
		html +='<div class="after_login"><p>尊敬的<span class="user_name1">'+ret.nickname+'</span>您好</p><p id="user_lastlogin"></p></div></p><div class="news_login_btn"><a href="javascript:server_select1();" class="play">进入游戏</a> <a class="forget_passwrod" onclick="delWeeCookie(\'weeCookie\')" href="http://passport.9wee.com/logout">退出登陆</a></div>';      	 
		document.getElementById('login_box').innerHTML = html;
		//var reg_flag = getURLVar ( 'r_flag' );
		//if ( reg_flag == 1 ) show();		
	}
	else
	{	
		var html = '';	
	 	html += '<form action="http://passport.9wee.com/login" method="post">';
		html += '<div class="age_alert">【本游戏适合18岁以上玩家】</div><div class="user"><p class="user_name"><input type="text" name="username" id="user-name" class="user_namespan" value="请输入用户名" onfocus="OnFocusFun(this,\'请输入用户名\')" onblur="OnBlurFun(this,\'请输入用户名\')"/></p><p class="user_password"><input id="showPass" type="text" value="请输入密码" class="user_passwordspan"/><input type="password" class="user_passwordspan" name="password" id="user-wp" style="display:none" /></p></div><div class="news_login_btn_right"><input class="news_login_dl" type="submit" value="登陆"> </div><p class="register"><a href="http://passport.9wee.com/getpsw" target="_blank">&diams;&nbsp;忘记密码</a> <a href="javascript:register()">&diams;&nbsp;快速注册</a></p>';
		html += '</form>';
		document.getElementById('login_box').innerHTML = html;
	}
	setWeeCookie ( 'weeCookie', token, true );
};
	


var weeCookie = getCookie ( 'weeCookie' );
    init_login_form ( weeCookie );


function OnFocusFun(element,elementvalue)
{
    if(element.value==elementvalue)
    {
        element.value="";
        element.style.color="#b04916";
		
    }
}

function OnBlurFun(element,elementvalue)
{
    if(element.value==""||element.value.replace(/\s/g,"")=="")
    {
        element.value=elementvalue;    
        element.style.color="#b04916";
    }
}

function OnFocusFun2(element,elementvalue)
{
    if(element.value==elementvalue)
    {
        element.value="";
		element.setAttribute('type', 'password');
        element.style.color="#b04916";
		
    }
}

/*密码格式调整*/ 
   $('#showPass').focus(function(){
	  var pass_value = $(this).val();
	  if(pass_value == this.defaultValue){
		  $('#showPass').hide();
		  $('#user-wp').show().focus();
	  }
  });
  $('#user-wp').blur(function(){
	  var pass_value = $(this).val();
	  if(pass_value == ''){
		  $('#showPass').show();
		  $('#user-wp').hide();
	  }
  });

  











