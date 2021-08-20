const fragment = `
#define PI 3.14159265
uniform vec3 uColor;

varying vec2 vUv;

void main()
{
    float x = step(0.95, sin(vUv.x * 40.5 * PI));    
    float y = step(0.95, sin(vUv.y * 20.5 * PI));

    float strength = clamp(x + y, 0.0, 1.0);
    
//    float x = -abs(sin(vUv.x * 60.0)) + 1.0;    
//    float y = -abs(sin(vUv.y * 30.0)) + 1.0;
//    float strength = clamp(pow(x , 4.0) + pow(y , 4.0), 0.0, 1.0);
    
     vec3 color = uColor * strength;
    gl_FragColor = vec4(color , strength);
}
`

export default fragment