



export function initSylinderBuffer(gl, sect, height) {//Sylinder, justerbar høyde
	let position = [];
	let sectors = sect;
	let stepGrader = 360 / sectors;
	if (stepGrader<=2)
		stepGrader=3;
	let step = (Math.PI / 180) * stepGrader;
	let h = height; // Sylinderens høyde

    // Toppsirkel
    let x = 0, y = h / 2, z = 0;
    position = position.concat(x, y, z);

    let phi = 0.0;
    for (let sector = 0; sector <= sectors; sector++) {
        x = Math.cos(phi);
        y = h / 2; // Top circle
        z = Math.sin(phi);

        position = position.concat(x, y, z);
        phi += step;
    }

    // Bottom sirkel
    x = 0; y = -h / 2; z = 0;
    position = position.concat(x, y, z);

    phi = 0.0;
    for (let sector = 0; sector <= sectors; sector++) {
        x = Math.cos(phi);
        y = -h / 2; 
        z = Math.sin(phi);

        position = position.concat(x, y, z);
        phi += step;
    }

    // Sidevertekser
    phi = 0.0;
    for (let sector = 0; sector <= sectors; sector++) {
        // Top verteks
        x = Math.cos(phi);
        y = h / 2;
        z = Math.sin(phi);

        position = position.concat(x, y, z);

        // Bottom verteks
        y = -h / 2;
        position = position.concat(x, y, z);

        phi += step;
    }

    const positions = new Float32Array(
		position
		);

	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	return  {
		position: positionBuffer,
		vertexCount: positions.length/3
	};
}


export function initKubeBuffer(gl, width = 2, height = 2, depth = 2) { //Kube, width = x, height = y, depth = z

	const positions = new Float32Array([
    // Forside
    width / 2, -height / 2, depth / 2,
    width / 2, height / 2, depth / 2,
    -width / 2, height / 2, depth / 2,
    width / 2, -height / 2, depth / 2,
    -width / 2, height / 2, depth / 2,
    -width / 2, -height / 2, depth / 2,

    // Venstre side
    -width / 2, -height / 2, depth / 2,
    -width / 2, height / 2, depth / 2,
    -width / 2, -height / 2, -depth / 2,
    -width / 2, -height / 2, -depth / 2,
    -width / 2, height / 2, depth / 2,
    -width / 2, height / 2, -depth / 2,

    // Bakside
    -width / 2, -height / 2, -depth / 2,
    -width / 2, height / 2, -depth / 2,
    width / 2, -height / 2, -depth / 2,
    width / 2, -height / 2, -depth / 2,
    -width / 2, height / 2, -depth / 2,
    width / 2, height / 2, -depth / 2,

    // Høyre side
    width / 2, -height / 2, -depth / 2,
    width / 2, height / 2, -depth / 2,
    width / 2, -height / 2, depth / 2,
    width / 2, -height / 2, depth / 2,
    width / 2, height / 2, -depth / 2,
    width / 2, height / 2, depth / 2,

    // Topp
    width / 2, height / 2, depth / 2,
    width / 2, height / 2, -depth / 2,
    -width / 2, height / 2, depth / 2,
    -width / 2, height / 2, depth / 2,
    width / 2, height / 2, -depth / 2,
    -width / 2, height / 2, -depth / 2,

    // Bunn
    -width / 2, -height / 2, depth / 2,
    width / 2, -height / 2, depth / 2,
    -width / 2, -height / 2, -depth / 2,
    -width / 2, -height / 2, -depth / 2,
    width / 2, -height / 2, depth / 2,
    width / 2, -height / 2, -depth / 2,
]);


	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);



    const edges = new Uint16Array([
        // Forside
        0, 1,   1, 2,   2, 5,   5, 0,
        // Bakside
        12, 13, 16, 17, 17, 18, 18, 12, 
        //kanter
        18, 0, 1, 17, 2, 16, 5, 12,
    ]);
    
    const edgeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, edgeBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, edges, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    



	return  {
		position: positionBuffer,
        edges: edgeBuffer,
		vertexCount: positions.length/3,
        edgeCount: edges.length
	};
}




