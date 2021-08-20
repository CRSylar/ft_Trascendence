const fragment = `
#define PI 3.14159265
uniform vec3 uColor;
uniform vec3 uColor2;
uniform float uTime;

varying vec2 vUv;

void main()
{

	float y = step(0.99, abs(sin(vUv.y * 40.0 + uTime)));
	y += step(0.993, abs(sin(vUv.x * 80.0)));
	y = clamp(y, 0.0, 1.0);

	vec3 color = mix(uColor2, uColor, y);

	gl_FragColor = vec4(color , y);
}
`

export default fragment