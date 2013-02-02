var app = {
	gridW: 50.0,
	gridH: 50.0,
	focused: null,
	elemClick: function (){
		app.canvasBox.find('.element').removeClass('focused');
		$(this).addClass('focused');
		app.focused = $(this);
	},
	generateCss: function () {
		var txt = $('#css-code'), res = '';
		var elems = $('#canvas-box').find('.element');
		if (elems.length > 0) {
			res = '.icon-bg {background: url(sprites.png) no-repeat; width:' + $('#grid-box-size').val() + 'px; height: ' + $('#grid-box-size').val() + 'px;}' + "\n";
			$.each(elems, function (i,e) {
				//console.log(i,e);
				var elem = $(e);
				res += '.icon-' + elem.attr('name').replace('.png', '').replace(' ', '_') + ' {' +
					'background-position:-' + elem.css('left') + ' -' + elem.css('top') + '; ' + 
					'width:' + elem.width() + 'px; ' +
					'height:' + elem.height() + 'px;}' + "\n";
			});
		}
		txt.val(res);
	},
	autoPos: function () {
		var canva = $('#canvas-box'), elems = canva.find('.element');
		if (elems.length > 0) {
			var cols = Math.round(canva.width() / app.gridW), 
				rows = Math.round(canva.height() / app.gridH), 
				r = 0, c = 0;
			$.each(elems, function (i,e) {
				var elem = $(e), 
					w = elem.width(), 
					h = elem.height();
				var pw = w < app.gridW ? (((app.gridW - w) / 2)) : 0;
				var ph = w < app.gridH ? (((app.gridH - h) / 2)) : 0;
				elem.css('left', c * app.gridW + pw);
				elem.css('top', r * app.gridH + ph);
				c++;
				if (c >= cols) {
					r++;
					c = 0;
				}
			});
		}
	},
	saveSprite: function () {
		var canva = $('#canvas-box'), 
			elems = canva.find('.element');
		var canvas = document.getElementById('canvas-out');
		var context = canvas.getContext('2d');
		if (elems.length > 0) {
			context.clearRect (0 ,0 , canva.width() , canva.height());
			var allOK = false;
			$.each(elems, function (i,e) {
				var elem = $(e), img = new Image(), imgData = elem.css('background-image').replace('url(', '').replace(')','');
				var l = parseInt(elem.css('left').replace('px', ''));
				var t = parseInt(elem.css('top').replace('px', ''));
				img.src = imgData;
				allOK = false;
				img.onload = function () {
					context.drawImage(img, l, t);
					if (i == elems.length -1) {
						app.generateCss();
						$.ajax('save.php', {
							type: 'post',
							data: {
								img: canvas.toDataURL(),
								css: $('#css-code').val(),
								size: $('#grid-box-size').val()
							},
							success: function (d) {
								//console.log(d);
								document.location.href = d;
							}
						});
					//console.log(canvas.toDataURL());
					}
				};
			});
			
			
		}
	},
	init: function () {
		this.canvas = document.getElementById("canvas").getContext("2d");
		this.canvasBox = $('#canvas-box');
		this.drawGrid();
		$('#btn-css').on('click', this.generateCss);
		$('#btn-auto').on('click', this.autoPos);
		$('#btn-save').on('click', this.saveSprite);
		$('#grid-box-size').on('change', function () {
			app.gridW = parseInt($(this).val());
			app.gridH = parseInt($(this).val());
			app.drawGrid();
		});
		$(document).keydown(function(e){
			/*
			37 - left
			38 - up
			39 - right
			40 - down
			*/
			if (app.focused !== null) {
				var keyCode = e.keyCode || e.which;
				var moveX = 0, moveY = 0, l = parseInt(app.focused.css('left')), t = parseInt(app.focused.css('top'));
				switch (keyCode) {
					case 37: moveX = -1; break;
					case 38: moveY = -1; break;
					case 39: moveX = 1; break;
					case 40: moveY = 1; break;
				}
				l = l + moveX;
				t = t + moveY;
				app.focused.css('left', l);
				app.focused.css('top', t);
			}
		});
		//$(".element").draggable({ containment: "#canvas-box", scroll: false });

		document.getElementById("canvas").addEventListener("dragover", function (e,b,c,d) {
			e.stopPropagation();
			e.preventDefault();
		}, false);
		document.getElementById("canvas").addEventListener("drop", function (e,b,c,d) {
			e.stopPropagation(); // Stops some browsers from redirecting.
			e.preventDefault();
			var files = e.dataTransfer.files, me = app;
			for (var i = 0, f; f = files[i]; i++) {
				var reader = new FileReader();
				reader.file = f;
				reader.onload = function (e) {
					var image = new Image(), self = this;
					image.onload = function() {
						var w = this.width,
							h = this.height;
						var elem = $('<div name="' + self.file.name + '" class="element" style="top: 0px; left: 0px; width: ' + w + 'px; height: ' + h + 'px; background-image: url(' + e.target.result + ');"></div>');
						elem.on('click', me.elemClick);
						me.canvasBox.prepend(elem);
						elem.draggable({ containment: "#canvas-box", scroll: false });
					};
					image.src = e.target.result;
					//me.canvasBox.append('<img src="' + reader.result + '">');
				};
				reader.readAsDataURL(f);
			}
		}, false);
	},
	drawGrid: function () {
		var ctx = this.canvas, w = $('#canvas').width(), h = $('#canvas').height(), i, x,y,
			boxX = this.gridW, boxY = this.gridH;;
		ctx.clearRect (0 ,0 , w , h);
		ctx.setLineWidth = 1;
		for(i=0; i<w / 5; i++) {
			ctx.setStrokeColor('#f9f9f9');
			if ((i * 5) % boxX == 0)
				ctx.setStrokeColor('#F2F2F2');
			ctx.beginPath();
			ctx.moveTo(i * 5 + 0.5,0.0);
			ctx.lineTo(i * 5 + 0.5, h);
			ctx.closePath();
			ctx.stroke();
		}
		for(i=0; i<h / 5; i++) {
			ctx.setStrokeColor('#f9f9f9');
			if ((i * 5) % boxY == 0)
				ctx.setStrokeColor('#F2F2F2');
			ctx.beginPath();
			ctx.moveTo(0, i * 5 + 0.5);
			ctx.lineTo(w, i * 5 + 0.5);
			ctx.closePath();
			ctx.stroke();
		}
		
		for(x=0; x<w; x++) {
			for(y=0; y<h; y++) {
				if (x % 5 == 0 && y % 5 == 0) {
					ctx.fillStyle = "#E3E3E3";
					ctx.fillRect( x, y, 1, 1 );
				}
				if (x % boxX == 0 && y % boxY == 0) {
					ctx.fillStyle = "#bebfc0";
					ctx.fillRect( x, y, 1, 1 );
					ctx.fillRect( x-1, y, 1, 1 );
					ctx.fillRect( x-2, y, 1, 1 );
					ctx.fillRect( x, y-1, 1, 1 );
					ctx.fillRect( x, y-2, 1, 1 );
					ctx.fillRect( x, y+1, 1, 1 );
					ctx.fillRect( x, y+2, 1, 1 );
					ctx.fillRect( x+1, y, 1, 1 );
					ctx.fillRect( x+2, y, 1, 1 );
				}
			}
		}
	}
};
window.app = app;

$(document).ready(function () {
	app.init();
});