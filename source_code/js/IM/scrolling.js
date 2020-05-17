/**** 图片滚动类 ****

调用方法：

var scroller = new scrollingBox ( 'scroller', 'scrolling-box', 'scrolling-container' );
scroller.scrollLeft ();
scroller.scrollRight ();

配套样式：

#scrolling-box {
	width: 235px;
	height: 60px;
}
#scrolling-box .control-left, #scrolling-box .control-right {
	float: left;
	line-height: 60px;
	width: 20px;
	text-align: center;
	color: white;
	background: black;
	cursor: pointer;
}

#scrolling-container {
	float: left;
	width: 195px;
	height: 60px;
	overflow: hidden;
}

*****************/

function scrollingBox ( className, boxId, containerId )
{
	this.speed = 3; // 速度 (越大越快)
	this.className = className;
	this.objBox = document.getElementById ( boxId );
	this.objContainer = document.getElementById ( containerId );
	this.xScrollTo = 0;
	this.yScrollTo = 0;
	this.interval = null;
	this.contentIsCloned = false;
	this.autoScrollPaused = false;

	this.setContent = function ( html )
	{
		this.objContainer.innerHTML = html;
		this.contentIsCloned = false;
		this.objContainer.scrollTop = this.objContainer.scrollLeft = 0;
	};

	this.scrollTo = function ( x, y )
	{
		if ( typeof ( eval ( this.className ) ) != 'object' )
		{
			return false;
		}

		if ( this.interval == null )
		{
			this.xScrollTo = x;
			this.yScrollTo = y;
			this.interval = setInterval ( this.className + '.scrolling ()', 50 );
		}
	};

	this.scrolling = function ()
	{
		if ( this.speed == 0 )
		{
			this.objContainer.scrollLeft = this.xScrollTo;
			this.objContainer.scrollTop = this.yScrollTo;
		}
		else
		{
			this.objContainer.scrollLeft = this.xScrollTo - parseInt ( ( this.xScrollTo - this.objContainer.scrollLeft ) / ( 1 + this.speed / 10 ) );
			this.objContainer.scrollTop = this.yScrollTo - parseInt ( ( this.yScrollTo - this.objContainer.scrollTop ) / ( 1 + this.speed / 10 ) );
		}
		if ( this.objContainer.scrollLeft == this.xScrollTo && this.objContainer.scrollTop == this.yScrollTo )
		{
			clearInterval ( this.interval );
			this.interval = null;
		}
	};

	// 自动滚动 ( type: 0 = 垂直, 1 = 水平 )
	this.autoScroll = function ( type )
	{
		if ( this.autoScrollPaused ) return false;
		if ( !this.contentIsCloned )
		{
			this.objContainer.innerHTML += this.objContainer.innerHTML;
			this.contentIsCloned = true;
		}

		if ( type == 0 )
		{
			if ( this.objContainer.scrollTop >= this.objContainer.scrollHeight / 2 )
			{
				this.objContainer.scrollTop = 0;
			}
			this.scrollUp ();
		}
		else
		{
			if ( this.objContainer.scrollLeft >= this.objContainer.scrollWidth / 2 )
			{
				this.objContainer.scrollLeft = 0;
			}
			this.scrollLeft ();
		}
	};

	this.pause = function ()
	{
		this.autoScrollPaused = true;
	};
	
	this.resume = function ()
	{
		this.autoScrollPaused = false;
	};

	this.scrollLeft = function ()
	{
		var x = Math.min ( this.objContainer.scrollLeft + this.objContainer.offsetWidth, this.objContainer.scrollWidth - this.objContainer.offsetWidth );
		var y = this.objContainer.scrollTop;
		this.scrollTo ( x, y );
	};

	this.scrollRight = function ()
	{
		var x = Math.max ( this.objContainer.scrollLeft - this.objContainer.offsetWidth, 0 );
		var y = this.objContainer.scrollTop;
		this.scrollTo ( x, y );
	};

	this.scrollUp = function ()
	{
		var x = this.objContainer.scrollLeft;
		var y = Math.min ( this.objContainer.scrollTop + this.objContainer.offsetHeight, this.objContainer.scrollHeight - this.objContainer.offsetHeight );
		this.scrollTo ( x, y );
	};

	this.scrollDown = function ()
	{
		var x = this.objContainer.scrollLeft;
		var y = Math.max ( this.objContainer.scrollTop - this.objContainer.offsetHeight, 0 );
		this.scrollTo ( x, y );
	};
}