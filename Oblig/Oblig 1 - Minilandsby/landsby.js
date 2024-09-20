import {WebGLCanvas} from '../../base/helpers/WebGLCanvas.js';
import {WebGLShader} from '../../base/helpers/WebGLShader.js';
import {Camera} from "../../base/helpers/Camera.js";
import { Stack } from '../../base/helpers/Stack.js';
import { initSylinderBuffer, initKubeBuffer, initPrismBuffer, initPyramidBuffer, initSquareWireframeBuffer, initRoadBuffer } from './primitives.js';

export function main() {
	// Oppretter et webGLCanvas for WebGL-tegning:
	const webGLCanvas = new WebGLCanvas('myCanvas', document.body, 1200, 800);
	const circleSections = 18;


	const renderInfo = {
		gl: webGLCanvas.gl,
		baseShaderInfo: initBaseShaders(webGLCanvas.gl),
		sect: circleSections,
		SylinderBuffers: initSylinderBuffer(webGLCanvas.gl, circleSections, 1.0), //(sect, heigth)
		kubeBuffers: initKubeBuffer(webGLCanvas.gl, 2, 2, 2), //Width, height, depth 
		squareWireframeBuffers: initSquareWireframeBuffer(webGLCanvas.gl),
		roadBuffers: initRoadBuffer(webGLCanvas.gl),
        prismBuffers: initPrismBuffer(webGLCanvas.gl),
        pyramidBuffers: initPyramidBuffer(webGLCanvas.gl),
		currentlyPressedKeys: [],
		rotasjonsVinkel: 0,
		windSpeed: 2.0,
		lastTime: 0,
		fpsInfo: {  // Brukes til å beregne og vise FPS (Frames Per Seconds):
			frameCount: 0,
			lastTimeStamp: 0
		},
		floorSquares: [],
		colors: {
			red: [0.7, 0.1, 0.1, 1],       // Red
			green: [0, 0.6, 0.1, 1],     // Green
			blue: [0, 0, 1, 1],      // Blue
			window: [0.3, 0.7, 1, 1],      // Window
			yellow: [1, 1, 0, 1],    // Yellow
			magenta: [1, 0, 1, 1],   // Magenta
			cyan: [0, 1, 1, 1],      // Cyan
			darkGray: [0.3, 0.3, 0.3, 1], //dark gray
			gray: [0.5, 0.5, 0.5, 1],// Gray
			orange: [1, 0.5, 0, 1],  // Orange
			purple: [0.3, 0, 0.3, 1],// Purple
			black: [0, 0, 0, 1],     // Black
			white: [0.85, 0.85, 0.85, 1], 		//white
		}
	};
	let i = 0;
	for (let x = -24; x < 25; x+=2){
		for (let z = -24; z < 25; z+=2){
			renderInfo.floorSquares[i] = {
				xpos: x,
				ypos: 0,
				zpos: z
			}
			i++;
		}
	}

	initKeyPress(renderInfo.currentlyPressedKeys);
	const camera = new Camera(renderInfo.gl, renderInfo.currentlyPressedKeys);

	// Animere vindmøllen
	document.getElementById("windSpeed").addEventListener("input", function(e) {
    renderInfo.windSpeed = parseFloat(e.target.value);
});
	
	animate( 0, renderInfo, camera);
}

/**
 * Knytter tastatur-evnents til eventfunksjoner.
 */
function initKeyPress(currentlyPressedKeys) {
	document.addEventListener('keyup', (event) => {
		currentlyPressedKeys[event.code] = false;
	}, false);
	document.addEventListener('keydown', (event) => {
		currentlyPressedKeys[event.code] = true;
	}, false);
}

function initBaseShaders(gl) {
	// Leser shaderkode fra HTML-fila:
	let vertexShaderSource = document.getElementById('base-vertex-shader').innerHTML;
	let fragmentShaderSource = document.getElementById('base-fragment-shader').innerHTML;

	// Initialiserer  & kompilerer shader-programmene;
	const glslShader = new WebGLShader(gl, vertexShaderSource, fragmentShaderSource);

	// Samler all shader-info i ET JS-objekt, som returneres.
	return  {
		program: glslShader.shaderProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexPosition'),
			//vertexColor: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexColor'),
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uProjectionMatrix'),
			modelViewMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uModelViewMatrix'),
            fragmentColor: gl.getUniformLocation(glslShader.shaderProgram, 'uFragmentColor'),
		},
	};
}



