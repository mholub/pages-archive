var SkillParticleSystem = function(objProto, settings) {
	var obj = objProto.clone();	

	// functions
	obj.swapColor = function() {
    	if (obj.userData.colorIdx === 0) {
                obj.userData.colorIdx = 1;
                obj.userData.sharedMaterial.uniforms.color.value.set(obj.userData.color1);
            } else {
                obj.userData.colorIdx = 0;
                obj.userData.sharedMaterial.uniforms.color.value.set(obj.userData.color2);
        }        
    }

    obj.setNextSkill = function(sd, totalLength) {
    	obj.userData.nextSkillData = sd;
    	obj.userData.nextSkillDataTotalLength = totalLength;

    	obj.setSkill(sd, totalLength);
    }

    obj.setSkill = function(sd, totalLength) {
    	obj.userData.alive = sd != undefined;	

		obj.userData.color1 = new THREE.Color().setHSL(THREE.Math.randFloat(0, 1), 1, 0.5);
    	obj.userData.color2 = new THREE.Color().setHSL(THREE.Math.randFloat(0, 1), 1, 0.5);
    	obj.userData.colodIdx = 0;
    	obj.swapColor();  

    	obj.userData.skillData = sd;
    	if (sd) {
                obj.userData.sharedMaterial.uniforms.map.value = sd.data.texture;
                obj.userData.sharedMaterial.uniforms.opacity.value = 1;

                for (var l = obj.children.length - 1; l >= 0; l--) {
	        		var c = obj.children[l];
	        		c.userData.origPos = new THREE.Vector3( 0, 0,  
	        		c.userData.defPos.z + (-totalLength/2 + sd.offset));
		        }
            } else {
                obj.userData.sharedMaterial.uniforms.opacity.value = 0;
                for (var l = obj.children.length - 1; l >= 0; l--) {
	        		var c = obj.children[l];
	        		c.userData.origPos = new THREE.Vector3();
		        }
        }        
    }

    obj.update = function(delta) {
    	if (obj.userData.alive) {
            for (var l = obj.children.length - 1; l >= 0; l--) {
                var p = obj.children[l];

                if (p.userData.state < obj.userData.blowIterations) {
                    
                    p.userData.velocity.multiplyScalar(p.userData.damping);
                    p.position.add(p.userData.velocity.clone().multiplyScalar(delta));

                    if (p.userData.velocity.lengthSq() < obj.userData.speedLimit) {
                        p.userData.state += 1;
                        var v = new THREE.Vector3( THREE.Math.randFloatSpread(50), 0, THREE.Math.randFloatSpread(50) )
                            .normalize();
                        v.multiplyScalar(THREE.Math.randFloat(0.8 * obj.userData.XYSpread, obj.userData.XYSpread));
                        v.y = THREE.Math.randFloatSpread(obj.userData.ZSpread);
                        p.userData.velocity = v.clone();
                    }
                } else {
                	if (!p.userData.origPos)
                		console.log("test", p);

                    p.position.lerp(p.userData.origPos, obj.userData.returnSpeed);
                }
            }
        }
    }

    obj.blow = function() {
    	obj.userData.alive = true;
    	obj.userData.state = 1;
    	for (var l = obj.children.length - 1; l >= 0; l--) {
        	var p = obj.children[l];        	
        	p.userData.damping = settings.damping;
        	p.userData.state = 0;
    	}
    }

    obj.userData.speedLimit = settings['speed limit'];
    obj.userData.XYSpread = settings['XY Spread'];
    obj.userData.ZSpread = settings['Z Spread'];
    obj.userData.returnSpeed = settings['return speed'];

	obj.position.z = 0.5;
    obj.position.y = 0.1;

    obj.rotation.x = Math.PI/2;
    obj.rotation.y = Math.PI/2;

    var k = 0.03;
    obj.scale.set(k, k, k);

    var uniforms = THREE.UniformsUtils.clone(THREE.DiscardShader.uniforms);

    var mat = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: THREE.DiscardShader.vertexShader,
        fragmentShader: THREE.DiscardShader.fragmentShader,
        transparent: true,
        //wireframe: true,
    } );

    obj.traverse(function(obj) {
        if (obj instanceof THREE.Mesh) {
            obj.material = mat;
        }
    });
    obj.userData.sharedMaterial = mat;

	obj.userData.blowIterations = 4;
	obj.userData.alive = false;
	obj.userData.state = 1;
    for (var l = obj.children.length - 1; l >= 0; l--) {
        var c = obj.children[l];
        c.userData.state = 0;
        c.userData.defPos = c.position.clone();        
        c.userData.damping = 0.92;
        c.userData.velocity = new THREE.Vector3();
        c.position = new THREE.Vector3();//new THREE.Vector3( THREE.Math.randFloat(-50, 50), THREE.Math.randFloat(-50, 50), THREE.Math.randFloat(-50, 50) );
    }

    setInterval(function() {
        //if (!obj.userData.state == 1) {
            obj.swapColor();
        //}        
    }, 1000);    

    return obj;
}