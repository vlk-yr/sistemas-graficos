
    function DroneCameraControl(initialPos){

        let DELTA_TRASLACION=0.1;        
        let DELTA_ROTACION=0.02;        
        let FACTOR_INERCIA=0.05;

        let vec3=glMatrix.vec3;
        let mat4=glMatrix.mat4;

        if (!initialPos) initialPos=[0,0,0];

        let position=vec3.fromValues(initialPos[0],initialPos[1],initialPos[2]);
        let rotation=vec3.create();

        let worldMatrix=mat4.create();

        let camInitialState={
            xVel:0,
            zVel:0,
            yVel:0,
            xVelTarget:0,
            zVelTarget:0,
            yVelTarget:0,

            yRotVelTarget:0,
            yRotVel:0,
            zRotVelTarget:0,
            zRotVel:0,
            xRotVelTarget:0,
            xRotVel:0,
            
            rightAxisMode:"move"
        }

        let camState=Object.assign({},camInitialState);

        
        // Eventos de teclado **********************************************

        document.addEventListener("keydown",function(e){
                
            /*
                ArrowUp: move forward
                ArrowDown: move backward
                ArrowLeft: move left
                ArrowRight: move right
                r: reset
                t: stop
                8: move up
                5: move down
                4: rotate left
                6: rotate right

            */

            switch ( e.key ) {

                case "ArrowUp": // forward
                    camState.zVelTarget=DELTA_TRASLACION; break;
                case "ArrowDown": // backward
                    camState.zVelTarget=-DELTA_TRASLACION; break; 

                case "ArrowLeft": // left
                    camState.xVelTarget=DELTA_TRASLACION;break;
                case "ArrowRight": // right
                    camState.xVelTarget=-DELTA_TRASLACION; break;   

                case "8": // up
                    camState.yVelTarget=DELTA_TRASLACION;break;
                case "5": // down
                    camState.yVelTarget=-DELTA_TRASLACION; break;        
   
                case "4": // rotate left
                    camState.yRotVelTarget=DELTA_ROTACION; break;                
                case "6": // rotate right
                    camState.yRotVelTarget=-DELTA_ROTACION; break;
                /*           
                case "s":
                    camState.xRotVelTarget=-DELTA_ROTACION;break;                                 
                case "w": 
                    camState.xRotVelTarget=DELTA_ROTACION;break;
                */             
                case "r": // reset
                    rotation=vec3.create();
                    position=vec3.fromValues(initialPos[0],initialPos[1],initialPos[2]);
                    camState=Object.assign({},camInitialState);
                    break;

                case "t": // stop
                    rotation=vec3.create();                    
                    camState=Object.assign({},camInitialState);
                    break;                    
            }               
        })

        document.addEventListener("keyup",function(e){

            switch ( e.key ) 
            {
                case "ArrowUp":  case "ArrowDown":
                    camState.zVelTarget=0; break;
                
                case "ArrowLeft": case "ArrowRight":
                    camState.xVelTarget=0; break;  

                case "8": case "5": 
                    camState.yVelTarget=0;break;
  
                case "4": 
                    camState.yRotVelTarget=0; break;
                case "6": 
                    camState.yRotVelTarget=0; break;
                    /*
                case "w": 
                    camState.xRotVelTarget=0;break;  

                case "s":
                    camState.xRotVelTarget=0;break;                           
                    */
            }                 
        })

        this.update=function(){
            
            camState.xVel+=(camState.xVelTarget-camState.xVel)*FACTOR_INERCIA;
            camState.yVel+=(camState.yVelTarget-camState.yVel)*FACTOR_INERCIA;
            camState.zVel+=(camState.zVelTarget-camState.zVel)*FACTOR_INERCIA;

            camState.xRotVel+=(camState.xRotVelTarget-camState.xRotVel)*FACTOR_INERCIA;
            camState.yRotVel+=(camState.yRotVelTarget-camState.yRotVel)*FACTOR_INERCIA;
            //camState.zRotVel+=(camState.zRotVelTarget-camState.zRotVel)*FACTOR_INERCIA;

            let translation=vec3.fromValues(-camState.xVel,camState.yVel,-camState.zVel);            

            let rotIncrement=vec3.fromValues(camState.xRotVel,camState.yRotVel,camState.zRotVel);            
            vec3.add(rotation,rotation,rotIncrement);

            rotation[0]=Math.min(Math.PI/8,Math.max(-Math.PI/8,rotation[0]));
			
            let rotationMatrix=mat4.create();		

            mat4.rotateX(rotationMatrix,rotationMatrix,rotation[0]);

            let yAxis=vec3.fromValues(0,1,0);
            let xRotation=mat4.create();
            mat4.rotateX(xRotation,xRotation,rotation[0]);
            vec3.transformMat4(yAxis,yAxis,xRotation);

            mat4.rotate(rotationMatrix,rotationMatrix,rotation[1],yAxis);
            
            //mat4.rotateY(rotationMatrix,rotationMatrix,rotation[1]);
            //mat4.rotateZ(rotationMatrix,rotationMatrix,rotation[2]);

            vec3.transformMat4(translation,translation,rotationMatrix);
            vec3.add(position,position,translation);

            worldMatrix=mat4.create();
            mat4.translate(worldMatrix,worldMatrix,position);        
            mat4.multiply(worldMatrix,worldMatrix,rotationMatrix);
        }

        this.getViewMatrix=function(){

            let m=mat4.clone(worldMatrix);            
            mat4.invert(m,m);
            return m;
        }

        this.getMatrix=function(){

            return worldMatrix;

        }
    }