/**
 * Aktiverer position-bufferet.
 * Kalles fra draw()
 */
function connectPositionAttribute(gl, baseShaderInfo, positionBuffer) {
	const numComponents = 3;
	const type = gl.FLOAT;
	const normalize = false;
	const stride = 0;
	const offset = 0;
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.vertexAttribPointer(
		baseShaderInfo.attribLocations.vertexPosition,
		numComponents,
		type,
		normalize,
		stride,
		offset);
	gl.enableVertexAttribArray(baseShaderInfo.attribLocations.vertexPosition);
}

/**
 * koble til farge
 * Kalles fra draw()
 */
function connectColorUniform(gl, baseShaderInfo, colorRGBA) {
	//let colorRGBA = [1.0, 1.0, 0.0, 1.0];
	gl.uniform4f(baseShaderInfo.uniformLocations.fragmentColor, colorRGBA[0],colorRGBA[1],colorRGBA[2],colorRGBA[3]);
}

/**
 * Klargjør canvaset.
 * Kalles fra draw()
 */
function clearCanvas(gl) {
	gl.clearColor(0.9, 0.9, 0.9, 1);  // Clear screen farge.
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);           // Enable "depth testing".
	gl.depthFunc(gl.LEQUAL);            // Nære objekter dekker fjerne objekter.
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function animate(currentTime, renderInfo, camera) {
	window.requestAnimationFrame((currentTime) => {
		animate(currentTime, renderInfo, camera);
	});

	// Finner tid siden siste kall på draw().
	let elapsed = getElapsed(currentTime, renderInfo);
	calculateFps(currentTime, renderInfo.fpsInfo);
	//Oppdaterer vindmøllens rotasjon
	renderInfo.rotasjonsVinkel = (renderInfo.rotasjonsVinkel + renderInfo.windSpeed * 20 *  elapsed) % 360
	camera.handleKeys(elapsed);

	draw(currentTime, renderInfo, camera);
}

/**
 * Beregner forløpt tid siden siste kall.
 * @param currentTime
 * @param renderInfo
 */
function getElapsed(currentTime, renderInfo) {
	let elapsed = 0.0;
	if (renderInfo.lastTime !== 0.0)	// Først gang er lastTime = 0.0.
		elapsed = (currentTime - renderInfo.lastTime)/1000; // Deler på 1000 for å operere med sekunder.
	renderInfo.lastTime = currentTime;						// Setter lastTime til currentTime.
	return elapsed;
}

/**
 * Beregner og viser FPS.
 * @param currentTime
 * @param renderInfo
 */
function calculateFps(currentTime, fpsInfo) {
	if (!currentTime) currentTime = 0;
	// Sjekker om  ET sekund har forløpt...
	if (currentTime - fpsInfo.lastTimeStamp >= 1000) {
		// Viser FPS i .html ("fps" er definert i .html fila):
		document.getElementById('fps').innerHTML = fpsInfo.frameCount;
		// Nullstiller fps-teller:
		fpsInfo.frameCount = 0;
		//Brukes for å finne ut om det har gått 1 sekund - i så fall beregnes FPS på nytt.
		fpsInfo.lastTimeStamp = currentTime;
	}
	// Øker antall frames per sekund:
	fpsInfo.frameCount++;
}

/**
 * Tegner!
 */
function draw(currentTime, renderInfo, camera) {
	
	clearCanvas(renderInfo.gl);


	drawHouseOne(renderInfo, camera);
	drawHouseTwo(renderInfo, camera);
	drawHouseThree(renderInfo, camera);
	drawHouseFour(renderInfo, camera);
	drawWindMill(renderInfo, camera)

	drawFloor(renderInfo, camera); 
	
	drawRoad(renderInfo, camera, [0.25, 0.25, 0.25, 1.0])


}