export function initPrismBuffer(gl, width = 2, height = 2, depth = 2) { //prisme, width = trekantens bunn, height = høyde Y retning, trekantens spiss, depth = lengden på trekanten
// Vertekser for et trekantet prisme
const positions = new Float32Array([
    // Forside trekant
    0, height / 2, depth / 2,         
    -width / 2, -height / 2, depth / 2,  
    width / 2, -height / 2, depth / 2,   

    // Bakside trekant
    0, height / 2, -depth / 2,        
    -width / 2, -height / 2, -depth / 2, 
    width / 2, -height / 2, -depth / 2,  

    // venstre side
    0, height / 2, depth / 2,         
    -width / 2, -height / 2, depth / 2,  
    0, height / 2, -depth / 2,        
    -width / 2, -height / 2, -depth / 2, 

    // høyre side
    0, height / 2, depth / 2,         
    width / 2, -height / 2, depth / 2,   
    0, height / 2, -depth / 2,        
    width / 2, -height / 2, -depth / 2, 

    // Bunn
    -width / 2, -height / 2, depth / 2,  
    width / 2, -height / 2, depth / 2,   
    -width / 2, -height / 2, -depth / 2, 
    width / 2, -height / 2, -depth / 2,  
]);
	const positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		
        

    const edges = new Uint16Array([
        //trekant 1
        0, 1,   0, 2,   1,2,
        //trekant 2
        3,4,    3,5,    4,5,
        //kanter
        0,3,    1,4,    2,5,
        
    ]);
    
    const edgeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, edgeBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, edges, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    



    return  {
        position: positionBuffer,
        edges: edgeBuffer,
        vertexCount: positions.length/3,
        edgeCount: edges.length
    };

}



export function initPyramidBuffer(gl, baseSize = 2, height = 3) {

	const positions = new Float32Array([
	
		
        // Grunnflate - Høyre forside hjørne
		baseSize / 2, 0, baseSize / 2,   // Høyre forside

        // Grunnflate - Høyre bakside hjørne
		baseSize / 2, 0, -baseSize / 2,  // Høyre bakside
        
        // Grunnflate - Venstre forside hjørne
		-baseSize / 2, 0, baseSize / 2,  // Venstre forside
	
		// Grunnflate - Venstre bakside hjørne
		-baseSize / 2, 0, -baseSize / 2, // Venstre bakside
	
		// Forside trekant
		0, height, 0,                    // Toppunktet
		-baseSize / 2, 0, baseSize / 2,  // Venstre forside
		baseSize / 2, 0, baseSize / 2,   // Høyre forside
	
		// Høyre side trekant
		0, height, 0,                    // Toppunktet
		baseSize / 2, 0, baseSize / 2,   // Høyre forside
		baseSize / 2, 0, -baseSize / 2,  // Høyre bakside
	
		// Bakside trekant
		0, height, 0,                    // Toppunktet
		baseSize / 2, 0, -baseSize / 2,  // Høyre bakside
		-baseSize / 2, 0, -baseSize / 2, // Venstre bakside
	
		// Venstre side trekant
		0, height, 0,                    // Toppunktet
		-baseSize / 2, 0, -baseSize / 2, // Venstre bakside
		-baseSize / 2, 0, baseSize / 2,  // Venstre forside
	]);

	const positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);



		const edges = new Uint16Array([
        0, 1, 1, 3, 3, 2, 2, 0,  0, 4, 1, 4, 2, 4, 3, 4
        
    ]);
    
    const edgeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, edgeBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, edges, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    



    return  {
        position: positionBuffer,
        edges: edgeBuffer,
        vertexCount: positions.length/3,
        edgeCount: edges.length
    };
};

export function initSquareWireframeBuffer(gl) { 

	const positions = new Float32Array([

        -1, 0, -1,
        1, 0, -1,
        -1, 0, -0.5,
        1, 0, -0.5,
        -1, 0, 0,
        1, 0, 0,
        -1, 0, 0.5, 
        1, 0, 0.5, 
        -1, 0, 1, 
        1, 0, 1,
        -1, 0, -1,
        -1, 0, 1,
        -0.5, 0, -1,
        -0.5, 0, 1,
        0, 0, -1,
        0, 0, 1, 
        0.5, 0, -1, 
        0.5, 0, 1, 
        1, 0, -1,
        1, 0, 1,
    
])

const positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		return  {
			position: positionBuffer,
			vertexCount: positions.length/3
		};
};




export function initRoadBuffer(gl) { 

	const positions = new Float32Array([

        //1. Kvadrant

        0, 0, 0,     //0
        0, 0, -4,      //1
        4, 0, 0,      //2
        5, 0, -5,     //3
        8.5, 0, -2,     //4
        8, 0, -7,     //5 
        12, 0, -6,    //6
        11, 0, -11,   //7
        15, 0, -11,   //8
        12, 0, -15,   //9
        16, 0, -18,   //10
        12, 0, -18,   //11

        //2. Kvadrant

        0, 0, 0,        //12
        3, 0, 0,        //13
        0, 0, 10,       //14
        3, 0, 7,        //15
        3, 0, 10,       //16
        11, 0, 7,       //17
        8, 0, 10,       //18 
        11, 0, 13,      //19
        8, 0, 13,       //20

        //3. kvadrant

        0, 0, 3,     //21
        0, 0, 0,     //22
        -8, 0, 3,    //23
        -10, 0, 0,   //24
        -18, 0, 14,  //25
        -20, 0, 11,  //26

        //4. Kvadrant

        0, 0, 0,    //27   
        0, 0, -50,  //28
        -3, 0, 0,   //29
        -3, 0, -50, //30
             

    
])

const positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		return  {
			position: positionBuffer,
			vertexCount: positions.length/3
		};
};





