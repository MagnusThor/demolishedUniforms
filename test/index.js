"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Player_1 = require("../Player/Player");
var src_1 = require("../src");
var Vec3 = /** @class */ (function () {
    function Vec3(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    return Vec3;
}());
exports.Vec3 = Vec3;
var Sequencer = /** @class */ (function () {
    function Sequencer() {
        this.scenes = new Array();
        this.scene = new Vec3(0., 0., 0.);
        //  this.seqDuration = 0;
        this.controlBits = new Array(12);
    }
    // get and ivec3[]
    Sequencer.prototype.toArray = function () {
        return this.scenes.map(function (v) {
            return [v.x, v.y, v.z];
        });
    };
    Sequencer.prototype.onEnd = function () {
    };
    Sequencer.prototype.toUniforms = function () {
        // conforms to sequencer struct defined in shader 
        // root , time and resolution defines the main idea...
        // i channel0 illustates how to inlcude
        return {
            iChannel0: 1,
            resolution: [innerWidth, innerHeight],
            seq: {
                scene: [this.scene.x, this.scene.y, this.scene.z],
                time: this.seqTime,
                prog: this.seqProg,
                code: this.seqCode,
                cb: this.controlBits
            }
        };
    };
    Sequencer.prototype.cb = function (n) {
        return (this.seqCode >> n) & 1;
    };
    Sequencer.prototype.sat = function (n) {
        return Math.min(Math.max(0., n), 1.);
    };
    Sequencer.prototype.addScene = function (n, d, b) {
        return this.scenes.push(new Vec3(d, b, n));
    };
    Sequencer.prototype.getScene = function (i) {
        return this.scenes[i];
    };
    Sequencer.prototype.runner = function (t, l) {
        this.seqTime = t;
        var spos = 0;
        var stim = t * 1000. * 441. / 10. / (l * 2.);
        while (this.scenes[spos].x < 255 && stim >= this.scenes[spos].x)
            stim -= this.scenes[spos++].x;
        this.scene = this.scenes[spos];
        this.seqCode = this.scenes[spos].y;
        this.seqProg = this.sat(stim / this.scenes[spos].x);
        for (var n = 0; n < 12; n++)
            this.controlBits[n] = this.cb(n);
        if (this.seqProg === 1)
            this.onEnd();
    };
    return Sequencer;
}());
exports.Sequencer = Sequencer;
var runner = function () {
    // let s = `uniform float time;
    // uniform vec2 mouse,resolution;
    // uniform sampler2D iChannel0;
    // uniform float[10] cb; 
    // vec3 v=vec3(0.);float i;void f(vec2 v){i=fract(sin(dot(v,vec2(113.421,17.329)))*3134.12);}float f(){return fract(sin(i++)*3143.45);}float n(vec3 f){const vec3 i=vec3(.63248,.78632,.875);float r=1.;for(int m=0;m<5;m++){f=2.*clamp(f,-i,i)-f;float n=max(.70968/dot(f,f),1.);f*=n;r*=n;}if(v.r>=0.)v+=abs(f);float m=length(f.rg);return max(m-.92784,abs(m*f.b)/length(f))/r;}float s(vec3 v){return n(v);}vec3 t(in vec3 v){vec2 f=vec2(1.,-1.)*.5773*.0005;return normalize(f.rgg*s(v+f.rgg)+f.ggr*s(v+f.ggr)+f.grg*s(v+f.grg)+f.rrr*s(v+f.rrr));}vec3 p(in vec3 v){return t(v);}mat2 x(float v){return mat2(cos(v),sin(v),-sin(v),cos(v));}mat3 f(in vec3 v,in vec3 f,in float i){vec3 m=normalize(f-v),s=normalize(cross(m,vec3(sin(i),cos(i),0.))),d=normalize(cross(s,m));return mat3(s,d,m);}void n(out vec3 v,out vec3 f,in float m){float i=.3*m+10.;v=vec3(2.772*sin(i),.424,.82*cos(i));f=vec3(1.,0.,-.03);}float f(in vec3 v,in vec3 f){const float m=20.,i=.001;float r=i*2.,n=0.,d=-1.;for(int b=0;b<128;b++){if(r<i||n>m)break;r=s(v+f*n);n+=r;}if(n<m)d=n;return d;}vec3 m(float v){return vec3(cos(v),sin(v),-.65+abs(sin(v*.7))*.25)*(2.+sin(v*1.7)*.5)+vec3(0.,0.,1.);}vec3 e(vec3 v){return v;}vec4 e(vec3 i,vec3 r,float n,float b,float g){f(gl_FragCoord.rg+b);vec3 d=m(b+1.),c;d.b+=n;i.b-=n;float a=s(i)*.8,o=a*f(),u=a,p=1.,x=0.;vec4 l=vec4(0.,0.,0.,1.),z,h=vec4(-1.);for(int C=0;C<99;C++){if(u>o+x)c=i+r*(o+x),c+=(d-c)*-c.b/(d.b-c.b);else c=i+r*o;a=s(c);if(u>o+x){float k=.05*length(i+r*(o+x)-d);l.rgb+=l.a*vec3(1.,1.,.7)*exp(-k*40.)*smoothstep(0.,.01,a);if(o+x+k>u){x=0.;o=u;if(o>20.)break;}else x+=k;}else{if(a<p&&h.a<0.){float k=clamp(a/(g*o),0.,1.);if(k<.95)z=vec4(k,z.rgb),h=vec4(o,h.rgb),l.a*=k;}p=a;u=o+a*(.6+.2*f());}}vec3 k=vec3(0.);for(int C=0;C<4;C++){if(h.r<0.)continue;v=vec3(0.);c=i+r*h.r;vec3 F=t(c),D=d-c,w;v=sin(v)*.3+vec3(.8,.6,.4);float Z=exp(-dot(D,D)*.2);c+=D*-c.b/D.b;D=normalize(D);w=Z*v*max(0.,dot(F,D));float Y=max(0.,dot(F,-r));w+=exp(-o)*v*Y;a=smoothstep(0.,.005,s(c));w+=Z*vec3(2.,2.,1.7)*max(0.,dot(F,D))*a;if(r.b<0.&&a>0.)w+=Z*vec3(4.,3.,1.4)*pow(max(0.,dot(reflect(r,F),D)),5.)*(1.-.25*Y)*a;k=mix(w,k,z.r);z=z.gbar;h=h.gbar;}l.rgb=clamp(l.rgb+k,0.,1.);return vec4(e(l.rgb),o);}out vec4 fragColor;
    // void main(){
    //     float _a = cb[0];
    //     float v,i,d,c=i=.3;vec2 m=gl_FragCoord.rg/resolution.rg+mouse/4.;vec3 s,r;n(s,r,time*.1);v=mod(time,18.85);mat3 a=f(s,r,0.);vec3 k=normalize(a*vec3(m.rg,3.5));vec4 b=e(s,k,.3,v*.12,3./resolution.g);fragColor=b;}`
    var s = "uniform float time;\nuniform vec2 mouse;\nuniform vec2 resolution;\nuniform float cb[12];\nuniform sampler2D iChannel0;\n\nstruct sequencer{\n    float cb[12];\n    float prog;\n    float code;\n    float time;\n    vec3 scene;\n};\n\nuniform sequencer seq;\n\nuniform sampler2D fft;\n\nout vec4 fragColor;\n\nfloat freqs[16];\n\nfloat fCircle(vec3 p,float f){\n    float a = sin(time) * seq.time + cb[0];\n    return a;\n}\n\nvoid main(){\n\n    vec2 uv=(-resolution.xy+2.*gl_FragCoord.xy)/resolution.y;\n\n    vec3 col=vec3(.5);\n\n\nfor(int i=0;i<16;i++){\n  vec4 aa=texture(fft,vec2(-.934+.5*float(i)/15.128,-.574));\n  freqs[i]=clamp(1.9*pow(aa.x,3.),0.,1.);\n  \n}\nfloat f=fCircle(vec3(uv.xy,.5),freqs[3]);\n\nvec4 tex = texture(iChannel0,uv);  \n\ncol= seq.scene;\n\nfragColor=tex;//vec4(col,1.);\n}\n";
    Player_1.P.I(document.querySelector("canvas"), "layout(location = 0) in vec2 pos; \nout vec4 fragColor;\n\nvoid main() { \ngl_Position = vec4(pos.xy,0.0,1.0);\n}", s, innerWidth, innerHeight, {
        "iChannel0": {
            "d": "iChannel0.png"
        }
    }, function (gl, program) {
        var ended = false, previousDelta = 0, fps = 60;
        var seq = new Sequencer();
        seq.onEnd = function () {
            ended = true;
            console.log("ended");
        };
        //intro
        seq.addScene(2, 16, 0x050A | 0x0000),
            seq.addScene(3, 16, 0x040B | 0x0000),
            //PART 1 - forest+rocks
            seq.addScene(4, 12, 0x0013 | 0x4000),
            seq.addScene(5, 11, 0x0051 | 0x2000),
            seq.addScene(6, 1, 0x0410 | 0x6000),
            seq.addScene(7, 8, 0x0010 | 0x6000),
            seq.addScene(8, 12, 0x0110 | 0x4000),
            seq.addScene(9, 12, 0x001F | 0x0000),
            seq.addScene(10, 12, 0x001C | 0x6000),
            //the ball!
            seq.addScene(11, 8, 0x0080 | 0x0000), //d
            seq.addScene(13, 20, 0x0418 | 0x2000),
            //PART 2 - city
            seq.addScene(14, 16, 0x0407 | 0x4000),
            seq.addScene(15, 16, 0x0014 | 0x0000),
            seq.addScene(16, 20, 0x0124 | 0x6000),
            seq.addScene(17, 11, 0x0044 | 0x6000),
            //the ball!
            seq.addScene(18, 13, 0x0080 | 0x0000), //d        
            seq.addScene(20, 20, 0x0818 | 0x4000),
            //PART 3 - destruction
            seq.addScene(80, 16, 0x0041 | 0x2000),
            seq.addScene(21, 16, 0x0200 | 0x6000),
            seq.addScene(33, 16, 0x0074 | 0x0000),
            seq.addScene(22, 16, 0x040c | 0x7000),
            seq.addScene(24, 19, 0x063c | 0x3000),
            seq.addScene(26, 7, 0x0080 | 0x0000), //d
            //outtro - water
            seq.addScene(28, 12, 0x1908 | 0x0000),
            seq.addScene(27, 16, 0x0808 | 0x1000),
            seq.addScene(97, 10, 0x0C08 | 0xB000),
            seq.addScene(96, 8, 0x0080 | 0x0000), //d
            //the ball! 
            //	seq.addScene(30, 12, 0x0018 | 0x4000),
            //	seq.addScene(31, 16, 0x0098 | 0x0000),
            seq.addScene(32, 24, 0x0098 | 0x6000),
            seq.addScene(0, 255, 0x0080 | 0x0000); //d
        var _o = seq.toUniforms();
        console.log(_o);
        var uniforms = new src_1.Uniforms(program, gl, _o);
        console.log("uniforms", uniforms);
        var debug = document.querySelector("#code");
        var seqRunner = function (currentDelta) {
            if (ended)
                return;
            requestAnimationFrame(seqRunner);
            var delta = currentDelta - previousDelta;
            if (fps && delta < 1000 / fps)
                return;
            var t = currentDelta / 1000;
            seq.runner(t, 9586);
            var _seq = seq.toUniforms();
            debug.textContent = JSON.stringify(_seq);
            //uniforms.update("seq.cb[0]",uf.cb[0]);
            // _seq.cb.forEach( (b:any,i:any) => {
            //     uniforms.update(`seq.cb[${i}]`,b)        
            // });
            // uniforms.update("seq.prog",_seq.prog);
            // uniforms.update("seq.scene",_seq.scene);
            // uniforms.update("seq.time",_seq.time);
            // uniforms.update("seq.code",_seq.code);
            // update from object
            previousDelta = currentDelta;
            //
        };
        uniforms.cache.forEach(function (u, k) {
            console.log("key to parse frm graph->", k, u.path);
        });
        uniforms.runAll();
        seqRunner(0);
    });
};
document.addEventListener("DOMContentLoaded", function () {
    console.log("Start...");
    runner();
});
