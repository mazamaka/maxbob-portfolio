import {mkdir,copyFile} from 'node:fs/promises';
await mkdir('dist/vendor',{recursive:true});
for(const [src,dst] of [
 ['node_modules/gsap/dist/gsap.min.js','gsap.min.js'],
 ['node_modules/gsap/dist/ScrollTrigger.min.js','ScrollTrigger.min.js'],
 ['node_modules/gsap/README.md','GSAP-README.md'],
 ['node_modules/three/build/three.module.js','three.module.js'],
 ['node_modules/three/build/three.core.js','three.core.js'],
 ['node_modules/three/LICENSE','THREE-LICENSE.txt']
]) await copyFile(src,'dist/vendor/'+dst);
console.log('Pinned animation libraries copied into the static site.');
