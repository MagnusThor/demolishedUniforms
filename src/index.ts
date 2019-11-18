
export class GLTypeMapper {
    static map = [{
        k: 5126,
        v: (v: any, l: any, gl: WebGLRenderingContext): any => {
            gl.uniform1f(l, v);
        }
    },
    {
        k: 35665,
        v: (v: any, l: any, gl: WebGLRenderingContext): any => {
            gl.uniform3fv(l, v);
        }
    },
    {
        k: 35664,
        v: (v: any, l: any, gl: WebGLRenderingContext) => {
            gl.uniform2fv(l, v);
        }
    },
    {
        k: 35678,
        v: (v: any, l: any, gl: WebGLRenderingContext): any => {
            gl.activeTexture(33984 + v);
            gl.uniform1i(l, v);
        }
    }

    ]
    static findType(type: number): Function {
        let a: any = this.map.filter((p) => { return p.k === type })[0];
        if (!a)
            throw "not a mapped type";
        return a.v;
    }
}

export class Uniform {
    apply: any;
    path: string;
    constructor(public name: string, public type: number, public size: number, public location: WebGLUniformLocation | null,
        public gl: WebGLRenderingContext) {
        this.apply = GLTypeMapper.findType(type);
        this.path = name.replace(/[\W_]+/g, ".");
        if (this.size > 1) {
            this.path = this.path.replace(/.$/, "");
            
        }

    }
    update(v: any) {
        this.apply(v, this.location, this.gl);
    }
}

export class Uniforms {
    cache: Map<string, Uniform>;
    constructor(public program: WebGLProgram, public gl: WebGLRenderingContext, public graph: any) {
        this.cache = new Map<string, Uniform>();
        const nu = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < nu; ++i) {
            const u: any = gl.getActiveUniform(program, i);
            this.cache.set(u.name, new Uniform(u.name, u.type, u.size, gl.getUniformLocation(program, u.name), gl));
        }
    }
    update(k: string, v: any) {
        const u = this.cache.get(k);
        if (u) u.update(v);
    }
    getValue(obj: any, path: any): any {
        if (!path) return obj;
        const properties = path.split('.');
        return this.getValue(obj[properties.shift()], properties.join('.'))
    }
    runAll() {
        this.cache.forEach((u: Uniform, k: string) => {
            let v = this.getValue(this.graph, u.path);
               this.update(u.name, v);
        });
    }
}
