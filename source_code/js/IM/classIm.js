function classIm() {
    this.host = "192.168.0.7";
    this.port = "6666";
    this.swf_path = "socket.swf";
    this.debug = 0;
    this.history_length = 7;
    this.chat_length = 30;
    this.nickname = null;
    this.login_key = null;
    this.private_key = null;
    this.block_word = null;
    this.block_word_s = /<[^>]*>?|\'|\"|\\|#|\||(?:\w+:\/\/)?(?:[^.]+\.){2,}[^\s]+/gi;
    this.block_word_s2 = /<[^>]*>?|\'|\"|\\|#|(?:\w+:\/\/)?(?:[0-9a-z\-_]+\.){2,}[^\s]+/gi;
    this.block_word_s3 = /<(?:script|i?frame|style|html|body|title|link|meta|object).*>?/gi;
    this.block_time = 1000;
    this.world_desc = "欢迎进入 <span class='highlight'>聊天中心</span>！<br />请严格遵守<span class='highlight'>《互联网站禁止传播淫秽、色情等不良信息自律规范》</span>的相关规定，<br />严禁发布反动、淫秽、色情等不良信息，对违反规定者我们将主动向公安机关举报。<br />希望大家自觉遵守相关法律法规，文明交流，祝大家聊天愉快！";
    this.private_desc = "欢迎进入 <span class='highlight'>聊天中心</span>！<br />这里显示您与其他玩家的私密谈话。";
    this.delay_link = Math.round(Math.random() * 10 + 10) * 1000;
    this.sending = false;
    this.right_menu = new Array("加为好友", "查看信息");
    this.heart_beat_time = 300000;
    this.send_handle = null;
    this.channels = {
        C: {
            name: "联盟",
            view_online: true,
            desc: "这个是联盟"
        },
        R: {
            name: "场景"
        },
        M: {
            name: "师徒",
            view_online: true,
            member: {
                "50yqn": "管理员"
            }
        }
    };
    this.chat_action = {
        ti: {
            my: "你踢了 $t 一脚，$t 气喘吁吁的站了起来",
            target: "$p 踢了你一脚，你气喘吁吁的站了起来",
            world: "$p 朝石头踢了一脚，结果踢歪了，重重地摔在地上，国足的脚法",
            channel: "$p 朝石头踢了一脚，结果踢歪了，重重地摔在地上，国足的脚法"
        },
        ha: {
            my: "你朝 $t 哈哈大笑",
            target: "$p 对着你哈哈大笑",
            world: "$p 哈哈大笑",
            channel: "$p 哈哈大笑"
        },
        "@@": {
            my: "你的一双眼睛瞪得比铜铃还大！越来越大……瞪破了！",
            target: "$p 瞪着一双比铜铃还大的眼睛向你挤眉弄眼。",
            world: "$p 的一双眼睛瞪得比铜铃还大！越来越大……瞪破了！",
            channel: "$p 的一双眼睛瞪得比铜铃还大！越来越大……瞪破了！"
        }
    };
    this.operation_icon = "icon/icon-operation.gif";
    this.error_msg = {
        too_fast: "说太快了，喝口水先~",
        user_not_exist: "该用户不在线或者不存在",
        private_chat_usage: "在私聊频道<br/>请采用(/用户名 聊天内容)的方式发送私聊信息，不包含括号！",
        connecting: "正在加入聊天中心，请稍候...",
        reconnect_warning: "重连失败次数过多，请稍候刷新页面重试"
    };
    this.default_channel = 1;
    this.title_timeid = null;
    this.newMsg = new Array();
    this.send_data = new Array();
    this.chat_str = new Array();
    this.chat_user_array = new Array();
    this.chat_str_index;
    this.reconnectCount = 1;
    this.alertCount = 0;
    this.ifReconnect = true;
    this.feedback_url = "http://cs.9wee.com/";
    this.sendName = null;
    this.isIE = (navigator.appVersion.indexOf("MSIE") != -1) ? true : false;
    this.isWin = (navigator.appVersion.toLowerCase().indexOf("win") != -1) ? true : false;
    this.isOpera = (navigator.userAgent.indexOf("Opera") != -1) ? true : false
}
classIm.prototype = {
    connect: function () {
        this.connecting = true;
        this.connCount = 1;
        if (typeof window.document.socket.connect == "function") {
            if (this.debug == 1) {
                this.showStatus("连接服务器" + this.host + ":" + this.port + "，请稍候...")
            }
            //window.document.socket.SetVariable("host", this.host);
            //window.document.socket.SetVariable("port", this.port);
            window.document.socket.connect(this.host,this.port,60)
        } else {
            window.setTimeout("clsIm.connect()", 500)
        }
    },
    close: function () {
        window.document.socket.close()
    },
    push_send_data: function (a) {
        this.send_data.push(a)
    },
    send: function (b, a) {
        if (a == undefined && (this.send_data.length == 0 || this.sending)) {
            return false
        }
        if (a == undefined && typeof this.send_handle == "function") {
            b = this.send_data.shift();
            this.sending = true;
            this.send_handle(b);
            return false
        }
        b = this.private_key + "|" + b + "|" + a;
        if (this.debug == 1) {
            this.showStatus("---发送请求---" + b)
        }
        //window.document.socket.SetVariable("data", b);

		b = new Base64().encode( b );
        window.document.socket.send(b)
    },
    onConnect: function (a) {
        if (this.reconnect_id != undefined && this.connCount == 1) {
            var b = this.$(this.reconnect_id);
            b.parentNode.removeChild(b)
        }
        if (a == true) {
            if (this.debug == 1) {
                this.showStatus("连接服务器成功")
            }
            this.connected = true;
            this.connecting = false;
			var a = "G";
			a = new Base64().encode( a );
            //window.document.socket.SetVariable("data", "G");
            window.document.socket.send( a )
        } else {
            if (this.connCount == 1) {
                this.onClose();
                this.connCount++
            }
        }
    },
    onClose: function () {
        this.connected = false;
        this.joined = false;
        clearInterval(this.send_time);
        clearInterval(this.heart_beat);
        if (!this.ifReconnect) {
            this.$("im_post_content").setAttribute("disabled", true);
            return false
        }
        if (this.reconnectCount >= 15) {
            this.showStatus(this.error_msg.reconnect_warning);
            return false
        }
        this.reconnect_id = "reconnect";
        this.showStatus("连接服务器失败，正在等待第 " + this.reconnectCount + " 次重新连接...", this.reconnect_id);
        this.reconnectCount++;
        window.setTimeout("clsIm.connect();", this.delay_link);
        this.$("im_post_content").value = "正在连接服务器，请稍候...";
        this.$("im_post_content").setAttribute("disabled", true)
    },
    onData: function (a) {
		a = new Base64().decode( a );
        if (this.debug == 1) {
            this.showStatus("---返回请求---" + a)
        }
        this.defaultHandle(a)
    },
    onInit: function () {},
    init: function () {
        this.original_title = document.title;
        this.loadHtml();
        this.loadMenu();
        this.loadChatHistory();
        this.loadDom();
        this.block_word_d = new RegExp(this.block_word, "gi");
        window.setInterval("clsIm.refresh_newMsg()", 25000);
        if (!this.DetectFlashVer(9, 0, 124)) {
            this.showStatus('您使用的flash版本低于9.0.124，建议到 <br/> <a href="http://get.adobe.com/flashplayer/" target="__blank">http://get.adobe.com/flashplayer/</a> 下载安装最新的flash插件 <br/> 否则可能无法连接到聊天服务器')
        }
    },
    loadHtml: function () {
        var a = "";
        var e = "";
        var b = "";
        var g = "";
        var f = "";
        for (var d in this.channels) {
            a += '<li id="im_type_' + d + '" style="display: none;">' + this.channels[d].name + "</li>";
            f += '<a id="im_select_' + d + '" style="display: none;" href="javascript:;"><' + this.channels[d].name + "></a>";
            if (this.channels[d].view_online != undefined && this.channels[d].view_online == true) {
                g += '<div class="im_right_menu" id="im_menu_' + d + '" style="display: none;"><div class="im_right_menu_title">在线列表</div><ul id="im_menu_list_' + d + '"></ul></div>';
                b += '<ul id="im_content_' + d + '" style="display: none;" class="im_content im_splitleft"></ul>'
            } else {
                b += '<ul id="im_content_' + d + '" style="display: none;" class="im_content"></ul>'
            }
        }
        show_button = '<div id="im_extend_button" title="展开聊天中心"></div>';
        close_button = '<div id="im_close_button" title="展开/收缩聊天中心"></div>';
        var j = new Date().getTime();
        var h = '<!-- 内嵌swf --><div id="socket_container"><object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" width="0" height="0" id="socket" align="middle"><param name="allowScriptAccess" value="sameDomain" /><param name="allowFullScreen" value="false" /><param name="movie" value="' + this.swf_path + "?rand=" + j + '" /><param name="quality" value="high" /><param name="allowNetworking" value="all" /><embed src="' + this.swf_path + "?rand=" + j + '" quality="high" width="0" height="0" name="socket" align="middle" allowScriptAccess="sameDomain" allowFullScreen="false" allowNetworking="all" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" /></object></div><!-- 长条框 --><div id="im_box"><div id="im_border"><ul id="im_content_title">聊天中心</ul>' + show_button + '<ul id="im_bulletin_content"><a href="javascript:;" onclick="document.getElementById(\'im_extend_button\').onclick()">点击这里参与玩家聊天</a></ul></div></div><!-- 聊天中心 --><div id="im_inner_box" style="display: none;"><div id="im_inner_box_title" class="im_inner_box_title"><b>聊天中心</b><span style="color:red">（请您注意骗子发布虚假信息，一经发现您可以去客服中心举报。）</span></div><ul id="im_center_tab"><li class="selected" id="im_type_1">综合</li><li id="im_type_3">私聊</li>' + a + '</ul><!-- 三个消息框 --><div class="im_content_all" id="im_content_all"><div class="im_content_bg" id="im_content_bg"></div><div id="im_content"><ul id="im_content_1" class="im_content"></ul><ul id="im_content_3" style="display: none;" class="im_content im_splitleft"></ul>' + b + '<div class="im_right_menu" id="im_private_tab" style="display: none;"><ul id="im_private_tab_list"><li class="selected" id="im_private_tab_all">全部</li></ul></div>' + g + '</div></div><!-- 发送消息 --><div id="im_post_table"><div id="im_hint" style="display:none"><span id="im_hint_content"></span><span onclick="clsIm.hiddenHint();" class="im_close_tab" style="height:18px;"/></span></div><div id="im_select" style="display:none;"><div id="im_select_input"><input type="text" id="im_post_target" tabIndex="1" value="' + this.title_html(this.default_channel, false) + '"/></div><a href="javascript:void(0);" id="im_select_img"></a></div><div id="im_post"><input type="text" maxlength="75" id="im_post_content" name="post_content" disabled="true" value="' + this.error_msg.connecting + '" tabIndex="2" class="no_target"/><div id="im_emotion"></div></div>' + close_button + '</div><a id="im_close_icon" href="javascript:;" title="关闭"></a><a id="im_mini_icon" href="javascript:;" title="最小化"/></a><a id="im_report_icon" href="' + this.feedback_url + '" title="举报" target="_blank"/></a></div><ul id="im_private_menu" style="display:none;" class="im_select_menu"></ul><ul id="im_synthetical_menu" style="display:none;" class="im_select_menu"><a href="javascript:;"><世界></a>' + f + '<a href="javascript:;" class="parent">最近聊天</a></ul><div id="im_new_msg"></div>';
        var c = document.createElement("div");
        document.body.appendChild(c);
        c.id = "im_center";
        c.innerHTML = h
    },
    loadMenu: function () {
        if (this.right_menu.length == 0) {
            return false
        }
        var c = document.createElement("ul");
        c.id = "div_RightMenu";
        c.className = "im_RightMenu";
        for (var b = 0, a = this.right_menu.length; b < a; b++) {
            var d = document.createElement("li");
            d.className = "im_RightMenuItem";
            d.onmousemove = function () {
                this.className = "im_RightMenuItem_over"
            };
            d.onmouseout = function () {
                this.className = "im_RightMenuItem"
            };
            d.innerHTML = this.right_menu[b];
            d.value = b;
            c.appendChild(d)
        }
        this.$("im_center").appendChild(c)
    },
    loadDom: function () {
        var b = this;
        var g = this.$;
        var f = g("im_synthetical_menu");
        var c = g("im_private_menu");
        g("im_select_img").onclick = function () {
            var h;
            if (g("im_type_1").className == "selected") {
                h = f
            }
            if (g("im_type_3").className == "selected") {
                h = c
            }
            if (h.style.display == "none" && h.childNodes.length != 0) {
                h.style.display = ""
            } else {
                f.style.display = "none";
                c.style.display = "none"
            }
        };
        g("im_private_tab_all").onclick = function () {
            var m = g("im_content").getElementsByTagName("ul");
            for (var j = 0, h = m.length; j < h; j++) {
                if (m[j].id.match(/im_content_3_/) != null) {
                    m[j].style.display = "none"
                }
            }
            g("im_content_3").style.display = "";
            var m = g("im_private_tab_list").getElementsByTagName("li");
            for (var j = 0, h = m.length; j < h; j++) {
                m[j].className = ""
            }
            this.className = "selected";
            g("im_content_3").scrollTop = g("im_content_3").scrollHeight
        };
        var e = f.getElementsByTagName("a");
        for (var d = 0, a = e.length; d < a; d++) {
            if (e[d].className == "parent") {
                e[d].onmouseover = function () {
                    if (c.childNodes.length != 0) {
                        c.className = "im_select_menu child";
                        c.style.display = ""
                    }
                }
            } else {
                e[d].onclick = function () {
                    g("im_post_target").value = b.get_value(this);
                    f.style.display = "none";
                    if (!g("im_post_content").getAttribute("disabled")) {
                        g("im_post_content").focus()
                    }
                };
                e[d].onmouseover = function () {
                    c.style.display = "none"
                }
            }
        }
        g("im_close_icon").onclick = function () {
            g("im_inner_box").style.display = "none";
            g("im_synthetical_menu").style.display = "none";
            g("im_private_menu").style.display = "none"
        };
        g("im_mini_icon").onclick = function () {
            if (g("im_inner_box").className == "full") {
                g("im_inner_box").className = "lite";
                g("im_content_1").scrollTop = g("im_content_1").scrollHeight;
                g("im_content_all").style.height = "42px";
                g("im_content_bg").style.height = "42px";
                b.change_channel(1);
                g("im_mini_icon").title = "最大化";
                if (!g("im_post_content").getAttribute("disabled")) {
                    g("im_post_content").focus()
                }
            } else {
                g("im_inner_box").className = "full";
                g("im_content_1").scrollTop = g("im_content_1").scrollHeight;
                g("im_content_all").style.height = "300px";
                g("im_content_bg").style.height = "300px";
                g("im_mini_icon").title = "最小化";
                if (!g("im_post_content").getAttribute("disabled")) {
                    g("im_post_content").focus()
                }
            }
        };
        g("im_post_target").onclick = function () {
            g("im_post_target").select()
        };
        g("im_inner_box").onclick = function () {
            if (b.right_menu.length == 0) {
                return false
            }
            var h = b.getSrcElement();
            if (h && h.id != "im_operation_icon") {
                b.$("div_RightMenu").style.display = "none"
            }
        };
        g("im_content_1").innerHTML = '<li class="im_desc">' + this.world_desc + "</li>";
        g("im_content_3").innerHTML = '<li class="im_desc">' + this.private_desc + "</li>";
        g("im_extend_button").onclick = function () {
            g("im_inner_box").style.display = "";
            g("im_inner_box").className = "lite";
            b.change_channel(1);
            if (!g("im_post_content").getAttribute("disabled")) {
                g("im_post_content").focus()
            }
            g("im_content_1").scrollTop = g("im_content_1").scrollHeight;
            g("im_content_all").style.height = "42px";
            g("im_content_bg").style.height = "42px";
            b.set_cookie("hiddenIm", 0)
        };
        g("im_close_button").onclick = function () {
            if (g("im_inner_box").className == "lite") {
                g("im_inner_box").className = "full";
                g("im_content_1").scrollTop = g("im_content_1").scrollHeight;
                g("im_content_all").style.height = "300px";
                g("im_content_bg").style.height = "300px";
                if (!g("im_post_content").getAttribute("disabled")) {
                    g("im_post_content").focus()
                }
            } else {
                g("im_inner_box").style.display = "none";
                b.set_cookie("hiddenIm", 1)
            }
        };
        g("im_new_msg").onclick = function () {
            this.className = "";
            this.setAttribute("title", "");
            b.chat(this.sendName)
        };
        g("im_post_content").onfocus = function () {
            if (b.title_timeid != null) {
                window.clearInterval(b.title_timeid);
                document.title = b.original_title;
                b.showTitle = false
            }
            g("im_new_msg").className = "";
            g("im_new_msg").setAttribute("title", "");
            if (g("im_new_msg").className == "new") {
                this.className = "";
                this.setAttribute("title", "")
            }
            g("im_synthetical_menu").style.display = "none";
            g("im_private_menu").style.display = "none"
        };
        g("im_type_1").onclick = function () {
            g("im_select").style.display = "";
            g("im_post_content").className = "with_target";
            if (b.lastChatName != undefined) {
                g("im_post_target").value = b.lastChatName
            }
            var m = g("im_center_tab").getElementsByTagName("li");
            for (var j = 0, h = m.length; j < h; j++) {
                if (m[j].className == "selected") {
                    m[j].className = ""
                }
            }
            this.className = "selected";
            for (var j = 0, h = g("im_content").childNodes.length; j < h; j++) {
                g("im_content").childNodes[j].style.display = "none"
            }
            g("im_content_1").style.display = "";
            if (!g("im_post_content").getAttribute("disabled")) {
                g("im_post_content").focus()
            }
            g("im_content_1").scrollTop = g("im_content_1").scrollHeight
        };
        for (d in this.channels) {
            if (this.channels[d].desc) {
                g("im_content_" + d).innerHTML = '<li class="im_desc">' + this.channels[d].desc + "</li>"
            }
            g("im_type_" + d).onclick = function () {
                g("im_select").style.display = "none";
                g("im_post_content").className = "no_target";
                var m = g("im_center_tab").getElementsByTagName("li");
                for (var j = 0, h = m.length; j < h; j++) {
                    if (m[j].className == "selected") {
                        m[j].className = ""
                    }
                }
                this.className = "selected";
                for (var j = 0, h = g("im_content").childNodes.length; j < h; j++) {
                    g("im_content").childNodes[j].style.display = "none"
                }
                var n = this.id.replace("im_type_", "");
                g("im_content_" + n).style.display = "";
                if (g("im_menu_" + n) != null) {
                    g("im_menu_" + n).style.display = ""
                }
                if (!g("im_post_content").getAttribute("disabled")) {
                    g("im_post_content").focus()
                }
                g("im_content_" + n).scrollTop = g("im_content_" + n).scrollHeight
            }
        }
        g("im_type_3").onclick = function () {
            g("im_select").style.display = "";
            g("im_post_content").className = "with_target";
            g("im_private_menu").className = "im_select_menu";
            b.lastChatName = g("im_post_target").value;
            if (g("im_post_target").value.match(/<.+>/) != null) {
                g("im_post_target").value = ""
            }
            var m = g("im_center_tab").getElementsByTagName("li");
            for (var j = 0, h = m.length; j < h; j++) {
                if (m[j].className == "selected") {
                    m[j].className = ""
                }
            }
            this.className = "selected";
            for (var j = 0, h = g("im_content").childNodes.length; j < h; j++) {
                g("im_content").childNodes[j].style.display = "none"
            }
            g("im_private_tab_all").onclick();
            g("im_private_tab").style.display = "";
            if (!g("im_post_content").getAttribute("disabled")) {
                g("im_post_content").focus()
            }
            g("im_content_3").scrollTop = g("im_content_3").scrollHeight
        };
        g("im_post_content").onkeydown = function (h) {
            if (window.event) {
                k = window.event.keyCode
            } else {
                if (h.which) {
                    k = h.which
                }
            }
            var j = this.value;
            var p = g("im_post_target").value;
            if (k == 13) {
                if (b.wordFilter(j) == "") {
                    return false
                }
                if (!b.refreshBlock()) {
                    return false
                }
                if (g("im_type_3").className == "selected" || (g("im_type_1").className == "selected" && g("im_post_target").value.match(/<.+>/) == null)) {
                    if (p == "") {
                        b.showStatus("请先输入你要私聊的对象！");
                        g("im_post_target").focus();
                        return false
                    }
                    var m = '<span class="im_post_time">[' + b.getTime() + "]</span>";
                    if (p == b.nickname) {
                        b.showType3('<span class="im_inner_title">你自言自语：' + m + '</span><span style="" class="im_inner_content">' + b.wordFilter(j) + "</span>", p)
                    } else {
                        b.chat_history(p);
                        b.chat_private_tab(p);
                        b.push_send_data("M|" + p + "|" + b.wordFilter(j));
                        if (!b.action_handle(j, p, "my")) {
                            b.showType3('<span class="im_inner_title">' + b.title_html(3) + '<span class="im_call_to">你对</span>' + b.user_html(p) + '<span class="im_call_action">说：</span>' + m + '</span><span style="" class="im_inner_content">' + j + "</span>", p)
                        }
                    }
                } else {
                    if (g("im_type_1").className == "selected" && g("im_post_target").value == "<世界>") {
                        b.push_send_data("W|" + b.wordFilter(j))
                    } else {
                        if (g("im_type_1").className == "selected" && g("im_post_target").value.match(/<.+>/) != null) {
                            var q = g("im_post_target").value.replace(/<|>/g, "");
                            for (o in b.channels) {
                                if (b.channels[o].name == q) {
                                    if (b.channels[o].id == undefined) {
                                        b.showStatus("你还没有加入该频道");
                                        return false
                                    } else {
                                        b.push_send_data("C|" + o + "_" + b.channels[o].id + "|" + b.wordFilter(j))
                                    }
                                }
                            }
                        } else {
                            var s = g("im_center_tab").getElementsByTagName("li");
                            for (var o = 0, n = s.length; o < n; o++) {
                                if (s[o].className == "selected") {
                                    var r = s[o].id.replace("im_type_", "");
                                    if (b.channels[r].id == undefined) {
                                        b.showStatus("你还没有加入该频道");
                                        return false
                                    } else {
                                        b.push_send_data("C|" + r + "_" + b.channels[r].id + "|" + b.wordFilter(j))
                                    }
                                }
                            }
                        }
                    }
                }
                this.value = "";
                if (b.chat_str.length >= 10) {
                    b.chat_str.shift()
                }
                b.chat_str.push(j);
                b.chat_str_index = b.chat_str.length;
                return false
            }
            if (b.chat_str_index != undefined) {
                if (k == 38) {
                    if (b.chat_str_index < 0) {
                        return false
                    }
                    if (b.chat_str_index > 0) {
                        b.chat_str_index--
                    }
                    this.value = b.chat_str[b.chat_str_index]
                }
                if (k == 40) {
                    if (b.chat_str_index > b.chat_str.length - 1) {
                        return false
                    }
                    if (b.chat_str_index == b.chat_str.length - 1) {
                        this.value = "";
                        b.chat_str_index++;
                        return false
                    }
                    if (b.chat_str_index < b.chat_str.length - 1) {
                        b.chat_str_index++
                    }
                    this.value = b.chat_str[b.chat_str_index]
                }
            }
        };
        g("im_post_target").onkeydown = function (h) {
            if (window.event) {
                k = window.event.keyCode
            } else {
                if (h.which) {
                    k = h.which
                }
            }
            if (k == 13) {
                g("im_post_content").focus()
            }
        }
    },
    loadChatHistory: function () {
        var c = this.get_cookie("chat_user_array");
        if (c != null) {
            this.chat_user_array = c.split(",");
            for (var d = 0, a = this.chat_user_array.length; d < a; d++) {
                var b = document.createElement("a");
                b.setAttribute("href", "javascript:;");
                b.innerHTML = this.chat_user_array[d];
                b.onclick = function () {
                    clsIm.$("im_private_menu").style.display = "none";
                    clsIm.call_msg(this)
                };
                this.$("im_private_menu").appendChild(b)
            }
        }
    },
    refresh_newMsg: function () {
        if (window.pBulletinScroller != undefined) {
            clearInterval(window.pBulletinInterval);
            window.pBulletinScroller.scrollTo(0, 0);
            window.pBulletinScroller.contentIsCloned = false;
            clearInterval(window.pBulletinScroller.interval)
        }
        var c = "";
        window.pBulletinScroller = new scrollingBox("pBulletinScroller", "im_border", "im_bulletin_content");
        if (this.newMsg.length == 0) {
            c = '<a onclick="document.getElementById(\'im_extend_button\').onclick()" href="javascript:;">点击这里参与玩家聊天</a>'
        } else {
            if (this.newMsg.length > 1) {
                window.pBulletinInterval = setInterval("pBulletinScroller.autoScroll(0)", 5000);
                this.$("im_bulletin_content").onmouseover = function () {
                    pBulletinScroller.pause()
                };
                this.$("im_bulletin_content").onmouseout = function () {
                    pBulletinScroller.resume()
                }
            }
            for (var b = 0, a = this.newMsg.length; b < a; b++) {
                c += this.newMsg[b]
            }
        }
        pBulletinScroller.setContent(c)
    },
    showStatus: function (b, a) {
        var h;
        var e;
        var j = this.$("im_center_tab").getElementsByTagName("li");
        statusTag = document.createElement("li");
        statusTag.innerHTML = b;
        statusTag.className = "font0";
        if (a != undefined) {
            statusTag.id = a
        }
        if (h == undefined) {
            for (var f = 0, c = j.length; f < c; f++) {
                if (j[f].className == "selected") {
                    h = j[f].id.replace("im_type_", "")
                }
            }
        }
        if (h == 3) {
            var j = this.$("im_private_tab_list").getElementsByTagName("li");
            for (var f = 0, c = j.length; f < c; f++) {
                if (j[f].className == "selected" && j[f].id != "im_private_tab_all") {
                    e = j[f].id.replace("im_private_tab_", "")
                }
            }
            if (e != undefined) {
                private_statusTag = document.createElement("li");
                private_statusTag.innerHTML = b;
                private_statusTag.className = "font0";
                var d = this.$("im_content_3_" + e);
                if (d.childNodes.length >= this.chat_length) {
                    d.removeChild(d.childNodes[1])
                }
                d.appendChild(private_statusTag);
                d.scrollTop = d.scrollHeight
            }
        }
        var g = this.$("im_content_" + h);
        if (g.childNodes.length >= this.chat_length) {
            g.removeChild(g.childNodes[1])
        }
        g.appendChild(statusTag);
        g.scrollTop = g.scrollHeight
    },
    showBulletin: function (a) {
        if (this.newMsg.length >= 5) {
            this.newMsg.shift()
        }
        this.newMsg.push('<li class="font_b">' + a + "</li>")
    },
    showType1: function (b, c) {
        statusTag = document.createElement("li");
        statusTag.innerHTML = b;
        if (c == undefined) {
            statusTag.className = "font1"
        } else {
            statusTag.className = "font" + c
        }
        var a = this.$("im_content_1");
        if (a.childNodes.length >= this.chat_length) {
            a.removeChild(this.$("im_content_1").firstChild)
        }
        a.appendChild(statusTag);
        this.$("im_content_1").scrollTop = this.$("im_content_1").scrollHeight
    },
    showType3: function (d, c) {
        this.showType1(d, 3);
        statusTag = document.createElement("li");
        statusTag.innerHTML = d;
        statusTag.className = "font3";
        var a = this.$("im_content_3");
        if (a.childNodes.length >= this.chat_length) {
            a.removeChild(this.$("im_content_3").firstChild)
        }
        a.appendChild(statusTag);
        if (this.$("im_content_3_" + c) == null) {
            this.chat_private_tab(c)
        }
        var b = this.$("im_content_3_" + c);
        statusTag1 = document.createElement("li");
        statusTag1.innerHTML = d;
        statusTag1.className = "font3";
        if (b.childNodes.length >= this.chat_length) {
            b.removeChild(b.firstChild)
        }
        b.appendChild(statusTag1);
        b.scrollTop = b.scrollHeight;
        if (this.$("im_private_tab_" + c).className != "selected") {
            this.$("im_private_tab_" + c).className = "new"
        }
        this.$("im_content_3").scrollTop = this.$("im_content_3").scrollHeight;
        if (this.$("im_type_3").className != "selected") {
            this.$("im_type_3").className = "new"
        }
    },
    showTypeo: function (c, b) {
        if (!this.channels[b]) {
            return false
        }
        if (this.channels[b].show_in_global == null || this.channels[b].show_in_global == true) {
            this.showType1(c, b)
        }
        statusTag = document.createElement("li");
        statusTag.innerHTML = c;
        statusTag.className = "font" + b;
        var a = this.$("im_content_" + b);
        if (a.childNodes.length >= this.chat_length) {
            a.removeChild(a.firstChild)
        }
        a.appendChild(statusTag);
        a.scrollTop = a.scrollHeight;
        if (this.$("im_type_" + b).className != "selected") {
            this.$("im_type_" + b).className = "new"
        }
    },
    showOnline: function (e, d) {
        var g = e.split(",");
        if (this.$("im_menu_list_" + d) != null) {
            this.$("im_menu_list_" + d).innerHTML = ""
        }
        for (var c = 0, a = g.length; c < a; c++) {
            if (g[c] != "") {
                var f = this.user_html(g[c]);
                if (this.channels[d] != undefined && this.channels[d].member != undefined && this.channels[d].member[g[c]] != undefined) {
                    f = this.channels[d].member[g[c]] + " " + f
                }
                var b = document.createElement("li");
                b.innerHTML = f;
                b.className = "font_list";
                this.$("im_menu_list_" + d).appendChild(b)
            }
        }
    },
    addOnline: function (c, b) {
        c = this.user_html(c);
        var a = document.createElement("li");
        a.innerHTML = c;
        a.className = "font_list";
        this.$("im_menu_list_" + b).appendChild(a)
    },
    rmOnline: function (d, c) {
        for (var b = 0, a = this.$("im_menu_list_" + c).childNodes.length; b < a; b++) {
            if (this.get_value(this.$("im_menu_list_" + c).childNodes[b]) == d) {
                this.$("im_menu_list_" + c).removeChild(this.$("im_menu_list_" + c).childNodes[b])
            }
        }
    },
    defaultHandle: function (b) {
        chat_time = '<span class="im_post_time">[' + this.getTime() + "]</span>";
        arr = b.split("|");
        if (this.nickname == arr[2]) {
            this.private_key = arr[0];
            this.sending = false
        }
        if (this.other_handle(b)) {
            return false
        }
        var h = this.wordFilter2(b);
        arr = h.split("|");
        arr[2] = b.split("|")[2];
        switch (arr[1]) {
        case "J":
            if (arr[3] == "88") {
                this.joined = true;
                if (this.debug == 1) {
                    this.showStatus("加入聊天中心成功")
                }
                if (this.reconnectCount > 1) {
                    this.reconnectCount = 1;
                    for (var c in this.channels) {
                        if (this.channels[c].id != undefined) {
                            var j = this.channels[c].id;
                            this.channels[c].id = undefined;
                            this.join_channel(c, j)
                        }
                    }
                }
                this.heart_beat = window.setInterval("clsIm.push_send_data('X');", this.heart_beat_time);
                this.send_time = window.setInterval("clsIm.send();", 500);
                var f = this.$("im_post_content");
                f.removeAttribute("disabled");
                f.value = "";
                f.focus()
            }
            if (arr[3] == "99") {
                this.showStatus("用户" + this.nickname + "已在其他地点登陆，连接失败");
                this.ifReconnect = false
            }
            break;
        case "M":
            if (arr[3] == "88") {
                if (this.error_msg.user_not_exist != "") {
                    this.showStatus(this.error_msg.user_not_exist)
                }
            } else {
                if (arr[2] != this.nickname) {
                    if (!this.action_handle(arr[3], arr[2], "target")) {
                        this.send_msg(3, arr[2], "悄悄跟你说：", arr[3], false)
                    }
                    if (this.showTitle != true && this.$("im_type_3").className != "selected") {
                        this.title_timeid = window.setInterval("clsIm.changeTitle()", 1000);
                        this.$("im_new_msg").className = "new";
                        this.$("im_new_msg").setAttribute("title", "您有一条新私聊信息");
                        this.$("im_new_msg").sendName = arr[2]
                    }
                    if (!$("im_post_content").getAttribute("disabled")) {
                        this.$("im_post_content").focus()
                    }
                }
            }
            break;
        case "W":
            if (!this.action_handle(arr[3], arr[2], "world")) {
                this.send_msg(1, arr[2], "吼：", arr[3], false);
                this.showBulletin(this.title_html(1) + '<a title="查看人物信息" href="javascript:;" onclick="clsIm.view_user(\'' + arr[2] + "');\">" + arr[2] + "</a>：" + arr[3])
            }
            break;
        case "C":
            var a;
            var g = arr[3].split("_")[0];
            var d = this.channels[g].name;
            if (this.channels[g].view_online && this.channels[g].member != undefined && this.channels[g].member[arr[2]] != undefined) {
                a = this.channels[g].member[arr[2]] + " "
            } else {
                a = ""
            }
            if (!this.action_handle(arr[4], arr[2], "channel", g)) {
                this.showTypeo('<span class="im_inner_title">' + this.title_html(g) + a + this.user_html(arr[2]) + '</a><span class="im_call_action">说：</span>' + chat_time + '</span><span style="" class="im_inner_content">' + arr[4] + "</span>", g);
                this.showBulletin(this.title_html(g) + '<a title="查看人物信息" href="javascript:;" onclick="clsIm.view_user(\'' + arr[2] + "');\">" + a + arr[2] + "</a>：" + arr[4])
            }
            break;
        case "S":
            var l = arr[3].split("::");
            if (l[0] == "D") {
                this.kickUser(l[1])
            } else {
                if (l[0] == "R") {
                    this.send_msg(0, "", "", "系统将在" + l[1] + "秒后刷新您的浏览器", false);
                    var e = document.createElement("script");
                    e.type = "text/javascript";
                    e.text = "setTimeout('window.location.reload()', " + l[1] + "000)";
                    document.body.appendChild(e)
                } else {
                    if (l[0] == "N") {
                        this.hintTime = window.setTimeout("clsIm.hiddenHint()", l[1] + "000");
                        this.$("im_hint_content").innerHTML = l[2];
                        this.$("im_hint").style.display = "";
                        if (460 < this.$("im_hint_content").offsetWidth) {
                            this.$("im_hint_content").innerHTML = '<marquee behavior="scroll" width="460" onmouseover="this.stop()" onmouseout="this.start()" scrolldelay="200">' + l[2] + "</marquee>";
                            this.$("im_hint_content").childNodes[0].start()
                        }
                    } else {
                        this.send_msg(0, "", "", arr[3], false)
                    }
                }
            }
            break;
        case "L":
            var g = arr[3].split("_")[0];
            if (arr[4] == "88") {
                this.addOnline(arr[2], g)
            } else {
                if (arr[4] == "99") {
                    this.rmOnline(arr[2], g)
                } else {
                    arr[4] = b.split("|")[4];
                    this.showOnline(arr[4], g)
                }
            }
            break;
        case "U":
        case "P":
            if (arr[4] != "X") {
                var g = arr[4].split("_")[0];
                this.channels[g].id = undefined;
                this.$("im_type_" + g).style.display = "none";
                this.$("im_select_" + g).style.display = "none";
                if (arr[3] == "X") {
                    this.$("im_type_1").onclick()
                }
            }
            if (arr[3] != "X") {
                var g = arr[3].split("_")[0];
                this.channels[g].id = arr[3].split("_")[1];
                this.$("im_type_" + g).style.display = "";
                this.$("im_select_" + g).style.display = "";
                if (arr[4] != "X") {
                    this.$("im_content_" + g).innerHTML = ""
                }
            }
            break;
        case "G":
            if (this.debug == 1) {
                this.showStatus("以" + this.nickname + "加入聊天中心，请稍候...")
            }
            var b = arr[0] + "|J|" + this.nickname + "|" + this.login_key + "|0";
			b = new Base64().encode( b );
            //window.document.socket.SetVariable("data", b);
            window.document.socket.send(b);
            break;
        default:
        }
    },
    other_handle: function (a) {},
    $: function (a) {
        return document.getElementById(a)
    },
    view_user: function (a) {
        alert("查看角色信息接口")
    },
    set_zindex: function (a) {
        this.$("im_box").style.zIndex = a;
        this.$("im_inner_box").style.zIndex = a;
        this.$("im_synthetical_menu").style.zIndex = this.$("im_inner_box").style.zIndex + 1;
        this.$("im_private_menu").style.zIndex = this.$("im_inner_box").style.zIndex + 1;
        this.$("im_new_msg").style.zIndex = this.$("im_inner_box").style.zIndex + 1
    },
    chat: function (a) {
        this.$("im_inner_box").style.display = "";
        if (this.$("im_type_3").className != "selected" && this.$("im_type_1").className != "selected") {
            this.$("im_inner_box").className = "full";
            this.$("im_type_3").onclick()
        }
        this.$("im_post_target").value = a;
        this.$("im_post_target").readonly = true;
        if (!this.$("im_post_content").getAttribute("disabled")) {
            this.$("im_post_content").focus()
        }
    },
    change_channel: function (a) {
        this.$("im_type_" + a).onclick()
    },
    rightclk: function (e, f) {
        if (this.right_menu.length == 0) {
            return false
        }
        var c = this;
        var a = this.$("div_RightMenu");
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        if (im_browser.msie && im_browser.version < 7) {
            this.mouseX -= this.$("im_center").offsetLeft;
            this.mouseY -= this.$("im_center").offsetTop
        }
        for (var d = 0, b = a.childNodes.length; d < b; d++) {
            a.childNodes[d].onclick = function () {
                a.style.display = "none";
                c.menu_click(this.value, clsIm.get_value(f))
            }
        }
        a.style.display = "block";
        if ((this.mouseX + a.offsetWidth - document.documentElement.scrollLeft) > document.documentElement.clientWidth) {
            a.style.left = this.mouseX - a.offsetWidth + document.documentElement.scrollLeft + "px"
        } else {
            a.style.left = this.mouseX + document.documentElement.scrollLeft + "px";
            a.style.left = this.mouseX + "px";
        }
        if ((this.mouseY + a.offsetHeight - document.documentElement.scrollTop) > document.documentElement.clientHeight) {
            a.style.top = this.mouseY - a.offsetHeight + document.documentElement.scrollTop + "px"
        } else {
            a.style.top = this.mouseY + document.documentElement.scrollTop + "px";
            a.style.top = this.mouseY + "px";
        }
    },
    refreshBlock: function () {
        var c = new Date();
        var b = c.getTime();
        var a = this.get_cookie("send_time");
        if ((b - a) < this.block_time) {
            this.showStatus(this.error_msg.too_fast);
            return false
        }
        this.set_cookie("send_time", b);
        return true
    },
    getTime: function () {
        var c = new Date();
        var a = c.getHours();
        var d = c.getMinutes();
        var b = c.getSeconds();
        a = a < 10 ? "0" + a : a;
        d = d < 10 ? "0" + d : d;
        b = b < 10 ? "0" + b : b;
        chat_time = a + ":" + d + ":" + b;
        return chat_time
    },
    wordFilter2: function (a) {
        if (a.split("|")[1] == "S") {
            a = a.replace(/\n/g, "<br/>");
            a = a.replace(this.block_word_s3, "")
        } else {
            a = a.replace(this.block_word_s2, "");
            a = a.replace(this.block_word_d, "[屏蔽字符]")
        }
        return a
    },
    wordFilter: function (a) {
        a = a.replace(/(^\s*|\s*$)/g, "");
        if (a.match(this.block_word_d)) {
            this.showStatus("您的言语含有系统屏蔽字符！");
            return false
        }
        a = a.replace(this.block_word_s, "");
        return a
    },
    join_channel: function (b, c) {
        var a = b + "_" + c;
        if (this.channels[b].id != c) {
            if (this.channels[b].id != undefined) {
                this.push_send_data("P|" + a + "|" + b + "_" + this.channels[b].id)
            } else {
                this.push_send_data("P|" + a + "|X")
            }
        }
    },
    leave_channel: function (b, c) {
        var a = b + "_" + c;
        if (this.channels[b].id == c) {
            this.push_send_data("P|X|" + a)
        }
    },
    close_channel: function (b, c) {
        var a = b + "_" + c;
        if (this.channels[b].id == c) {
            this.push_send_data("U|" + a)
        }
    },
    menu_click: function (a, b) {
        alert(b + "右键菜单接口" + a)
    },
    call_msg: function (a) {
        this.chat(this.get_value(a))
    },
    call_title: function (a) {
        if (this.$("im_type_1").className == "selected") {
            this.$("im_post_target").value = this.get_value(a);
            if (!this.$("im_post_content").getAttribute("disabled")) {
                this.$("im_post_content").focus()
            }
        }
    },
    action_handle: function (e, g, a, c) {
        chat_time = '<span class="im_post_time">[' + this.getTime() + "]</span>";
        if (this.chat_action[e] == undefined || this.chat_action[e][a] == undefined) {
            return false
        }
        var d = this.user_html(g);
        var b = '<a title="查看人物信息" href="javascript:;" onclick="clsIm.view_user(\'' + g + "');\">" + g + "</a>";
        switch (a) {
        case "my":
            this.showType3(this.title_html(3) + this.chat_action[e][a].replace(/\$t/g, d) + chat_time, g);
            break;
        case "target":
            this.showType3(this.title_html(3) + this.chat_action[e][a].replace(/\$p/g, d) + chat_time, g);
            break;
        case "world":
            this.showType1(this.title_html(1) + this.chat_action[e][a].replace(/\$p/g, d) + chat_time);
            this.showBulletin(this.title_html(1) + this.chat_action[e][a].replace(/\$p/g, b));
            break;
        case "channel":
            var f;
            if (this.channels[c].view_online && this.channels[c].member != undefined && this.channels[c].member[g] != undefined) {
                f = this.channels[c].member[g] + " "
            } else {
                f = ""
            }
            this.showTypeo(this.title_html(c) + this.chat_action[e][a].replace(/\$p/g, f + d) + chat_time, c);
            this.showBulletin(this.title_html(c) + this.chat_action[e][a].replace(/\$p/g, f + b));
            break;
        default:
        }
        return true
    },
    chat_history: function (e) {
        for (var d = 0, a = this.chat_user_array.length; d < a; d++) {
            if (this.chat_user_array[d] == e) {
                return false
            }
        }
        if (this.chat_user_array.length >= this.history_length) {
            this.chat_user_array.shift()
        }
        this.chat_user_array.push(e);
        this.set_cookie("chat_user_array", this.chat_user_array.join(","));
        var b = document.createElement("a");
        b.innerHTML = e;
        b.setAttribute("href", "javascript:;");
        b.onclick = function () {
            clsIm.$("im_private_menu").style.display = "none";
            clsIm.call_msg(this)
        };
        var c = this.$("im_private_menu");
        if (c.childNodes.length >= this.history_length) {
            c.removeChild(c.firstChild)
        }
        c.appendChild(b)
    },
    chat_private_tab: function (f) {
        var e = this.$("im_private_tab_list").getElementsByTagName("li");
        for (var d = 0, b = e.length; d < b; d++) {
            e[d].className = ""
        }
        if (this.$("im_private_tab_" + f) == null) {
            var c = document.createElement("li");
            c.innerHTML = '<div class="im_tab_name" onclick="clsIm.click_private_tab(this)">' + f + '</div><div class="im_close_tab" onclick="clsIm.close_private_tab(\'' + f + "');\"></div>";
            if (this.$("im_type_3").className == "selected") {
                c.className = "selected"
            }
            c.id = "im_private_tab_" + f;
            this.$("im_private_tab_list").appendChild(c)
        } else {
            this.$("im_private_tab_" + f).className = "selected"
        }
        this.$("im_private_tab").scrollTop = $("im_private_tab").scrollHeight;
        this.$("im_content_3").style.display = "none";
        var e = this.$("im_content").getElementsByTagName("ul");
        for (var d = 0, b = e.length; d < b; d++) {
            if (e[d].id.match(/im_content_3_/) != null) {
                e[d].style.display = "none"
            }
        }
        if (this.$("im_content_3_" + f) == null) {
            var a = document.createElement("ul");
            a.id = "im_content_3_" + f;
            a.className = "im_content im_splitleft";
            if (this.$("im_type_3").className != "selected") {
                a.style.display = "none"
            }
            a.innerHTML = '<li class="im_desc">' + this.private_desc + "</li>";
            this.$("im_content").insertBefore(a, this.$("im_content_3"))
        } else {
            if (this.$("im_type_3").className == "selected") {
                this.$("im_content_3_" + f).style.display = ""
            }
        }
    },
    click_private_tab: function (d) {
        this.call_msg(d);
        var c = this.$("im_content").getElementsByTagName("ul");
        this.$("im_content_3").style.display = "none";
        for (var b = 0, a = c.length; b < a; b++) {
            if (c[b].id.match(/im_content_3_/) != null) {
                c[b].style.display = "none"
            }
        }
        this.$("im_content_3_" + this.get_value(d)).style.display = "";
        this.$("im_content_3_" + this.get_value(d)).scrollTop = this.$("im_content_3_" + this.get_value(d)).scrollHeight;
        var c = this.$("im_private_tab_list").getElementsByTagName("li");
        for (var b = 0, a = c.length; b < a; b++) {
            c[b].className = ""
        }
        d.parentNode.className = "selected"
    },
    close_private_tab: function (a) {
        if (this.$("im_content_3_" + a).style.display == "") {
            this.$("im_content_3").style.display = "";
            this.$("im_private_tab_all").className = "selected"
        }
        this.$("im_content_3_" + a).parentNode.removeChild(this.$("im_content_3_" + a));
        this.$("im_private_tab_" + a).parentNode.removeChild(this.$("im_private_tab_" + a));
        return false
    },
    changeTitle: function () {
        this.showTitle = true;
        if (this.alertCount) {
            document.title = "【新消息】"
        } else {
            document.title = "【　　　】"
        }
        this.alertCount = 1 - this.alertCount
    },
    send_msg: function (e, g, d, f, b, a, c) {
        if (!a && !this.joined) {
            return false
        }
        if (c == undefined) {
            c = this.getTime()
        }
        c = '<span class="im_post_time">[' + c + "]</span>";
        if (b != false) {
            this.show_channel(e)
        }
        if (f == undefined) {
            f = ""
        }
        switch (e) {
        case 3:
            this.showType3('<span class="im_inner_title">' + this.title_html(3) + this.user_html(g) + '<span class="im_call_action">' + d + "</span>" + c + '</span><span style="" class="im_inner_content"> ' + f + "</span>", g);
            break;
        case 1:
            this.showType1('<span class="im_inner_title">' + this.title_html(1) + this.user_html(g) + '<span class="im_call_action">' + d + "</span>" + c + '</span><span style="" class="im_inner_content">' + f + "</span>");
            break;
        case 0:
            this.showStatus('<span class="im_inner_title">' + this.title_html(0) + c + '</span><span style="" class="im_inner_content">' + f + "</span>");
            break;
        default:
        }
        return true
    },
    show_channel: function (a) {
        this.$("im_inner_box").style.display = "";
        this.$("im_inner_box").className = "full";
        if (a != 0) {
            this.$("im_type_" + a).onclick()
        }
    },
    user_html: function (a) {
        return '<span id="im_user_html"><a href="javascript:;" class="im_call_msg" onclick="clsIm.call_msg(this);">' + a + '</a><img src="' + this.operation_icon + '" align="absmiddle" onclick="clsIm.rightclk(event, this.previousSibling);" width="13" height="12" id="im_operation_icon" title="操作"/></span>'
    },
    get_value: function (a) {
        return this.isIE ? a.innerText : a.textContent
    },
    get_cookie: function (d) {
        var b = document.cookie;
        var c, a;
        c = b.indexOf(d);
        if (c != -1) {
            c += (d.length + 1);
            a = b.indexOf(";", c);
            if (a == -1) {
                a = document.cookie.length
            }
            return unescape(b.substring(c, a))
        }
        return null
    },
    set_cookie: function (b, a) {
        document.cookie = b + "=" + escape(a)
    },
    title_html: function (a, c) {
        var d;
        var b = "<title>";
        if (a == 3) {
            d = b.replace("title", "私聊");
            d = '<span class="im_call_title" style="cursor:default;">' + d + "</span>"
        } else {
            if (a == 0) {
                d = b.replace("title", "系统");
                d = '<span class="im_call_title" style="cursor:default;">' + d + "</span>"
            } else {
                switch (a) {
                case 1:
                    d = b.replace("title", "世界");
                    break;
                default:
                    d = b.replace("title", this.channels[a].name)
                }
                if (c != false) {
                    d = '<span onclick="clsIm.call_title(this);" class="im_call_title">' + d + "</span>"
                }
            }
        }
        return d
    },
    set_innerbox_class: function (a) {
        switch (a) {
        case "lite":
            this.change_channel(1);
            this.$("im_inner_box").style.display = "";
            this.$("im_inner_box").className = "lite";
            this.$("im_mini_icon").title = "最大化";
            break;
        case "full":
            this.change_channel(1);
            this.$("im_inner_box").style.display = "";
            this.$("im_inner_box").className = "full";
            this.$("im_mini_icon").title = "最小化";
            break;
        default:
        }
    },
    searchEvent: function () {
        if (window.event) {
            return window.event
        }
        var b = this.searchEvent.caller;
        while (b != null) {
            var a = b.arguments[0];
            if (a) {
                if (a.constructor == MouseEvent || a.constructor == Event) {
                    return a
                }
            }
            b = b.caller
        }
        return null
    },
    getSrcElement: function () {
        try {
            var a = this.searchEvent();
            var c = a.target;
            if (typeof(a.target) != "object") {
                var c = a.srcElement
            }
            return c
        } catch (b) {}
    },
    send_queue: function (b, a, c) {
        if (!this.joined) {
            return false
        }
        switch (b) {
        case 3:
            this.push_send_data("M|" + c + "|" + a);
            break;
        default:
        }
        return true
    },
    ControlVersion: function () {
        var a;
        var b;
        var c;
        try {
            b = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
            a = b.GetVariable("$version")
        } catch (c) {}
        if (!a) {
            try {
                b = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
                a = "WIN 6,0,21,0";
                b.AllowScriptAccess = "always";
                a = b.GetVariable("$version")
            } catch (c) {}
        }
        if (!a) {
            try {
                b = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.3");
                a = b.GetVariable("$version")
            } catch (c) {}
        }
        if (!a) {
            try {
                b = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.3");
                a = "WIN 3,0,18,0"
            } catch (c) {}
        }
        if (!a) {
            try {
                b = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
                a = "WIN 2,0,0,11"
            } catch (c) {
                a = -1
            }
        }
        return a
    },
    GetSwfVer: function () {
        var g = -1;
        if (navigator.plugins != null && navigator.plugins.length > 0) {
            if (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]) {
                var f = navigator.plugins["Shockwave Flash 2.0"] ? " 2.0" : "";
                var a = navigator.plugins["Shockwave Flash" + f].description;
                var e = a.split(" ");
                var c = e[2].split(".");
                var h = c[0];
                var b = c[1];
                var d = e[3];
                if (d == "") {
                    d = e[4]
                }
                if (d[0] == "d") {
                    d = d.substring(1)
                } else {
                    if (d[0] == "r") {
                        d = d.substring(1);
                        if (d.indexOf("d") > 0) {
                            d = d.substring(0, d.indexOf("d"))
                        }
                    }
                }
                var g = h + "." + b + "." + d
            }
        } else {
            if (navigator.userAgent.toLowerCase().indexOf("webtv/2.6") != -1) {
                g = 4
            } else {
                if (navigator.userAgent.toLowerCase().indexOf("webtv/2.5") != -1) {
                    g = 3
                } else {
                    if (navigator.userAgent.toLowerCase().indexOf("webtv") != -1) {
                        g = 2
                    } else {
                        if (this.isIE && this.isWin && !this.isOpera) {
                            g = this.ControlVersion()
                        }
                    }
                }
            }
        }
        return g
    },
    DetectFlashVer: function (f, d, c) {
        versionStr = this.GetSwfVer();
        if (versionStr == -1) {
            return false
        } else {
            if (versionStr != 0) {
                if (this.isIE && this.isWin && !this.isOpera) {
                    tempArray = versionStr.split(" ");
                    tempString = tempArray[1];
                    versionArray = tempString.split(",")
                } else {
                    versionArray = versionStr.split(".")
                }
                var e = versionArray[0];
                var a = versionArray[1];
                var b = versionArray[2];
                if (e > parseFloat(f)) {
                    return true
                } else {
                    if (e == parseFloat(f)) {
                        if (a > parseFloat(d)) {
                            return true
                        } else {
                            if (a == parseFloat(d)) {
                                if (b >= parseFloat(c)) {
                                    return true
                                }
                            }
                        }
                    }
                }
                return false
            }
        }
    },
    kickUser: function (e) {
        var c = this.$("im_content_1").getElementsByTagName("a");
        var d = new Array();
        for (var b = 0, a = c.length; b < a; b++) {
            if (c[b].className == "im_call_msg" && this.get_value(c[b]) == e) {
                d.push(c[b].parentNode.parentNode.parentNode)
            }
        }
        for (var b in d) {
            this.$("im_content_1").removeChild(d[b])
        }
    },
    hiddenHint: function () {
        this.$("im_hint").style.display = "none";
        window.clearTimeout(this.hintTime);
        this.$("im_hint_content").innerHTML = ""
    }
};
var im_browser = (function () {
    var a = navigator.userAgent.toLowerCase();
    return {
        version: (a.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [])[1],
        safari: /webkit/.test(a),
        opera: /opera/.test(a),
        msie: /msie/.test(a) && !/opera/.test(a),
        mozilla: /mozilla/.test(a) && !/(compatible|webkit)/.test(a)
    }
})();

