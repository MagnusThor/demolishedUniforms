"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GLTypeMapper = /** @class */ (function () {
    function GLTypeMapper() {
    }
    GLTypeMapper.findType = function (type) {
        var a = this.map.filter(function (p) { return p.k === type; })[0];
        if (!a)
            throw "not a mapped type";
        return a.v;
    };
    GLTypeMapper.map = [{
            k: 5126,
            v: function (v, l, gl) {
                gl.uniform1f(l, v);
            }
        },
        {
            k: 35665,
            v: function (v, l, gl) {
                gl.uniform3fv(l, v);
            }
        },
        {
            k: 35664,
            v: function (v, l, gl) {
                gl.uniform2fv(l, v);
            }
        },
        {
            k: 35678,
            v: function (v, l, gl) {
                gl.activeTexture(33984 + v);
                gl.uniform1i(l, v);
            }
        }
    ];
    return GLTypeMapper;
}());
exports.GLTypeMapper = GLTypeMapper;
var Uniform = /** @class */ (function () {
    function Uniform(name, type, size, location, gl) {
        this.name = name;
        this.type = type;
        this.size = size;
        this.location = location;
        this.gl = gl;
        this.apply = GLTypeMapper.findType(type);
        this.path = name.replace(/[\W_]+/g, ".");
        if (this.size > 1) {
            this.path = this.path.replace(/.$/, "");
        }
    }
    Uniform.prototype.update = function (v) {
        this.apply(v, this.location, this.gl);
    };
    return Uniform;
}());
exports.Uniform = Uniform;
var Uniforms = /** @class */ (function () {
    function Uniforms(program, gl, graph) {
        this.program = program;
        this.gl = gl;
        this.graph = graph;
        this.cache = new Map();
        var nu = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (var i = 0; i < nu; ++i) {
            var u = gl.getActiveUniform(program, i);
            this.cache.set(u.name, new Uniform(u.name, u.type, u.size, gl.getUniformLocation(program, u.name), gl));
        }
    }
    Uniforms.prototype.update = function (k, v) {
        var u = this.cache.get(k);
        if (u)
            u.update(v);
    };
    Uniforms.prototype.getValue = function (obj, path) {
        if (!path)
            return obj;
        var properties = path.split('.');
        return this.getValue(obj[properties.shift()], properties.join('.'));
    };
    Uniforms.prototype.runAll = function () {
        var _this = this;
        this.cache.forEach(function (u, k) {
            var v = _this.getValue(_this.graph, u.path);
            _this.update(u.name, v);
        });
    };
    return Uniforms;
}());
exports.Uniforms = Uniforms;
