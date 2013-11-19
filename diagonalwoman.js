function getDenominator(floatingPointNumber) {
	//ahh I just love the smell of one-liners in the morning
	return Ratio.parse(floatingPointNumber).simplify().toString().split('/')[1];
}

function getPrecision(numbers) {
	if (!numbers[2]) {
		//sorry no 3D here
		numbers=numbers.sort(function(a,b){return a-b});
		console.log("Ratio: "+numbers[1]/numbers[0]);
		if (numbers[1]/numbers[0]==Math.round(numbers[1]/numbers[0])) return 0.1;
		else { return 0.01; }
	}
	else {
		return 0.01;
	}
}

var canvas,ctx;
function makeCanvas(canvasScale) {
	if (document) {
		if (document.getElementById('graphCanvas')) {
			document.getElementById('graphCanvas').parentElement.removeChild(document.getElementById('graphCanvas'))
		}
		canvas = document.createElement("canvas");
		canvas.id = "graphCanvas";
		canvas.setAttribute("width", window.innerWidth);
		canvas.setAttribute("height", window.innerHeight);
		canvas.setAttribute("style", "position: absolute; x:0; y:0;");
		document.body.appendChild(canvas);

		ctx = canvas.getContext("2d");
	}
	//canvas.style.left = (canvasScale/20)*10 + "px";
}
makeCanvas(20);

/* Plan

Make squares
	Go through the Xs. 
	For each X, go through the Ys and make squares.
Make a function for the line
Iterate over all the possible x-points, of course at a specified interval.
	For each point at an interval, check if it's inside any squares.
	Log whatever squares it's in.
return squaresIntersected.length;

*/

function gcf(a, b) { 
	return ( b == 0 ) ? (a):( gcf(b, a % b) ); 
}
function lcm(a, b) { 
	return ( a / gcf(a,b) ) * b; 
}

function removeDuplicates(arrayName) {
	var newArray=new Array();
	label:for(var i=0; i<arrayName.length;i++ ) {
		for(var j=0; j<newArray.length;j++ ) {
			if(newArray[j]==arrayName[i]) 
				continue label;
			}
		newArray[newArray.length] = arrayName[i];
	}
	return newArray;
}

function round(num, places) {
	return Math.round(num*(Math.pow(10, places)))/Math.pow(10, places);
}

function calculateSquaresPassedThrough(dimensions, drawCanvas, canvasScale, slope) {
	makeCanvas(canvasScale);

	drawCanvas = ctx;
/*	var step = 1/slope;

	if (step < 1) {
		while (Math.round(1/step) !== 1/step) {
			step *= 0.1;
		}
	}
	else if (Math.round(1/slope) === 1/slope) {
		//our slope goes into one evenly
		step = slope;
	}
	else {
		alert("you're fucked");
		//first, find how many x-values it'll take to reach the other side
		var otherside = dimensions[1]/slope;
		//then, find a number that goes into that number evenly & is a mult of 1
		var step = otherside;
		while (Math.

		//find a fraction for the number, increment by the smallest amount of that fraction

	}
*/

	var step = 1/getDenominator(1/slope);

	//reset the canvas
	canvas.width=dimensions[0]*canvasScale;
	canvas.height=dimensions[1]*canvasScale;

	//plot a grid
	for (var x=0; x<dimensions[0]; x++) {
		//go through the Xes
		for (var y=0; y<dimensions[1]; y++) {
			//go through each possible Y for said X
			if (drawCanvas) drawCanvas.strokeRect(x*canvasScale,y*canvasScale,canvasScale,canvasScale);
		}
	}

	drawCanvas.fillStyle = "#ff0000";
	drawCanvas.strokeStyle = "#ff0000";

	var lastPoint = [0,0];

	return drawLine(dimensions, lastPoint, drawCanvas, ctx, canvasScale, slope, step, 0, dimensions[0], 0, false, 0);
}

function drawLine(dimensions, lastPoint, drawCanvas, ctx, canvasScale, slope, step, lineStartX, lineEndX, yIcept, isBackwards, bouncesSoFar) {
	//alert('drawing new line');
	
	var y = -1;
	var x = lineStartX -1;
	if (!isBackwards) {
		//we're going from left to right
		y = 1;
		x = lineStartX +1;
	}

	else { 
		//alert('goingbackwards');
	}

	//var x=Math.round(lastPoint[0]/(step*canvasScale)+1,5); //our little counter

	//while (lineEndX !== x) {
	while (true) {
		//iterate through the x points

		//if we've hit the max y-value, then remake the line

		//alert('drawing, x:'+x + ' step:' + step + ' scale:'+canvasScale + " yIcept: " + yIcept);

		if (drawCanvas) {
			drawCanvas.fillRect((x*step*canvasScale)-3,(x*slope*step*canvasScale)-3+yIcept,6,6);
			ctx.beginPath();
			ctx.moveTo(lastPoint[0], lastPoint[1]);
			ctx.lineTo(x*step*canvasScale, x*slope*step*canvasScale+yIcept);
			ctx.stroke();

			lastPoint = [round(x*step*canvasScale,5),round(x*slope*step*canvasScale+yIcept,5)];
			console.log(lastPoint);
		}

		//if (x==4) alert(x*slope*step + yIcept/canvasScale);
		if (dimensions[1] == round(x*slope*step + yIcept/canvasScale,5) || round(x*slope*step + yIcept/canvasScale,5) == 0) {
			var pos;
			if (dimensions[1] == x*slope*step + yIcept/canvasScale) { pos = "top"; }
			else { pos="bottom"; }

			if (lastPoint[0] == 0) { pos += " left"; }
			else if (dimensions[0] == x*step) { pos += " right"; }

			if (pos.indexOf(' ') != -1) { alert("You've hit the " + pos + " corner! Bounces: "+bouncesSoFar); }

			else {
				bouncesSoFar++;
				//alert('hitHLine');
				drawLine(dimensions, lastPoint, drawCanvas, ctx, canvasScale, -slope, step, x, 0, 2*lastPoint[1]-yIcept, isBackwards, bouncesSoFar);
			}
			//if we hit a bottom or top wall
			break;
		}
		if (dimensions[0] == x*step || lastPoint[0] == 0) {
			bouncesSoFar++;
			//if we hit a left or right wall
			//alert('hitVLine'+step);
			drawLine(dimensions, lastPoint, drawCanvas, ctx, canvasScale, -slope, step, lastPoint[0]/(canvasScale*step), 0, 2*lastPoint[1]-yIcept, !isBackwards, bouncesSoFar);
			break;
		}

		//either increment or decrement X based on which direction we're going
		x = round(x + y, 5);
	}
}

//console.log(calculateSquaresPassedThrough([20,5],.1,ctx,20));