function drawSylinder(renderInfo, camera, colorRGBA, modelMatrix) {

	// Aktiver shader:
	renderInfo.gl.useProgram(renderInfo.baseShaderInfo.program);

	// Kople posisjon og farge-attributtene til tilhørende buffer:
	connectPositionAttribute(renderInfo.gl, renderInfo.baseShaderInfo, renderInfo.SylinderBuffers.position);
	connectColorUniform(renderInfo.gl, renderInfo.baseShaderInfo, colorRGBA)


	camera.set();
	let modelviewMatrix = new Matrix4(camera.viewMatrix.multiply(modelMatrix)); // NB! rekkefølge!
	// Send kameramatrisene til shaderen:
	renderInfo.gl.uniformMatrix4fv(renderInfo.baseShaderInfo.uniformLocations.modelViewMatrix, false, modelviewMatrix.elements);
	renderInfo.gl.uniformMatrix4fv(renderInfo.baseShaderInfo.uniformLocations.projectionMatrix, false, camera.projectionMatrix.elements);
    let sect = renderInfo.sect;
	// Tegn øverste sirkel
    renderInfo.gl.drawArrays(renderInfo.gl.TRIANGLE_FAN, 0, sect + 2);

	// Nederste sirkel
	renderInfo.gl.drawArrays(renderInfo.gl.TRIANGLE_FAN, sect + 2, sect + 2);

	// tegn sidene
	renderInfo.gl.drawArrays(renderInfo.gl.TRIANGLE_STRIP, 2 * (sect + 2), (sect + 1) * 2);

	//Tegn svart omriss
	connectColorUniform(renderInfo.gl, renderInfo.baseShaderInfo, [0,0,0,1]);
	renderInfo.gl.drawArrays(renderInfo.gl.LINE_STRIP, 1, sect + 1);
	renderInfo.gl.drawArrays(renderInfo.gl.LINE_STRIP, sect +3 , sect + 1);

	
}


function drawPyramid(renderInfo, camera, colorRGBA, modelMatrix){
	// Aktiver shader:
	renderInfo.gl.useProgram(renderInfo.baseShaderInfo.program);

	// Kople posisjon og farge-attributtene til tilhørende buffer:
	connectPositionAttribute(renderInfo.gl, renderInfo.baseShaderInfo, renderInfo.pyramidBuffers.position);
	connectColorUniform(renderInfo.gl, renderInfo.baseShaderInfo, colorRGBA)

	camera.set();
	let modelviewMatrix = new Matrix4(camera.viewMatrix.multiply(modelMatrix)); // NB! rekkefølge!
	// Send kameramatrisene til shaderen:
	renderInfo.gl.uniformMatrix4fv(renderInfo.baseShaderInfo.uniformLocations.modelViewMatrix, false, modelviewMatrix.elements);
	renderInfo.gl.uniformMatrix4fv(renderInfo.baseShaderInfo.uniformLocations.projectionMatrix, false, camera.projectionMatrix.elements);


	//tegn Basen
	renderInfo.gl.drawArrays(renderInfo.gl.TRIANGLE_STRIP, 0, 4);

	// tegn sidene
	renderInfo.gl.drawArrays(renderInfo.gl.TRIANGLES, 4, 12);

	//Tegn svart omriss
	connectColorUniform(renderInfo.gl, renderInfo.baseShaderInfo, [0, 0, 0, 1]);

	renderInfo.gl.bindBuffer(renderInfo.gl.ELEMENT_ARRAY_BUFFER, renderInfo.pyramidBuffers.edges);
	renderInfo.gl.drawElements(renderInfo.gl.LINES, renderInfo.pyramidBuffers.edgeCount, renderInfo.gl.UNSIGNED_SHORT, 0);
	renderInfo.gl.bindBuffer(renderInfo.gl.ELEMENT_ARRAY_BUFFER, null);

}

