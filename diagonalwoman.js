var data_url, binary_gif, canvas, ctx, encoder;

function getDenominator(floatingPointNumber) {
	//ahh I just love the smell of one-liners in the morning
	return Ratio.parse(floatingPointNumber).simplify().toString().split('/')[1];
}

function makeCanvas(canvasScale) {
	if (document.getElementById('graphCanvas')) {
		document.getElementById('graphCanvas').parentElement.removeChild(document.getElementById('graphCanvas'))
	}
	canvas = document.createElement("canvas");
	canvas.id = "graphCanvas";
	canvas.setAttribute("width", window.innerWidth);
	canvas.setAttribute("height", window.innerHeight);
	canvas.setAttribute("style", "position: relative; x:0; y:0;");
	document.body.appendChild(canvas);

	ctx = canvas.getContext("2d");
}

function gcf(a, b) { 
	return ( b == 0 ) ? (a):( gcf(b, a % b) ); 
}
function lcm(a, b) { 
	return ( a / gcf(a,b) ) * b; 
}

function round(num, places) {
	return Math.round(num*(Math.pow(10, places)))/Math.pow(10, places);
}

function calculateSquaresPassedThrough(dimensions, drawCanvas, canvasScale, slope, makeGif, drawColor) {
	if (makeGif) {
		encoder = new GIFEncoder();
		encoder.setRepeat(0);
		encoder.setDelay(50);
		encoder.setQuality(20);
	} else {
		document.getElementById('gif').src = undefined;
	}

	makeCanvas(canvasScale);

	drawCanvas = ctx;

	if (slope<1) {
		var step = 1/getDenominator(1/slope);
	} else {
		var step = 1/slope;
	}

	//reset the canvas
	canvas.width=dimensions[0]*canvasScale;
	canvas.height=dimensions[1]*canvasScale;

	//reset the gif-maker
	if (makeGif) encoder.start();

	//plot a grid
	for (var x=0; x<dimensions[0]; x++) {
		//go through the Xes
		for (var y=0; y<dimensions[1]; y++) {
			//go through each possible Y for said X
			if (drawCanvas) drawCanvas.strokeRect(x*canvasScale,y*canvasScale,canvasScale,canvasScale);
		}
	}

	//we need 2 since the "dots" are actually rectangles and the lines are strokes.
	drawCanvas.fillStyle = drawColor;
	drawCanvas.strokeStyle = drawColor;

	var lastPoint = [0,0];

	if (makeGif) encoder.addFrame(ctx);

	return drawLine(dimensions, lastPoint, drawCanvas, ctx, canvasScale, slope, step, 0, dimensions[0], 0, false, 0, makeGif);
}

function drawLine(dimensions, lastPoint, drawCanvas, ctx, canvasScale, slope, step, lineStartX, lineEndX, yIcept, isBackwards, bouncesSoFar, makeGif) {
	var y = -1;
	var x = lineStartX -1;
	if (!isBackwards) {
		//we're going from left to right
		y = 1;
		x = lineStartX +1;
	}

	//while (!(dimensions[0] == x*step || lastPoint[0] == 0) || !(dimensions[1] == round(x*slope*step + yIcept/canvasScale,5) || round(x*slope*step + yIcept/canvasScale,5) == 0)) {
	while (true) {
		//iterate through the x points

		//if we've hit the max y-value, then remake the line

		if (drawCanvas) {
			drawCanvas.fillRect((x*step*canvasScale)-3,(x*slope*step*canvasScale)-3+yIcept,6,6);
			ctx.beginPath();
			ctx.moveTo(lastPoint[0], lastPoint[1]);
			ctx.lineTo(x*step*canvasScale, x*slope*step*canvasScale+yIcept);
			ctx.stroke();

			lastPoint = [round(x*step*canvasScale,5),round(x*slope*step*canvasScale+yIcept,5)];
			if (makeGif) encoder.addFrame(ctx);
		}

		if (dimensions[1] == round(x*slope*step + yIcept/canvasScale,5) || round(x*slope*step + yIcept/canvasScale,5) == 0) {
			var pos;
			if (dimensions[1] == x*slope*step + yIcept/canvasScale) { pos = "top"; }
			else { pos="bottom"; }

			if (lastPoint[0] == 0) { pos += " left"; }
			else if (dimensions[0] == x*step) { pos += " right"; }

			if (pos.indexOf(' ') != -1) { 
				var returnString = "You've hit the " + pos + " corner! Bounces: "+bouncesSoFar;
				alert(returnString);
				var returnData = {
					"corner": pos,
					"bounces": bouncesSoFar,
					"returnString": returnString
				}
				if (makeGif) {
					encoder.finish();
					binary_gif = encoder.stream().getData();
					data_url = 'data:image/gif;base64,'+encode64(binary_gif);
					document.getElementById('gif').src = data_url;
				}
				return returnData;
			}

			else {
				bouncesSoFar++;
				drawLine(dimensions, lastPoint, drawCanvas, ctx, canvasScale, -slope, step, x, 0, 2*lastPoint[1]-yIcept, isBackwards, bouncesSoFar, makeGif);
			}
			//if we hit a bottom or top wall
			break;
		}
		if (dimensions[0] == x*step || lastPoint[0] == 0) {
			bouncesSoFar++;
			//if we hit a left or right wall
			drawLine(dimensions, lastPoint, drawCanvas, ctx, canvasScale, -slope, step, lastPoint[0]/(canvasScale*step), 0, 2*lastPoint[1]-yIcept, !isBackwards, bouncesSoFar, makeGif);
			break;
		}

		//either increment or decrement X based on which direction we're going
		x = round(x + y, 5);
	}
}