function Base64() {  
   
    // private property  
    _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";  
   
    // public method for encoding  
    this.encode = function (input) {  
        var output = "";  
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;  
        var i = 0;  
        input = _utf8_encode(input);  
        while (i < input.length) {  
            chr1 = input.charCodeAt(i++);  
            chr2 = input.charCodeAt(i++);  
            chr3 = input.charCodeAt(i++);  
            enc1 = chr1 >> 2;  
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);  
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);  
            enc4 = chr3 & 63;  
            if (isNaN(chr2)) {  
                enc3 = enc4 = 64;  
            } else if (isNaN(chr3)) {  
                enc4 = 64;  
            }  
            output = output +  
            _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +  
            _keyStr.charAt(enc3) + _keyStr.charAt(enc4);  
        }  
        return output;  
    }  
   
    // public method for decoding  
    this.decode = function (input) {  
        var output = "";  
        var chr1, chr2, chr3;  
        var enc1, enc2, enc3, enc4;  
        var i = 0;  
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");  
        while (i < input.length) {  
            enc1 = _keyStr.indexOf(input.charAt(i++));  
            enc2 = _keyStr.indexOf(input.charAt(i++));  
            enc3 = _keyStr.indexOf(input.charAt(i++));  
            enc4 = _keyStr.indexOf(input.charAt(i++));  
            chr1 = (enc1 << 2) | (enc2 >> 4);  
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);  
            chr3 = ((enc3 & 3) << 6) | enc4;  
            output = output + String.fromCharCode(chr1);  
            if (enc3 != 64) {  
                output = output + String.fromCharCode(chr2);  
            }  
            if (enc4 != 64) {  
                output = output + String.fromCharCode(chr3);  
            }  
        }  
        output = _utf8_decode(output);  
        return output;  
    }  
   
    // private method for UTF-8 encoding  
    _utf8_encode = function (string) {  
        string = string.replace(/\r\n/g,"\n");  
        var utftext = "";  
        for (var n = 0; n < string.length; n++) {  
            var c = string.charCodeAt(n);  
            if (c < 128) {  
                utftext += String.fromCharCode(c);  
            } else if((c > 127) && (c < 2048)) {  
                utftext += String.fromCharCode((c >> 6) | 192);  
                utftext += String.fromCharCode((c & 63) | 128);  
            } else {  
                utftext += String.fromCharCode((c >> 12) | 224);  
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);  
                utftext += String.fromCharCode((c & 63) | 128);  
            }  
   
        }  
        return utftext;  
    }  
   
    // private method for UTF-8 decoding  
    _utf8_decode = function (utftext) {  
        var string = "";  
        var i = 0;  
        var c = c1 = c2 = 0;  
        while ( i < utftext.length ) {  
            c = utftext.charCodeAt(i);  
            if (c < 128) {  
                string += String.fromCharCode(c);  
                i++;  
            } else if((c > 191) && (c < 224)) {  
                c2 = utftext.charCodeAt(i+1);  
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));  
                i += 2;  
            } else {  
                c2 = utftext.charCodeAt(i+1);  
                c3 = utftext.charCodeAt(i+2);  
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));  
                i += 3;  
            }  
        }  
        return string;  
    }  
}  