function drawCube(renderInfo, camera, colorRGBA, modelMatrix){
	// Aktiver shader:
	renderInfo.gl.useProgram(renderInfo.baseShaderInfo.program);

	//Aktiverer gjennomsiktighet
	renderInfo.gl.enable(renderInfo.gl.BLEND);
	renderInfo.gl.blendFunc(renderInfo.gl.SRC_ALPHA, renderInfo.gl.ONE_MINUS_SRC_ALPHA);

	// Kople posisjon og farge-attributtene til tilhørende buffer:
	connectPositionAttribute(renderInfo.gl, renderInfo.baseShaderInfo, renderInfo.kubeBuffers.position);
	connectColorUniform(renderInfo.gl, renderInfo.baseShaderInfo, colorRGBA)

	camera.set();
	let modelviewMatrix = new Matrix4(camera.viewMatrix.multiply(modelMatrix)); // NB! rekkefølge!
	// Send kameramatrisene til shaderen:
	renderInfo.gl.uniformMatrix4fv(renderInfo.baseShaderInfo.uniformLocations.modelViewMatrix, false, modelviewMatrix.elements);
	renderInfo.gl.uniformMatrix4fv(renderInfo.baseShaderInfo.uniformLocations.projectionMatrix, false, camera.projectionMatrix.elements);

	// tegn sidene
	renderInfo.gl.drawArrays(renderInfo.gl.TRIANGLES, 0, renderInfo.kubeBuffers.vertexCount);

	//Tegn svart omriss
	connectColorUniform(renderInfo.gl, renderInfo.baseShaderInfo, [0, 0, 0, 1]);

	renderInfo.gl.bindBuffer(renderInfo.gl.ELEMENT_ARRAY_BUFFER, renderInfo.kubeBuffers.edges);
	renderInfo.gl.drawElements(renderInfo.gl.LINES, renderInfo.kubeBuffers.edgeCount, renderInfo.gl.UNSIGNED_SHORT, 0);
	renderInfo.gl.bindBuffer(renderInfo.gl.ELEMENT_ARRAY_BUFFER, null);

}

function drawPrism(renderInfo, camera, colorRGBA, modelMatrix){
	// Aktiver shader:
	renderInfo.gl.useProgram(renderInfo.baseShaderInfo.program);

	// Kople posisjon og farge-attributtene til tilhørende buffer:
	connectPositionAttribute(renderInfo.gl, renderInfo.baseShaderInfo, renderInfo.prismBuffers.position);
	connectColorUniform(renderInfo.gl, renderInfo.baseShaderInfo, colorRGBA)

	camera.set();
	let modelviewMatrix = new Matrix4(camera.viewMatrix.multiply(modelMatrix)); // NB! rekkefølge!
	// Send kameramatrisene til shaderen:
	renderInfo.gl.uniformMatrix4fv(renderInfo.baseShaderInfo.uniformLocations.modelViewMatrix, false, modelviewMatrix.elements);
	renderInfo.gl.uniformMatrix4fv(renderInfo.baseShaderInfo.uniformLocations.projectionMatrix, false, camera.projectionMatrix.elements);


	//tegn trekantene
	renderInfo.gl.drawArrays(renderInfo.gl.TRIANGLES, 0, 6);

	// tegn sidene
	renderInfo.gl.drawArrays(renderInfo.gl.TRIANGLE_STRIP, 6, 4);
	renderInfo.gl.drawArrays(renderInfo.gl.TRIANGLE_STRIP, 10, 4);
	renderInfo.gl.drawArrays(renderInfo.gl.TRIANGLE_STRIP, 14, 4);

	//Tegn svart omriss
	connectColorUniform(renderInfo.gl, renderInfo.baseShaderInfo, [0, 0, 0, 1]);

	renderInfo.gl.bindBuffer(renderInfo.gl.ELEMENT_ARRAY_BUFFER, renderInfo.prismBuffers.edges);
	renderInfo.gl.drawElements(renderInfo.gl.LINES, renderInfo.prismBuffers.edgeCount, renderInfo.gl.UNSIGNED_SHORT, 0);
	renderInfo.gl.bindBuffer(renderInfo.gl.ELEMENT_ARRAY_BUFFER, null);

}






