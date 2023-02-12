class Entity {
	constructor({ model, color, wireframe=false }) {
		const vertices = cloneVertices(model.vertices);
		const shadowVertices = cloneVertices(model.vertices);
		const colorHex = colorToHex(color);
		const darkColorHex = shadeColor(color, 0.4);

		const polys = model.polys.map(p => ({
			vertices: p.vIndexes.map(vIndex => vertices[vIndex]),
			color: color, // objeto de cor RGB personalizado
			wireframe: wireframe,
			strokeWidth: wireframe ? 2 : 0, // Configura um valor diferente de zero para desenhar o traço
			strokeColor: colorHex, // deve ser uma string de cor CSS
			strokeColorDark: darkColorHex, // deve ser uma string de cor CSS
			depth: 0,
			middle: { x: 0, y: 0, z: 0 },
			normalWorld: { x: 0, y: 0, z: 0 },
			normalCamera: { x: 0, y: 0, z: 0 }
		}));

		const shadowPolys = model.polys.map(p => ({
			vertices: p.vIndexes.map(vIndex => shadowVertices[vIndex]),
			wireframe: wireframe,
			normalWorld: { x: 0, y: 0, z: 0 }
		}));

		this.projected = {}; // Armazenará dados projetados em 2D
		this.model = model;
		this.vertices = vertices;
		this.polys = polys;
		this.shadowVertices = shadowVertices;
		this.shadowPolys = shadowPolys;
		this.reset();
	}

	// Nomes melhores: resetEntity, resetTransform, resetEntityTransform
	reset() {
		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.xD = 0;
		this.yD = 0;
		this.zD = 0;

		this.rotateX = 0;
		this.rotateY = 0;
		this.rotateZ = 0;
		this.rotateXD = 0;
		this.rotateYD = 0;
		this.rotateZD = 0;

		this.scaleX = 1;
		this.scaleY = 1;
		this.scaleZ = 1;

		this.projected.x = 0;
		this.projected.y = 0;
	}

	transform() {
		transformVertices(
			this.model.vertices,
			this.vertices,
			this.x,
			this.y,
			this.z,
			this.rotateX,
			this.rotateY,
			this.rotateZ,
			this.scaleX,
			this.scaleY,
			this.scaleZ
		);

		copyVerticesTo(this.vertices, this.shadowVertices);
	}

	// Ponto de origem do projeto, armazenado como propriedade `projected`.
	project() {
		projectVertexTo(this, this.projected);
	}
}