function drawFloor(renderInfo, camera){ 
	// Aktiver shader:
	renderInfo.gl.useProgram(renderInfo.baseShaderInfo.program);

	//Aktiverer gjennomsiktighet
	renderInfo.gl.enable(renderInfo.gl.BLEND);
	renderInfo.gl.blendFunc(renderInfo.gl.SRC_ALPHA, renderInfo.gl.ONE_MINUS_SRC_ALPHA);

	// Kople posisjon og farge-attributtene til tilhørende buffer:
	connectPositionAttribute(renderInfo.gl, renderInfo.baseShaderInfo, renderInfo.squareWireframeBuffers.position);
	connectColorUniform(renderInfo.gl, renderInfo.baseShaderInfo, [0, 0, 0, 0.1]);
	


	let modelMatrix = new Matrix4();

	for(let j = 0; j < renderInfo.floorSquares.length; j++){
		
	modelMatrix.setIdentity();
	
	modelMatrix.scale(2, 0, 2)
	modelMatrix.translate(renderInfo.floorSquares[j].xpos, renderInfo.floorSquares[j].ypos, renderInfo.floorSquares[j].zpos)
	
	camera.set();
	let modelviewMatrix = new Matrix4(camera.viewMatrix.multiply(modelMatrix)); // NB! rekkefølge!
	// Send kameramatrisene til shaderen:
	renderInfo.gl.uniformMatrix4fv(renderInfo.baseShaderInfo.uniformLocations.modelViewMatrix, false, modelviewMatrix.elements);
	renderInfo.gl.uniformMatrix4fv(renderInfo.baseShaderInfo.uniformLocations.projectionMatrix, false, camera.projectionMatrix.elements);

	// tegn sidene
	renderInfo.gl.drawArrays(renderInfo.gl.LINES, 0, renderInfo.squareWireframeBuffers.vertexCount);

	}
}

function drawRoad(renderInfo, camera, colorRGBA) {
	// Aktiver shader:
	renderInfo.gl.useProgram(renderInfo.baseShaderInfo.program);

	// Kople posisjon og farge-attributtene til tilhørende buffer:
	connectPositionAttribute(renderInfo.gl, renderInfo.baseShaderInfo, renderInfo.roadBuffers.position);
	connectColorUniform(renderInfo.gl, renderInfo.baseShaderInfo, colorRGBA)
	let modelMatrix = new Matrix4();
	modelMatrix.setIdentity();

	camera.set();
	let modelviewMatrix = new Matrix4(camera.viewMatrix.multiply(modelMatrix)); // NB! rekkefølge!
	// Send kameramatrisene til shaderen:
	renderInfo.gl.uniformMatrix4fv(renderInfo.baseShaderInfo.uniformLocations.modelViewMatrix, false, modelviewMatrix.elements);
	renderInfo.gl.uniformMatrix4fv(renderInfo.baseShaderInfo.uniformLocations.projectionMatrix, false, camera.projectionMatrix.elements);

	// tegn 1. Kvadrant
	renderInfo.gl.drawArrays(renderInfo.gl.TRIANGLE_STRIP, 0, 12);
	//tegn 2. kvadrant
	renderInfo.gl.drawArrays(renderInfo.gl.TRIANGLE_STRIP, 12, 9);
	//tegn 3. kvadrant
	renderInfo.gl.drawArrays(renderInfo.gl.TRIANGLE_STRIP, 21, 6);
	//tegn 4. kvadrant
	renderInfo.gl.drawArrays(renderInfo.gl.TRIANGLE_STRIP, 27, 4);


}


function drawHouseOne(renderInfo, camera) { //Pengebingen
	let modelMatrix = new Matrix4();
	
	
	//Huset/bingen
	modelMatrix.setIdentity();
	modelMatrix.scale(3, 4, 3)
	modelMatrix.translate(4.7, 1, -7)
	drawCube(renderInfo, camera, renderInfo.colors.gray, modelMatrix)

	//taket
	modelMatrix.setIdentity();
	modelMatrix.scale(2, 0.5, 2)
	modelMatrix.translate(7, 17, -10.5)
	drawCube(renderInfo, camera, renderInfo.colors.gray, modelMatrix)

	//gul penge/vindu
	modelMatrix.setIdentity();
	modelMatrix.translate(14.1, 4.9, -18)
	modelMatrix.rotate(90, 1, 0, 0)
	modelMatrix.scale(2, 0.5, 2)
	drawSylinder(renderInfo, camera, renderInfo.colors.yellow, modelMatrix)

	//dør
	modelMatrix.setIdentity();
	modelMatrix.translate(14, 1, -18)
	modelMatrix.scale(0.5, 1, 0.09)
	drawCube(renderInfo, camera, renderInfo.colors.black, modelMatrix)

	//gjerde
	modelMatrix.setIdentity();
	modelMatrix.translate(9, 0.25, -25);
	modelMatrix.rotate(90, 0, 1, 0);
	drawFenceSide(renderInfo, camera, 10,renderInfo.colors.gray, modelMatrix)

	modelMatrix.setIdentity();
	modelMatrix.translate(19, 0.25, -25);
	modelMatrix.rotate(90, 0, 1, 0);
	drawFenceSide(renderInfo, camera, 10,renderInfo.colors.gray, modelMatrix)

	modelMatrix.setIdentity();
	modelMatrix.translate(19, 0.25, -25);
	drawFenceSide(renderInfo, camera, 11,renderInfo.colors.gray, modelMatrix)

	modelMatrix.setIdentity();
	modelMatrix.translate(12, 0.25, -16);
	drawFenceSide(renderInfo, camera, 4,renderInfo.colors.gray, modelMatrix)
	modelMatrix.setIdentity();
	modelMatrix.translate(19, 0.25, -16);
	drawFenceSide(renderInfo, camera, 4,renderInfo.colors.gray, modelMatrix)






}


function drawHouseTwo(renderInfo, camera) { //Oransje hus, skråtak

	let modelMatrix = new Matrix4();

	//Hus
	modelMatrix.setIdentity();
	modelMatrix.translate(-21, 1, 15)
	modelMatrix.rotate(-50, 0, 1, 0)
	modelMatrix.scale(3, 1, 2)
	drawCube(renderInfo, camera, renderInfo.colors.orange, modelMatrix)


	//tak
	modelMatrix.setIdentity();
	modelMatrix.translate(-21, 3, 15)
	modelMatrix.rotate(40, 0, 1, 0)
	modelMatrix.scale(2.4, 1, 3)
	drawPrism(renderInfo, camera, renderInfo.colors.gray, modelMatrix)

	//dør
	modelMatrix.setIdentity();
	modelMatrix.translate(-19, 0.8, 14)
	modelMatrix.rotate(-50, 0, 1, 0)
	modelMatrix.scale(0.35, 0.75, 0.09)
	drawCube(renderInfo, camera, renderInfo.colors.black, modelMatrix)


	//vindu
	modelMatrix.setIdentity();
	modelMatrix.translate(-20, 0.9, 13)
	modelMatrix.rotate(-50, 0, 1, 0)
	modelMatrix.scale(0.35, 0.5, 0.09)
	drawCube(renderInfo, camera, renderInfo.colors.window, modelMatrix)


	//gjerde
	modelMatrix.setIdentity();
	modelMatrix.translate(-21, 0.25, 21)
	modelMatrix.rotate(-50, 0, 1, 0);
	drawFenceSide(renderInfo, camera, 10,renderInfo.colors.gray, modelMatrix)


	modelMatrix.setIdentity();
	modelMatrix.translate(-21, 0.25, 21)
	modelMatrix.rotate(-137, 0, 1, 0);
	drawFenceSide(renderInfo, camera, 10,renderInfo.colors.gray, modelMatrix)
	
	modelMatrix.setIdentity();
	modelMatrix.translate(-26.8, 0.25, 14.07)
	modelMatrix.rotate(-137, 0, 1, 0);
	drawFenceSide(renderInfo, camera, 10,renderInfo.colors.gray, modelMatrix)



}



function drawHouseThree(renderInfo, camera){ //sylinderhus
	let modelMatrix = new Matrix4();

	//sylinderhus
	modelMatrix.setIdentity();
	modelMatrix.translate(10, 1, 16)
	modelMatrix.scale(2, 2, 2)
	drawSylinder(renderInfo, camera, renderInfo.colors.red, modelMatrix);

	//tak
	modelMatrix.setIdentity();
	modelMatrix.translate(10, 2, 16)
	modelMatrix.scale(1.5, 1, 1.5)
	drawSylinder(renderInfo, camera, renderInfo.colors.gray, modelMatrix);

	modelMatrix.setIdentity();
	modelMatrix.translate(10, 3, 16)
	modelMatrix.scale(1, 1, 1)
	drawSylinder(renderInfo, camera, renderInfo.colors.gray, modelMatrix);

	modelMatrix.setIdentity();
	modelMatrix.translate(10, 4, 16)
	modelMatrix.scale(0.3, 2, 0.3)
	drawSylinder(renderInfo, camera, renderInfo.colors.gray, modelMatrix);

	//dør
	modelMatrix.setIdentity();
	modelMatrix.translate(10, 0.8, 14)
	modelMatrix.scale(0.35, 0.75, 0.09)
	drawCube(renderInfo, camera, renderInfo.colors.black, modelMatrix)


	//vindu
	modelMatrix.setIdentity();
	modelMatrix.translate(8, 0.85, 16)
	modelMatrix.rotate(-90, 0, 1, 0)
	modelMatrix.scale(0.35, 0.5, 0.09)
	drawCube(renderInfo, camera, renderInfo.colors.window, modelMatrix)

	//gjerde
	modelMatrix.setIdentity();
	modelMatrix.translate(13, 0.25, 20);
	drawFenceSide(renderInfo, camera, 7,renderInfo.colors.gray, modelMatrix)

	modelMatrix.setIdentity();
	modelMatrix.translate(13, 0.25, 20);
	modelMatrix.rotate(-90, 0, 1, 0);
	drawFenceSide(renderInfo, camera, 8,renderInfo.colors.gray, modelMatrix)

	modelMatrix.setIdentity();
	modelMatrix.translate(7, 0.25, 20);
	modelMatrix.rotate(-90, 0, 1, 0);
	drawFenceSide(renderInfo, camera, 8,renderInfo.colors.gray, modelMatrix)

}


function drawHouseFour(renderInfo, camera) { //hus med garasje

	let modelMatrix = new Matrix4();
	
	
	//Huset
	modelMatrix.setIdentity();
	modelMatrix.translate(-6, 2, -16)
	modelMatrix.scale(2, 2, 2)
	drawCube(renderInfo, camera, renderInfo.colors.green, modelMatrix)

	//taket
	modelMatrix.setIdentity();
	modelMatrix.translate(-6, 4, -16)
	modelMatrix.scale(2.1, 1, 2.1)
	drawPyramid(renderInfo, camera, renderInfo.colors.darkGray, modelMatrix)

	//dør
	modelMatrix.setIdentity();
	modelMatrix.translate(-4, 0.8, -15)
	modelMatrix.rotate(90, 0, 1, 0)
	modelMatrix.scale(0.35, 0.75, 0.09)
	drawCube(renderInfo, camera, renderInfo.colors.black, modelMatrix)


	//vindu
	modelMatrix.setIdentity();
	modelMatrix.translate(-4, 1.2, -17)
	modelMatrix.rotate(90, 0, 1, 0)
	modelMatrix.scale(0.7, 0.5, 0.09)
	drawCube(renderInfo, camera, renderInfo.colors.window, modelMatrix)





	//garasje
	modelMatrix.setIdentity();
	modelMatrix.translate(-5.5, 1, -12.5)
	modelMatrix.scale(2, 1, 1.5)
	drawCube(renderInfo, camera, renderInfo.colors.purple, modelMatrix)

	//garasjetak
	modelMatrix.setIdentity();
	modelMatrix.translate(-5.5, 2, -12.5)
	modelMatrix.scale(2.1, 0.2, 1.6)
	drawPyramid(renderInfo, camera, renderInfo.colors.darkGray, modelMatrix)

	//garasjeport
	modelMatrix.setIdentity();
	modelMatrix.translate(-3.55, 0.6, -12.5)
	modelMatrix.rotate(90, 0, 1, 0)
	modelMatrix.scale(1, 0.6, 0.09)
	drawCube(renderInfo, camera, renderInfo.colors.gray, modelMatrix)



	//gjerde
	modelMatrix.setIdentity();
	modelMatrix.translate(-3, 0.25, -10);
	drawFenceSide(renderInfo, camera, 8,renderInfo.colors.gray, modelMatrix)

	modelMatrix.setIdentity();
	modelMatrix.translate(-3, 0.25, -20);
	drawFenceSide(renderInfo, camera, 8,renderInfo.colors.gray, modelMatrix)

	modelMatrix.setIdentity();
	modelMatrix.translate(-10, 0.25, -20);
	modelMatrix.rotate(90, 0, 1, 0);
	drawFenceSide(renderInfo, camera, 11,renderInfo.colors.gray, modelMatrix)

}



function drawWindMill(renderInfo, camera) {
	let modelMatrix = new Matrix4();

		//Base
	modelMatrix.setIdentity();
	modelMatrix.translate(-10, 4, -5)
	modelMatrix.scale(0.5, 7, 0.5)
	drawSylinder(renderInfo, camera, renderInfo.colors.white, modelMatrix);

	//Generator
	modelMatrix.setIdentity();
	modelMatrix.translate(-9.5, 7.5, -5)
	modelMatrix.scale(1, 0.4, 0.6)
	drawCube(renderInfo, camera, renderInfo.colors.white, modelMatrix);

	//Propellblad
	//MITORS 		O = R*T

	//toppblad
	modelMatrix.setIdentity();
	modelMatrix.translate(-8.2, 7.5, -5)
	//O = R*T
	modelMatrix.rotate(renderInfo.rotasjonsVinkel, 1, 0, 0)
	modelMatrix.translate(0, 0, 0)

	modelMatrix.rotate(90, 0, 1, 0)
	modelMatrix.scale(0.4, 1.5, 0.2)
	drawPyramid(renderInfo, camera, renderInfo.colors.white, modelMatrix);


	//venstre blad
	modelMatrix.setIdentity();
	modelMatrix.translate(-8.2, 7.5, -5)
	//O = R*T
	modelMatrix.rotate(renderInfo.rotasjonsVinkel, 1, 0, 0)
	modelMatrix.translate(0, 0, 0)

	modelMatrix.rotate(90, 0, 1, 0)
	modelMatrix.rotate(120, 0, 0, 1)
	modelMatrix.scale(0.4, 1.5, 0.2)
	drawPyramid(renderInfo, camera, renderInfo.colors.white, modelMatrix);

	//høyre blad
	modelMatrix.setIdentity();
	modelMatrix.translate(-8.2, 7.5, -5)
	//O = R*T
	modelMatrix.rotate(renderInfo.rotasjonsVinkel, 1, 0, 0)
	modelMatrix.translate(0, 0, 0)

	modelMatrix.rotate(90, 0, 1, 0)
	modelMatrix.rotate(240, 0, 0, 1)
	modelMatrix.scale(0.4, 1.5, 0.2)
	drawPyramid(renderInfo, camera, renderInfo.colors.white, modelMatrix);

	




}


function drawFenceSide(renderInfo, camera, posts, colorRGBA, mMatrix){
	let modelMatrix = new Matrix4(mMatrix);
	let matrixStack = new Stack();
	matrixStack.pushMatrix(modelMatrix);


	for (let i =  1; i < posts; i++){
		//Gjerdestolpe
		modelMatrix = matrixStack.peekMatrix();
		modelMatrix.scale(0.1, 0.5, 0.1)
		drawSylinder(renderInfo, camera, colorRGBA, modelMatrix)

		//planker imellom
		modelMatrix = matrixStack.peekMatrix();
		modelMatrix.translate(-0.5, -0.1, 0);
		modelMatrix.scale(0.5, 0.05, 0.02);
		drawCube(renderInfo, camera, colorRGBA, modelMatrix);
		modelMatrix = matrixStack.peekMatrix();
		modelMatrix.translate(-0.5, 0.1, 0);
		modelMatrix.scale(0.5, 0.05, 0.02);
		drawCube(renderInfo, camera, colorRGBA, modelMatrix);
		modelMatrix = matrixStack.peekMatrix();
		modelMatrix.translate(-1, 0, 0);
		matrixStack.pushMatrix(modelMatrix);


	}
		//siste gjerdestolpe
		modelMatrix = matrixStack.peekMatrix();
		modelMatrix.scale(0.1, 0.5, 0.1)
		drawSylinder(renderInfo, camera, colorRGBA, modelMatrix)

}